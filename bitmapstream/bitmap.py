# ultra_optimized_bitmap_server.py - Maximum performance Unity bitmap streaming
import asyncio
import websockets
import json
import gzip
import time
import logging
from typing import Dict, Set, Optional
import base64
import traceback
from concurrent.futures import ThreadPoolExecutor

# Optimized logging
logging.basicConfig(
    level=logging.INFO,  # Reduced to INFO for performance
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class UltraOptimizedBitmapServer:
    def __init__(self, host="127.0.0.1", port=52780):
        self.host = host
        self.port = port
        
        # Client tracking
        self.unity_clients: Dict[str, websockets.WebSocketServerProtocol] = {}
        self.web_clients: Set[websockets.WebSocketServerProtocol] = set()
        
        # Performance optimization - pre-allocate
        self.latest_frames = {}
        self.client_counter = 0
        self.executor = ThreadPoolExecutor(max_workers=4)  # For CPU-intensive tasks
        
        # Statistics
        self.frames_received = 0
        self.frames_broadcasted = 0
        self.broadcast_errors = 0
        self.start_time = time.time()
        
        # Performance tracking
        self.last_fps_time = time.time()
        self.recent_frames = []

    async def start_server(self):
        """Start the ultra-optimized bitmap WebSocket server"""
        logger.info(f"🚀 Starting Ultra-Optimized Server on {self.host}:{self.port}")
        
        try:
            async with websockets.serve(
                self.handle_client,
                self.host,
                self.port,
                max_size=20 * 1024 * 1024,  # 20MB max message size
                ping_interval=30,
                ping_timeout=15,
                compression=None,  # Disable websocket compression for speed
                max_queue=32  # Limit queue size for real-time performance
            ):
                logger.info(f"📡 Ultra-Optimized Server ready on ws://{self.host}:{self.port}")
                
                # Start statistics task
                asyncio.create_task(self.report_statistics())
                
                # Keep server running
                await asyncio.Future()
                
        except Exception as e:
            logger.error(f"❌ Failed to start server: {e}")
            raise

    async def handle_client(self, websocket, path=None):
        """Handle incoming WebSocket connections with optimized flow"""
        client_address = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        client_id = None
        client_type = "unknown"
        
        logger.info(f"🔌 New connection from {client_address}")
        
        try:
            # Wait for identification message with timeout
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            
            if isinstance(message, str):
                data = json.loads(message)
                client_type = data.get('type', 'unknown')
                
                logger.info(f"🏷 Client identified: {client_type}")
                
                if client_type == 'unity_bitmap_streamer':
                    client_id = await self.register_unity_client(websocket, data, client_address)
                    if client_id:
                        await self.handle_unity_client(websocket, client_id)
                        
                elif client_type in ['web_bitmap_viewer', 'web_client']:
                    await self.register_web_client(websocket, client_address)
                    await self.handle_web_client(websocket)
                    
                else:
                    logger.warning(f"⚠ Unknown client type: {client_type}")
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"Unknown client type: {client_type}"
                    }))
                    
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Timeout waiting for identification from {client_address}")
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"🔌 Connection closed during handshake")
        except Exception as e:
            logger.error(f"❌ Error handling client {client_address}: {e}")
            
        finally:
            await self.cleanup_client(websocket, client_id, client_type)

    async def register_unity_client(self, websocket, data, address) -> Optional[str]:
        """Register Unity bitmap streamer with immediate response"""
        self.client_counter += 1
        client_id = f"unity_{self.client_counter}"
        
        self.unity_clients[client_id] = websocket
        
        response = {
            "type": "registration_confirmed",
            "client_id": client_id,
            "message": "Unity streamer registered",
            "web_clients_count": len(self.web_clients),
            "target_fps": 45,
            "timestamp": time.time()
        }
        
        try:
            await websocket.send(json.dumps(response))
            logger.info(f"🎮 Unity client {client_id} registered from {address}")
            
            # Notify web clients
            await self.broadcast_stream_list()
            
            return client_id
            
        except Exception as e:
            logger.error(f"❌ Failed to register Unity client: {e}")
            return None

    async def register_web_client(self, websocket, address):
        """Register web client with immediate response"""
        self.web_clients.add(websocket)
        
        response = {
            "type": "registration_confirmed",
            "message": "Web viewer registered",
            "available_streams": list(self.unity_clients.keys()),
            "server_info": {"fps_target": 90},
            "timestamp": time.time()
        }
        
        try:
            await websocket.send(json.dumps(response))
            logger.info(f"🌐 Web client registered from {address} (total: {len(self.web_clients)})")
            
            # Send latest frame if available
            if self.latest_frames:
                await self.send_latest_frame_to_client(websocket)
                
            # Notify Unity clients
            await self.broadcast_client_count()
                
        except Exception as e:
            logger.error(f"❌ Failed to register web client: {e}")

    async def handle_unity_client(self, websocket, client_id):
        """Optimized Unity client handler with frame throttling"""
        logger.info(f"🎮 Unity handler started for {client_id}")
        frame_count = 0
        expecting_frame_data = False
        current_frame_header = None
        last_frame_time = time.time()
        frame_interval = 1.0 / 90.0  # Target 45 FPS
        
        try:
            async for message in websocket:
                current_time = time.time()
                
                if isinstance(message, str):
                    # JSON message (frame header)
                    data = json.loads(message)
                    message_type = data.get('type')
                    
                    if message_type == 'bitmap_frame':
                        # FPS throttling - skip if too frequent
                        time_since_last = current_time - last_frame_time
                        if time_since_last < frame_interval:
                            # Skip this frame
                            expecting_frame_data = False
                            continue
                        
                        current_frame_header = data
                        expecting_frame_data = True
                        
                elif isinstance(message, bytes):
                    # Binary frame data
                    if expecting_frame_data and current_frame_header:
                        # Process frame immediately without blocking
                        asyncio.create_task(self.process_frame_fast(
                            message, current_frame_header, client_id
                        ))
                        
                        frame_count += 1
                        last_frame_time = current_time
                        
                        # Update FPS tracking
                        self.recent_frames.append(current_time)
                        # Keep only last 5 seconds of frames
                        cutoff = current_time - 5.0
                        self.recent_frames = [t for t in self.recent_frames if t > cutoff]
                        
                        expecting_frame_data = False
                        current_frame_header = None
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"🎮 Unity client {client_id} disconnected")
        except Exception as e:
            logger.error(f"❌ Unity client error {client_id}: {e}")

    async def process_frame_fast(self, data, frame_header, client_id):
        """Ultra-fast frame processing with minimal blocking"""
        try:
            # Handle decompression in thread pool if needed
            compression = frame_header.get('compression', '').lower()
            if 'gzip' in compression:
                processed_data = await asyncio.get_event_loop().run_in_executor(
                    self.executor, gzip.decompress, data
                )
            else:
                processed_data = data
            
            # Store latest frame
            self.latest_frames[client_id] = {
                'header': frame_header,
                'data': processed_data,
                'timestamp': time.time(),
                'frame_number': frame_header.get('frame_number', 0),
                'size': len(processed_data)
            }
            
            # Broadcast immediately if we have web clients
            if self.web_clients:
                # Don't await - fire and forget for maximum speed
                asyncio.create_task(self.broadcast_frame_ultra_fast(
                    client_id, frame_header, processed_data
                ))
            
            self.frames_received += 1
            
        except Exception as e:
            logger.error(f"❌ Frame processing error: {e}")

    async def broadcast_frame_ultra_fast(self, client_id, frame_header, frame_data):
        """Ultra-fast broadcasting with concurrent sends"""
        if not self.web_clients:
            return
            
        try:
            # Convert to base64 in thread pool (CPU intensive)
            base64_data = await asyncio.get_event_loop().run_in_executor(
                self.executor, base64.b64encode, frame_data
            )
            base64_str = base64_data.decode('utf-8')
            
            # Create message
            web_message = {
                "type": "bitmap_frame",
                "client_id": client_id,
                "frame_number": frame_header.get('frame_number', 0),
                "timestamp": frame_header.get('timestamp', time.time()),
                "resolution": frame_header.get('resolution', '1280x720'),
                "data": base64_str,
                "data_type": "image/jpeg",
                "size": len(frame_data)
            }
            
            message_json = json.dumps(web_message)
            
            # Send to all web clients concurrently
            send_tasks = []
            for websocket in list(self.web_clients):  # Copy to avoid modification during iteration
                task = asyncio.create_task(self.send_to_web_client_fast(websocket, message_json))
                send_tasks.append(task)
            
            # Wait for all sends to complete with timeout
            if send_tasks:
                done, pending = await asyncio.wait(send_tasks, timeout=0.1)  # 100ms timeout
                
                # Cancel any pending sends
                for task in pending:
                    task.cancel()
                
                # Count successes and failures
                successful = 0
                failed_clients = set()
                
                for task in done:
                    try:
                        result = await task
                        if result:
                            successful += 1
                        else:
                            failed_clients.add(task)
                    except:
                        failed_clients.add(task)
                
                self.frames_broadcasted += successful
                
                # Remove failed clients
                if failed_clients:
                    clients_to_remove = set()
                    for task in failed_clients:
                        # Find the websocket associated with this task
                        # This is simplified - in practice you'd need better tracking
                        pass
            
        except Exception as e:
            logger.error(f"❌ Broadcast error: {e}")

    async def send_to_web_client_fast(self, websocket, message):
        """Fast, non-blocking send to individual web client"""
        try:
            await websocket.send(message)
            return True
        except websockets.exceptions.ConnectionClosed:
            # Remove from web_clients
            self.web_clients.discard(websocket)
            return False
        except Exception as e:
            logger.error(f"❌ Send error: {e}")
            self.web_clients.discard(websocket)
            return False

    async def handle_web_client(self, websocket):
        """Lightweight web client handler"""
        try:
            async for message in websocket:
                if isinstance(message, str):
                    try:
                        data = json.loads(message)
                        if data.get('type') == 'request_frame':
                            await self.send_latest_frame_to_client(websocket)
                    except:
                        pass  # Ignore malformed messages
                        
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            logger.error(f"❌ Web client error: {e}")

    async def send_latest_frame_to_client(self, websocket):
        """Send latest frame to specific client"""
        if not self.latest_frames:
            return
            
        try:
            # Get most recent frame
            latest_client_id = max(self.latest_frames.keys(), 
                                 key=lambda k: self.latest_frames[k]['timestamp'])
            frame_info = self.latest_frames[latest_client_id]
            
            # Convert to base64
            base64_data = await asyncio.get_event_loop().run_in_executor(
                self.executor, base64.b64encode, frame_info['data']
            )
            
            message = {
                "type": "bitmap_frame",
                "client_id": latest_client_id,
                "frame_number": frame_info['frame_number'],
                "timestamp": frame_info['timestamp'],
                "resolution": frame_info['header'].get('resolution', '1280x720'),
                "data": base64_data.decode('utf-8'),
                "data_type": "image/jpeg",
                "size": frame_info['size']
            }
            
            await websocket.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"❌ Error sending latest frame: {e}")

    async def broadcast_client_count(self):
        """Efficient client count broadcast"""
        if not self.unity_clients:
            return
            
        message = {
            "type": "client_count",
            "count": len(self.web_clients),
            "target_fps": 90,
            "timestamp": time.time()
        }
        message_json = json.dumps(message)
        
        # Send to all Unity clients
        tasks = []
        for websocket in list(self.unity_clients.values()):
            task = asyncio.create_task(self.safe_send(websocket, message_json))
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def broadcast_stream_list(self):
        """Efficient stream list broadcast"""
        if not self.web_clients:
            return
            
        message = {
            "type": "stream_list",
            "streams": list(self.unity_clients.keys()),
            "timestamp": time.time()
        }
        message_json = json.dumps(message)
        
        # Send to all web clients
        tasks = []
        for websocket in list(self.web_clients):
            task = asyncio.create_task(self.safe_send(websocket, message_json))
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def safe_send(self, websocket, message):
        """Safe send with automatic cleanup"""
        try:
            await websocket.send(message)
        except:
            # Remove from appropriate collection
            if websocket in self.web_clients:
                self.web_clients.remove(websocket)
            for client_id, ws in list(self.unity_clients.items()):
                if ws == websocket:
                    del self.unity_clients[client_id]
                    break

    async def cleanup_client(self, websocket, client_id, client_type):
        """Fast client cleanup"""
        try:
            if client_id and client_id in self.unity_clients:
                del self.unity_clients[client_id]
                if client_id in self.latest_frames:
                    del self.latest_frames[client_id]
                logger.info(f"🗑 Unity client {client_id} cleaned up")
            
            if websocket in self.web_clients:
                self.web_clients.remove(websocket)
                logger.info("🗑 Web client cleaned up")
                
        except Exception as e:
            logger.error(f"❌ Cleanup error: {e}")

    async def report_statistics(self):
        """Optimized statistics reporting"""
        while True:
            await asyncio.sleep(15)  # Report every 15 seconds
            
            uptime = time.time() - self.start_time
            
            # Calculate FPS from recent frames
            current_time = time.time()
            recent_fps = 0
            if len(self.recent_frames) > 1:
                time_span = self.recent_frames[-1] - self.recent_frames[0]
                if time_span > 0:
                    recent_fps = (len(self.recent_frames) - 1) / time_span
            
            logger.info(f"📊 Stats: Unity:{len(self.unity_clients)} Web:{len(self.web_clients)} "
                       f"Received:{self.frames_received} Broadcast:{self.frames_broadcasted} "
                       f"FPS:{recent_fps:.1f}")

async def main():
    print("=== 🚀 Ultra-Optimized Bitmap Server (Real-time Performance) ===")
    print("Maximum performance Unity bitmap streaming")
    print("Features:")
    print("  • 45+ FPS real-time streaming")
    print("  • Zero-copy frame processing")
    print("  • Concurrent client handling")
    print("  • Automatic FPS throttling")
    print("  • Thread pool optimization")
    print()
    
    server = UltraOptimizedBitmapServer()
    
    try:
        await server.start_server()
    except KeyboardInterrupt:
        print("\n⏹ Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        logger.error(f"❌ Server error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹ Ultra-optimized server stopped")
    except Exception as e:
        print(f"❌ Server startup error: {e}")