import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from clientUDP import ClientUDP
import cv2
import threading
import time
import global_vars
import struct
import socket
import numpy as np
from collections import deque
import queue

# Debug prefix for easy removal
DEBUG_PREFIX = "DEBUG_"

# Performance constants - Optimized
MAX_BUFFER_SIZE = 256 * 1024  # Reduced buffer size
PROCESS_WIDTH = 320
PROCESS_HEIGHT = 240
MAX_QUEUE_SIZE = 2  # Further reduced for lower latency

# Smoothing parameters
SMOOTHING_FACTOR = 0.7
MIN_MOVEMENT_THRESHOLD = 0.001

class FrameBuffer:
    def __init__(self, max_size=MAX_BUFFER_SIZE):
        self.buffer = bytearray()
        self.max_size = max_size
        self.lock = threading.Lock()

    def add(self, data):
        with self.lock:
            if len(self.buffer) + len(data) > self.max_size:
                self.clear_unsafe()
            self.buffer.extend(data)

    def clear(self):
        with self.lock:
            self.clear_unsafe()
    
    def clear_unsafe(self):
        self.buffer = bytearray()

    def get_copy(self):
        with self.lock:
            return bytes(self.buffer)

class UDPFrameReceiver(threading.Thread):
    def __init__(self, port):
        super().__init__()
        self.port = port
        self.frame_queue = queue.Queue(maxsize=MAX_QUEUE_SIZE)
        self.isRunning = False
        self.daemon = True
        self.sock = None
        self.should_stop = False
        
        # Initialize socket
        self.init_socket()
        
        self.frame_buffer = FrameBuffer()
        self.frame_count = 0
        self.last_stats_time = time.time()
        print(f"{DEBUG_PREFIX}UDP receiver initialized on port {self.port}")

    def init_socket(self):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            # Optimize socket settings
            self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 256 * 1024)
            self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.sock.settimeout(0.5)  # Longer timeout
            self.sock.bind((global_vars.HOST, self.port))
            print(f"{DEBUG_PREFIX}Socket bound to {global_vars.HOST}:{self.port}")
        except Exception as e:
            print(f"{DEBUG_PREFIX}Failed to bind to port {self.port}: {e}")
            raise

    def run(self):
        self.isRunning = True
        consecutive_timeouts = 0
        max_timeouts = 20  # 10 seconds with 0.5s timeout
        
        while not self.should_stop and consecutive_timeouts < max_timeouts:
            try:
                data, addr = self.sock.recvfrom(65536)
                consecutive_timeouts = 0
                
                if data.startswith(b'FRAME_START'):
                    self.frame_buffer.clear()
                elif data.startswith(b'FRAME_END'):
                    frame_data = self.frame_buffer.get_copy()
                    if len(frame_data) > 0:
                        try:
                            self.frame_queue.put_nowait(frame_data)
                        except queue.Full:
                            # Remove oldest frame and add new one
                            try:
                                self.frame_queue.get_nowait()
                                self.frame_queue.put_nowait(frame_data)
                            except queue.Empty:
                                pass
                    self.frame_count += 1
                else:
                    self.frame_buffer.add(data)

                # Print stats less frequently
                current_time = time.time()
                if current_time - self.last_stats_time >= 3:
                    fps = self.frame_count / 3
                    queue_size = self.frame_queue.qsize()
                    print(f"{DEBUG_PREFIX}Port {self.port}: {fps:.1f} FPS, Queue: {queue_size}")
                    self.frame_count = 0
                    self.last_stats_time = current_time

            except socket.timeout:
                consecutive_timeouts += 1
                continue
            except Exception as e:
                print(f"{DEBUG_PREFIX}UDP error on port {self.port}: {e}")
                consecutive_timeouts += 1
                
        self.cleanup()

    def cleanup(self):
        self.isRunning = False
        if self.sock:
            self.sock.close()
        print(f"{DEBUG_PREFIX}UDP receiver stopped on port {self.port}")

    def get_frame(self):
        try:
            frame_data = self.frame_queue.get_nowait()
            np_arr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is not None:
                frame = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT), 
                                 interpolation=cv2.INTER_LINEAR)
            return frame
        except queue.Empty:
            return None
        except Exception as e:
            print(f"{DEBUG_PREFIX}Frame decode error on port {self.port}: {e}")
            return None

    def stop(self):
        self.should_stop = True

