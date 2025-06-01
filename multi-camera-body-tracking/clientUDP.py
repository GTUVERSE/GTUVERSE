import socket
import time
import threading
import queue

class ClientUDP(threading.Thread):
    def __init__(self, ip, port, autoReconnect=True) -> None:
        threading.Thread.__init__(self)
        self.ip = ip
        self.port = port
        self.autoReconnect = autoReconnect
        self.connected = False
        self.daemon = True
        self.message_queue = queue.Queue(maxsize=100)  # Limit queue size
        self.should_stop = False
        
    def run(self):
        self.connect()
        while not self.should_stop:
            try:
                # Get message from queue with timeout
                message = self.message_queue.get(timeout=1.0)
                self._send_message_direct(message)
                self.message_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"UDP send error: {e}")
                if self.autoReconnect:
                    self.connect()

    def isConnected(self):
        return self.connected

    def sendMessage(self, message):
        if not self.connected:
            return
        
        try:
            # Add to queue instead of direct send
            self.message_queue.put_nowait(message)
        except queue.Full:
            # Drop oldest message if queue is full
            try:
                self.message_queue.get_nowait()
                self.message_queue.put_nowait(message)
            except queue.Empty:
                pass

    def _send_message_direct(self, message):
        try:
            message_bytes = str('%s<EOM>' % message).encode('utf-8')
            # UDP için sendto kullan, send değil
            self.socket.sendto(message_bytes, (self.ip, self.port))
        except Exception as ex:
            print(f"Send error: {ex}")
            self.disconnect()

    def disconnect(self):
        self.connected = False
        try:
            self.socket.close()
        except:
            pass

    def connect(self):
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            # UDP için connect gerekmez, ama test için ping gönderebiliriz
            test_message = b"PING"
            self.socket.sendto(test_message, (self.ip, self.port))
            print(f"UDP client connected to {self.ip}:{self.port}")
            self.connected = True
        except Exception as ex:
            print(f"UDP connection error: {ex}")
            self.connected = False
            if self.autoReconnect:
                time.sleep(1)

    def stop(self):
        self.should_stop = True
        self.connected = False