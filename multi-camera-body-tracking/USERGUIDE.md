# User Guide - Multi-Camera Body Tracking System

This comprehensive guide will help you set up and use the multi-camera body tracking system effectively.

## 📚 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Guide](#installation-guide)
3. [Configuration](#configuration)
4. [Running the System](#running-the-system)
5. [Unity Integration](#unity-integration)
6. [Multi-User Setup](#multi-user-setup)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)
9. [Advanced Features](#advanced-features)

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, or Ubuntu 18.04+
- **Python**: 3.8 or higher
- **RAM**: 4GB (8GB recommended for multiple cameras)
- **CPU**: Dual-core 2.5GHz (Quad-core recommended)
- **Network**: 100 Mbps for local setup, 1 Gbps for multi-machine setup
- **Camera**: USB webcam or built-in camera

### Recommended Requirements
- **CPU**: Intel i5/AMD Ryzen 5 or better
- **RAM**: 16GB for smooth multi-camera operation
- **GPU**: Not required but helps with overall system performance
- **Network**: Gigabit Ethernet for best performance

## 🔧 Installation Guide

### Step 1: Python Installation

Ensure Python 3.8+ is installed:

```bash
# Check Python version
python --version
# or
python3 --version
```

If Python is not installed, download from [python.org](https://python.org).

### Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/multi-camera-body-tracking.git
cd multi-camera-body-tracking
```

### Step 3: Install Dependencies

Create a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install required packages:

```bash
pip install -r requirements.txt
```

### Requirements.txt Content

Create a `requirements.txt` file with:

```
opencv-python>=4.8.0
mediapipe>=0.10.0
numpy>=1.21.0
websockets>=11.0.0
```

## ⚙️ Configuration

### Basic Network Configuration

Edit `global_vars.py` for your network setup:

```python
# Example for single machine setup
HOST = '127.0.0.1'          # Local machine
OUTPUT_HOST = '127.0.0.1'   # Unity on same machine

# Example for multi-machine setup
HOST = '192.168.1.100'      # This computer's IP
OUTPUT_HOST = '192.168.1.101'  # Unity computer's IP
```

### Camera Configuration

```python
CAM_INDEX = 0  # Default camera (usually built-in)
# Try different values if you have multiple cameras:
# 0 = Built-in camera
# 1 = First external USB camera  
# 2 = Second external USB camera

# Custom camera settings (optional)
USE_CUSTOM_CAM_SETTINGS = True
FPS = 30                    # Frame rate
WIDTH = 640                 # Resolution width
HEIGHT = 480                # Resolution height
```

### Performance Configuration

```python
# Processing quality vs performance
MODEL_COMPLEXITY = 1        # 0=Fast, 1=Balanced, 2=Accurate

# Frame processing resolution (lower = faster)
PROCESS_WIDTH = 320
PROCESS_HEIGHT = 240

# Smoothing settings
SMOOTHING_FACTOR = 0.7      # 0=No smoothing, 1=Maximum smoothing
MIN_MOVEMENT_THRESHOLD = 0.001  # Minimum movement to register
```

## 🚀 Running the System

### Scenario 1: Single Machine Setup

Perfect for testing or Unity development on one computer.

1. **Start the processing server:**
   ```bash
   python main.py
   ```

2. **In another terminal, start camera sender:**
   ```bash
   python camera_sender.py
   ```

3. **Start your Unity application** (configured to receive on port 62733)

### Scenario 2: Multi-Machine Setup

For production setups with multiple computers.

**On the processing computer (Server):**
```bash
# Edit global_vars.py first
HOST = '192.168.1.100'      # This computer's IP
OUTPUT_HOST = '192.168.1.101'  # Unity computer's IP

# Start server
python main.py
```

**On camera computers (Clients):**
```bash
# Edit camera_sender.py to point to server
targets = [("192.168.1.100", 62700)]  # Server IP and port

# Start camera sender
python camera_sender.py
```

**On Unity computer:**
Configure Unity to listen on the specified ports (62733-62740).

### Scenario 3: Mixed Local and Remote Cameras

Combine local cameras with remote friends' cameras.

**Host computer:**
```bash
python main.py
python camera_sender.py  # For local camera
```

**Remote friends:**
```bash
python friend_camera.py
# Enter host IP when prompted
# Enter username when prompted
```

## 🎮 Unity Integration

### Unity Setup

1. **Create UDP receiver script in Unity:**

```csharp
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;

public class PoseDataReceiver : MonoBehaviour
{
    public int port = 62733;
    private UdpClient udpClient;
    private Thread receiveThread;
    private bool isReceiving = false;
    
    // Array to store 33 pose landmarks
    public Vector3[] poseData = new Vector3[33];
    
    void Start()
    {
        StartReceiving();
    }
    
    void StartReceiving()
    {
        try
        {
            udpClient = new UdpClient(port);
            receiveThread = new Thread(ReceiveData);
            receiveThread.IsBackground = true;
            receiveThread.Start();
            isReceiving = true;
            Debug.Log($"Started receiving pose data on port {port}");
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to start UDP receiver: {e.Message}");
        }
    }
    
    void ReceiveData()
    {
        while (isReceiving)
        {
            try
            {
                IPEndPoint remoteEndPoint = new IPEndPoint(IPAddress.Any, port);
                byte[] data = udpClient.Receive(ref remoteEndPoint);
                string message = Encoding.UTF8.GetString(data);
                
                // Remove <EOM> marker
                message = message.Replace("<EOM>", "");
                
                // Parse pose data
                ParsePoseData(message);
            }
            catch (Exception e)
            {
                if (isReceiving)
                    Debug.LogError($"UDP receive error: {e.Message}");
            }
        }
    }
    
    void ParsePoseData(string data)
    {
        string[] lines = data.Split('\n');
        
        foreach (string line in lines)
        {
            if (string.IsNullOrEmpty(line)) continue;
            
            string[] parts = line.Split('|');
            if (parts.Length == 4)
            {
                int index = int.Parse(parts[0]);
                float x = float.Parse(parts[1]);
                float y = float.Parse(parts[2]);
                float z = float.Parse(parts[3]);
                
                if (index >= 0 && index < 33)
                {
                    poseData[index] = new Vector3(x, y, z);
                }
            }
        }
    }
    
    void OnDestroy()
    {
        isReceiving = false;
        if (receiveThread != null)
            receiveThread.Abort();
        if (udpClient != null)
            udpClient.Close();
    }
}
```

### Pose Landmark Mapping

MediaPipe provides 33 body landmarks:

```
0: Nose              17: Left pinky
1: Left eye inner    18: Right wrist  
2: Left eye          19: Right thumb
3: Left eye outer    20: Right index
4: Right eye inner   21: Right middle
5: Right eye         22: Right ring
6: Right eye outer   23: Right pinky
7: Left ear          24: Left hip
8: Right ear         25: Right hip
9: Mouth left        26: Left knee
10: Mouth right      27: Right knee
11: Left shoulder    28: Left ankle
12: Right shoulder   29: Right ankle
13: Left elbow       30: Left heel
14: Right elbow      31: Right heel
15: Left wrist       32: Left foot index
16: Left thumb       33: Right foot index
```

## 👥 Multi-User Setup

### Setting Up Multiple Camera Feeds

Each user needs a unique input port:

```python
# In global_vars.py
INPUT_PORTS = [62700, 62701, 62702, 62703, 62704, 62705, 62706, 62707]

# Output ports are automatically calculated as input_port + 33
# So: 62733, 62734, 62735, 62736, 62737, 62738, 62739, 62740
```

### Assigning Users to Ports

**User 1 (Host):**
```python
# camera_sender.py
targets = [("192.168.1.100", 62700)]  # Port 62700 → Unity port 62733
```

**User 2:**
```python
# camera_sender.py  
targets = [("192.168.1.100", 62701)]  # Port 62701 → Unity port 62734
```

**User 3 (using friend_camera.py):**
The WebSocket client automatically assigns available ports.

### Unity Multi-User Setup

Create multiple PoseDataReceiver components in Unity, each listening on different ports:

```csharp
// Player 1: Port 62733
// Player 2: Port 62734
// Player 3: Port 62735
// etc.
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "No frames received" Error

**Symptoms:** Server starts but shows no frame statistics.

**Solutions:**
- Check if camera_sender.py is running
- Verify IP addresses in global_vars.py match your network
- Try different camera index (CAM_INDEX = 1, 2, etc.)
- Check firewall settings

#### 2. High CPU Usage

**Symptoms:** System becomes slow, high CPU usage.

**Solutions:**
- Reduce MODEL_COMPLEXITY to 0
- Lower PROCESS_WIDTH and PROCESS_HEIGHT
- Reduce FPS in camera settings
- Close unnecessary applications

#### 3. Choppy/Jerky Movement

**Symptoms:** Avatar movements are not smooth.

**Solutions:**
- Increase SMOOTHING_FACTOR (try 0.8-0.9)
- Check network latency
- Ensure stable framerate from camera
- Verify Unity is receiving data consistently

#### 4. Connection Refused Errors

**Symptoms:** UDP connection errors in logs.

**Solutions:**
- Check firewall settings
- Verify IP addresses are correct
- Ensure no other applications are using the same ports
- Try different port numbers

#### 5. Camera Not Found

**Symptoms:** "Camera not found" or black screen.

**Solutions:**
```bash
# Test camera with OpenCV
python -c "import cv2; cap = cv2.VideoCapture(0); print(cap.isOpened()); cap.release()"

# Try different camera indices
# 0, 1, 2, etc.
```

### Debug Mode

Enable detailed logging:

```python
# In global_vars.py
DEBUG = True
```

This will show:
- Frame reception rates
- Processing times
- Network statistics
- Error details

### Network Testing

Test UDP connectivity:

```bash
# On receiver machine
nc -u -l 62700

# On sender machine  
echo "test" | nc -u [receiver_ip] 62700
```

## 🚀 Performance Optimization

### Hardware Optimization

1. **CPU Priority:**
   ```bash
   # On Windows (run as administrator)
   wmic process where name="python.exe" CALL setpriority "high priority"
   
   # On Linux/macOS
   sudo nice -n -10 python main.py
   ```

2. **Network Optimization:**
   - Use wired Ethernet instead of WiFi
   - Reduce network traffic on the same subnet
   - Consider dedicated network for tracking data

### Software Optimization

1. **Processing Resolution:**
   ```python
   # Lower resolution = higher performance
   PROCESS_WIDTH = 240   # Instead of 320
   PROCESS_HEIGHT = 180  # Instead of 240
   ```

2. **Model Complexity:**
   ```python
   MODEL_COMPLEXITY = 0  # Fastest, least accurate
   ```

3. **Queue Management:**
   ```python
   MAX_QUEUE_SIZE = 1    # Reduce latency
   ```

### Monitoring Performance

The system displays performance metrics:
```
DEBUG_Port 62700: 29.8 FPS, Queue: 1
DEBUG_Port 62700: 30.2 FPS, avg process: 12.3ms
```

Ideal values:
- FPS: 25-30 for smooth tracking
- Process time: <20ms
- Queue size: 0-2

## 🔬 Advanced Features

### Custom Smoothing Algorithm

Modify the LandmarkSmoother class in body.py:

```python
class CustomSmoother(LandmarkSmoother):
    def __init__(self):
        super().__init__()
        self.prediction_buffer = deque(maxlen=5)
    
    def smooth_with_prediction(self, landmarks):
        # Add your custom smoothing logic
        # Consider velocity, acceleration, etc.
        pass
```

### Recording and Playback

Add recording functionality:

```python
# In BodyThread class
def record_session(self, filename):
    with open(filename, 'w') as f:
        # Write landmark data with timestamps
        pass

def playback_session(self, filename):
    # Read and replay recorded data
    pass
```

### Custom Output Formats

Support for other protocols:

```python
# OSC (Open Sound Control) output
def send_osc_data(self, landmarks):
    # Convert to OSC format
    pass

# MQTT output  
def send_mqtt_data(self, landmarks):
    # Publish to MQTT broker
    pass
```

### Web Dashboard

Create a monitoring web interface:

```python
# Simple Flask dashboard
from flask import Flask, render_template
import json

app = Flask(__name__)

@app.route('/status')
def get_status():
    return json.dumps({
        'active_cameras': len(active_threads),
        'fps_stats': fps_statistics,
        'system_health': 'OK'
    })
```

## 📊 API Reference

### Global Variables

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| HOST | str | Receiver IP address | '192.168.162.198' |
| OUTPUT_HOST | str | Unity output IP | '192.168.162.160' |
| PORT | int | Base WebSocket port | 52733 |
| INPUT_PORTS | list | Camera input ports | [62700-62707] |
| MODEL_COMPLEXITY | int | MediaPipe model quality (0-2) | 0 |
| SMOOTHING_FACTOR | float | Landmark smoothing (0-1) | 0.7 |

### Data Format

Pose data is sent as text over UDP:
```
0|0.123456|-0.567890|0.234567
1|0.234567|-0.678901|0.345678
...
32|0.345678|-0.789012|0.456789
```

Format: `landmark_index|x|y|z`

### Coordinate System

- X: Left-right (negative = left, positive = right)
- Y: Up-down (negative = down, positive = up)  
- Z: Forward-back (negative = back, positive = forward)
- Origin: Center of the detected person
- Units: Normalized coordinates relative to person size

## 📞 Support and Community

### Getting Help

1. **Documentation:** Check this guide first
2. **Issues:** Open GitHub issues for bugs
3. **Discussions:** Use GitHub Discussions for questions
4. **Discord:** Join our community Discord server

### Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Reporting Bugs

Include in your bug report:
- Operating system and version
- Python version
- Full error messages
- Configuration files
- Steps to reproduce

### Feature Requests

Open an issue with:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (if applicable)

---

**Happy tracking!** 🎭

For more advanced usage and development information, check the source code comments and docstrings.