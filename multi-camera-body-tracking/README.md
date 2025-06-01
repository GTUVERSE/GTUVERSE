# Multi-Camera Body Tracking System

A real-time multi-user body pose tracking system using MediaPipe and OpenCV. This system can process up to 8 simultaneous camera feeds and send pose landmark data to Unity applications over UDP.

## 🌟 Features

- **Multi-Camera Support**: Process up to 8 camera feeds simultaneously
- **Real-time Body Tracking**: Uses Google's MediaPipe for accurate pose detection
- **UDP Communication**: Sends processed data to Unity or other applications
- **Optimized Performance**: Efficient frame processing with configurable quality settings
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Landmark Smoothing**: Built-in smoothing algorithm for stable tracking

## 🏗️ System Architecture

```
Camera Feeds (UDP) → Body Processing Server → Unity Application (UDP)
     Port 62700-62707        Python Script        Port 62733-62740
```

The system consists of:
- **Camera Sender**: Captures and sends camera frames via UDP
- **Body Processing Server**: Receives frames, processes pose landmarks, sends to Unity
- **Friend Camera Client**: WebSocket-based camera sharing for remote users

## 📋 Prerequisites

- Python 3.8 or higher
- OpenCV-compatible webcam
- Network connectivity between devices (if using multiple machines)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/multi-camera-body-tracking.git
cd multi-camera-body-tracking

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Edit `global_vars.py` to match your network setup:

```python
# Local receiver IP (where this script runs)
HOST = '192.168.1.100'

# Unity application IP (where to send processed data)
OUTPUT_HOST = '192.168.1.101'

# Camera settings
CAM_INDEX = 0  # Change for different webcam
```

### 3. Run the System

**Start the main processing server:**
```bash
python main.py
```

**Send camera feed (on same or different machine):**
```bash
python camera_sender.py
```

**For remote friends to join:**
```bash
python friend_camera.py
```

## 📁 Project Structure

```
├── main.py              # Main server that starts all processing threads
├── body.py              # Core body tracking and UDP processing logic
├── camera_sender.py     # Sends local camera feed via UDP
├── friend_camera.py     # WebSocket client for remote camera sharing
├── clientUDP.py         # UDP client for sending processed data
├── global_vars.py       # Configuration settings
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── USERGUIDE.md        # Detailed usage instructions
```

## 🔧 Configuration Options

### Network Settings
- `HOST`: IP address for receiving camera feeds
- `OUTPUT_HOST`: IP address for Unity application
- `PORT`: Base port for WebSocket connections (52733)
- `INPUT_PORTS`: UDP ports for camera feeds (62700-62707)

### Performance Settings
- `MODEL_COMPLEXITY`: MediaPipe model complexity (0-2)
- `PROCESS_WIDTH/HEIGHT`: Frame processing resolution
- `SMOOTHING_FACTOR`: Landmark smoothing intensity (0-1)

### Camera Settings
- `CAM_INDEX`: OpenCV camera index
- `FPS`: Target frame rate
- `WIDTH/HEIGHT`: Capture resolution

## 🌐 Network Setup

The system uses the following port configuration:

| Component | Port Range | Protocol | Purpose |
|-----------|------------|----------|---------|
| Camera Input | 62700-62707 | UDP | Receiving camera frames |
| Unity Output | 62733-62740 | UDP | Sending pose data |
| Friend Cameras | 52733 | WebSocket | Remote camera sharing |

## 🔍 Monitoring and Debugging

The system provides real-time performance information:
- Frame rates for each camera feed
- Processing times and queue status
- Connection status for all components

Enable debug mode in `global_vars.py`:
```python
DEBUG = True
DEBUG_PREFIX = 'DEBUG_'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google MediaPipe](https://mediapipe.dev/) for pose detection
- [OpenCV](https://opencv.org/) for computer vision functionality
- Unity Technologies for real-time 3D applications

## 📞 Support

For questions and support:
- Open an issue on GitHub
- Check the [USERGUIDE.md](USERGUIDE.md) for detailed usage instructions
- Review the troubleshooting section in the user guide

## 🔮 Roadmap

- [ ] Add support for hand and face tracking
- [ ] Implement recording and playback functionality  
- [ ] Add web-based monitoring dashboard
- [ ] Support for more output formats (OSC, MQTT)
- [ ] Machine learning-based pose prediction