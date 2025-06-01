# UDP server for multiple camera feeds
from body import BodyThread
import time
import global_vars
import signal
import sys

# Input ports for camera feeds
INPUT_PORTS = [62700, 62701, 62702, 62703, 62704, 62705, 62706, 62707]

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n🛑 Stopping all threads...")
    global_vars.KILL_THREADS = True
    
    # Stop all threads
    for thread in threads:
        if hasattr(thread, 'stop'):
            thread.stop()
    
    # Wait for threads to finish
    for thread in threads:
        if thread.is_alive():
            thread.join(timeout=2.0)
    
    print("✅ All threads stopped. Exiting...")
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)

print(f"=== MediaPipe Body Processing Server ===")
print(f"Camera input host: {global_vars.HOST}")
print(f"Unity output host: {global_vars.OUTPUT_HOST}")
print(f"Processing {len(INPUT_PORTS)} camera feeds")
print()

# Start a thread for each input port
threads = []
started_threads = 0

for input_port in INPUT_PORTS:
    output_port = input_port + 33
    print(f"Starting thread: Camera feed {input_port} -> Unity {global_vars.OUTPUT_HOST}:{output_port}")
    
    try:
        thread = BodyThread(input_port, output_port)
        thread.start()
        threads.append(thread)
        started_threads += 1
        time.sleep(0.2)  # Small delay between thread starts
    except Exception as e:
        print(f"❌ Failed to start thread for port {input_port}: {e}")

print(f"\n🚀 {started_threads}/{len(INPUT_PORTS)} threads started successfully!")
print("Press Ctrl+C to stop all threads gracefully...")

try:
    # Keep main thread alive and monitor
    while not global_vars.KILL_THREADS:
        time.sleep(1)
        
        # Check if any threads have died
        alive_threads = sum(1 for t in threads if t.is_alive())
        if alive_threads == 0:
            print("⚠️ All processing threads have stopped!")
            break
            
except KeyboardInterrupt:
    signal_handler(signal.SIGINT, None)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    signal_handler(signal.SIGINT, None)