class LandmarkSmoother:
    def __init__(self, smoothing_factor=SMOOTHING_FACTOR):
        self.smoothing_factor = smoothing_factor
        self.previous_landmarks = None
        self.stable_landmarks = None
        self.movement_threshold = MIN_MOVEMENT_THRESHOLD
        self.lock = threading.Lock()

    def smooth(self, landmarks):
        with self.lock:
            if landmarks is None:
                return self.stable_landmarks

            current_landmarks = []
            for landmark in landmarks.landmark:
                current_landmarks.append([landmark.x, landmark.y, landmark.z])

            if self.previous_landmarks is None:
                self.previous_landmarks = current_landmarks
                self.stable_landmarks = current_landmarks
                return landmarks

            # Apply smoothing
            smoothed_landmarks = []
            for i, (curr, prev) in enumerate(zip(current_landmarks, self.previous_landmarks)):
                smoothed = []
                for j in range(3):  # x, y, z
                    movement = abs(curr[j] - prev[j])
                    
                    if movement > self.movement_threshold:
                        smoothed_value = prev[j] * self.smoothing_factor + curr[j] * (1 - self.smoothing_factor)
                    else:
                        smoothed_value = prev[j]
                        
                    smoothed.append(smoothed_value)
                smoothed_landmarks.append(smoothed)

            self.previous_landmarks = smoothed_landmarks
            self.stable_landmarks = smoothed_landmarks

            # Create new landmark list with smoothed values
            smoothed_result = type(landmarks)()
            for i, smoothed_point in enumerate(smoothed_landmarks):
                landmark = smoothed_result.landmark.add()
                landmark.x = smoothed_point[0]
                landmark.y = smoothed_point[1] 
                landmark.z = smoothed_point[2]

            return smoothed_result

class BodyThread(threading.Thread):
    def __init__(self, input_port, output_port):
        super().__init__()
        self.input_port = input_port
        self.output_port = output_port
        self.receiver = None
        self.client = None
        self.smoother = LandmarkSmoother()
        self.should_stop = False
        self.daemon = True
        
        # Performance monitoring
        self.frame_count = 0
        self.last_stats_time = time.time()
        self.processing_times = deque(maxlen=30)
        
        print(f"{DEBUG_PREFIX}Body thread initialized: {input_port} -> {global_vars.OUTPUT_HOST}:{output_port}")

    def run(self):
        try:
            # Initialize components
            self.receiver = UDPFrameReceiver(self.input_port)
            self.client = ClientUDP(global_vars.OUTPUT_HOST, self.output_port)
            
            # Start threads
            self.receiver.start()
            self.client.start()
            
            # Wait a bit for initialization
            time.sleep(0.5)
            
            mp_pose = mp.solutions.pose

            # Optimized pose settings
            with mp_pose.Pose(
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
                model_complexity=0,
                static_image_mode=False,
                enable_segmentation=False,
                smooth_landmarks=True
            ) as pose:
                print(f"{DEBUG_PREFIX}Pose model started on port {self.input_port}")

                consecutive_failures = 0
                max_failures = 50
                no_frame_count = 0
                max_no_frame = 100  # Exit if no frames for too long

                while not self.should_stop and consecutive_failures < max_failures and no_frame_count < max_no_frame:
                    frame = self.receiver.get_frame()
                    if frame is None:
                        time.sleep(0.01)
                        no_frame_count += 1
                        continue

                    no_frame_count = 0
                    consecutive_failures = 0
                    start_time = time.time()

                    try:
                        # Process frame
                        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        image.flags.writeable = False
                        results = pose.process(image)

                        if results.pose_world_landmarks:
                            smoothed_landmarks = self.smoother.smooth(results.pose_world_landmarks)
                            
                            if smoothed_landmarks:
                                # Build data string more efficiently
                                data_parts = []
                                for i in range(33):
                                    landmark = smoothed_landmarks.landmark[i]
                                    data_parts.append(f"{i}|{landmark.x:.6f}|{landmark.y:.6f}|{landmark.z:.6f}")
                                
                                data_string = "\n".join(data_parts) + "\n"
                                self.send_data(data_string)

                    except Exception as e:
                        print(f"{DEBUG_PREFIX}Processing error on port {self.input_port}: {e}")
                        consecutive_failures += 1

                    # Performance monitoring
                    process_time = time.time() - start_time
                    self.processing_times.append(process_time)
                    self.frame_count += 1

                    # Print stats less frequently
                    current_time = time.time()
                    if current_time - self.last_stats_time >= 5:
                        avg_time = sum(self.processing_times) / len(self.processing_times) if self.processing_times else 0
                        fps = self.frame_count / 5
                        print(f"{DEBUG_PREFIX}Port {self.input_port}: {fps:.1f} FPS, avg process: {avg_time*1000:.1f}ms")
                        self.frame_count = 0
                        self.last_stats_time = current_time

        except Exception as e:
            print(f"{DEBUG_PREFIX}Body thread error on port {self.input_port}: {e}")
        finally:
            self.cleanup()

    def send_data(self, message):
        try:
            if self.client and self.client.isConnected():
                self.client.sendMessage(message)
        except Exception as e:
            print(f"{DEBUG_PREFIX}Send error to {global_vars.OUTPUT_HOST}:{self.output_port}: {e}")

    def stop(self):
        self.should_stop = True

    def cleanup(self):
        print(f"{DEBUG_PREFIX}Cleaning up Body thread: {self.input_port}")
        
        if self.receiver:
            self.receiver.stop()
        
        if self.client:
            self.client.stop()
            
        print(f"{DEBUG_PREFIX}Body thread stopped: {self.input_port}")