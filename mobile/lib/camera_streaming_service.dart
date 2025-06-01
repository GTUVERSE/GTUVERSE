import 'dart:io';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:image/image.dart' as img;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:gtuverse_mobile_app/config.dart';

class CameraStreamingService {
  CameraController? _cameraController;
  RawDatagramSocket? _udpSocket;
  bool _isStreaming = false;
  bool _isSending = false;
  final int userId;
  final int roomId;
  CameraStreamingService({required this.userId, required this.roomId});  

  // Server settings
  static const int MAX_PACKET_SIZE = 65000;  // Match Python's MAX_UDP_PACKET_SIZE
  
  CameraController? get controller => _cameraController;

  Future<void> initializeCamera() async {
    print("[CAMERA] Initializing camera...");
    final cameras = await availableCameras();
    
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );

    _cameraController = CameraController(
      frontCamera,
      ResolutionPreset.low,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.yuv420,
    );

    await _cameraController!.initialize();
    print("[CAMERA] Camera initialized: ${_cameraController!.value.previewSize}");
  }

  Future<void> connectToServer() async {
    print("[CAMERA] Binding UDP socket...");
    _udpSocket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
    print("[CAMERA] UDP socket bound: ${_udpSocket!.address.address}:${_udpSocket!.port}");
  }

  Future<int?> fetchUserPlace(int userId) async {
    final url = Uri.parse(Config.buildUrl('/users/$userId/place'));
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['place'];
      } else {
        print('[ERROR] Failed to fetch place. Status: ${response.statusCode}');
      }
    } catch (e) {
      print('[ERROR] Exception fetching place: $e');
    }
    return null;
  }

  Future<String?> fetchRoomIp(int roomId) async {
    final url = Uri.parse(Config.buildUrl('/rooms/$roomId/api'));
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['api'];
      } else {
        print('[ERROR] Failed to fetch room IP. Status: ${response.statusCode}');
      }
    } catch (e) {
      print('[ERROR] Exception fetching room IP: $e');
    }
    return null;
  }

  Future<void> startStreaming() async {
    if (_cameraController == null || _udpSocket == null) {
      print("[ERROR] Camera or UDP socket not initialized.");
      throw Exception('Camera or UDP socket not initialized');
    }

    if (!_cameraController!.value.isInitialized) {
      await _cameraController!.initialize();
    }

    _isStreaming = true;
    print("[CAMERA] Starting camera stream...");

    DateTime _lastFrameTime = DateTime.now();
    final Duration _frameInterval = Duration(milliseconds: 10); // ~100 FPS

    _cameraController!.startImageStream((CameraImage image) async {
      if (!_isStreaming) return;

      final now = DateTime.now();
      if (now.difference(_lastFrameTime) < _frameInterval) return;
      _lastFrameTime = now;

      if (_isSending) return;
      _isSending = true;

      try {
        final jpegBytes = await _convertToJpeg(image);
        if (jpegBytes != null) {
          await _sendFrame(jpegBytes);
        }
      } catch (e) {
        print("[ERROR] Frame processing error: $e");
      } finally {
        _isSending = false;
      }
    });
  }

  Future<void> _sendFrame(Uint8List jpegData) async {
    try {
      // Send frame start marker
      final frameStart = Uint8List.fromList([70, 82, 65, 77, 69, 95, 83, 84, 65, 82, 84]); // 'FRAME_START'
      _udpSocket!.send(frameStart, InternetAddress(Config.portIpValue), int.parse(Config.portNumberValue));

      // Send data in chunks
      int offset = 0;
      while (offset < jpegData.length) {
        int chunkSize = (jpegData.length - offset).clamp(0, MAX_PACKET_SIZE);
        final chunk = jpegData.sublist(offset, offset + chunkSize);
        _udpSocket!.send(chunk, InternetAddress(Config.portIpValue), int.parse(Config.portNumberValue));
        offset += chunkSize;
      }

      // Send frame end marker
      final frameEnd = Uint8List.fromList([70, 82, 65, 77, 69, 95, 69, 78, 68]); // 'FRAME_END'
      _udpSocket!.send(frameEnd, InternetAddress(Config.portIpValue), int.parse(Config.portNumberValue));

    } catch (e) {
      print("[ERROR] Frame send error: $e");
    }
  }

  Future<Uint8List?> _convertToJpeg(CameraImage image) async {
    try {
      final width = image.width;
      final height = image.height;

      // Convert YUV to RGB
      final img.Image rgbImage = img.Image(width: width, height: height);
      final yPlane = image.planes[0];
      final uPlane = image.planes[1];
      final vPlane = image.planes[2];

      for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
          final uvIndex = (y >> 1) * uPlane.bytesPerRow + (x >> 1);
          final yIndex = y * yPlane.bytesPerRow + x;

          final int Y = yPlane.bytes[yIndex].toInt();
          final int U = uPlane.bytes[uvIndex].toInt();
          final int V = vPlane.bytes[uvIndex].toInt();

          final int vShift = V - 128;
          final int uShift = U - 128;
          
          final R = (Y + ((351 * vShift) >> 8)).clamp(0, 255);
          final G = (Y - ((179 * uShift + 86 * vShift) >> 8)).clamp(0, 255);
          final B = (Y + ((443 * uShift) >> 8)).clamp(0, 255);

          rgbImage.setPixelRgb(x, y, R, G, B);
        }
      }

      // Fix orientation
      img.Image orientedImage = rgbImage;
      if (Platform.isAndroid) {
        orientedImage = img.copyRotate(rgbImage, angle: 270);
        orientedImage = img.flipHorizontal(orientedImage);
      } else if (Platform.isIOS) {
        orientedImage = img.copyRotate(rgbImage, angle: 90);
        orientedImage = img.flipHorizontal(orientedImage);
      }

      // Encode to JPEG
      final jpeg = img.encodeJpg(orientedImage, quality: 75);
      return Uint8List.fromList(jpeg);
    } catch (e) {
      print("[ERROR] Image conversion failed: $e");
      return null;
    }
  }

  void stopStreaming() {
    _isStreaming = false;
    print("[CAMERA] Stopping camera stream...");
    if (_cameraController != null && _cameraController!.value.isStreamingImages) {
      _cameraController!.stopImageStream();
      print("[CAMERA] Stream stopped.");
    }
  }

  void dispose() {
    print("[CAMERA] Disposing camera...");
    stopStreaming();
    _cameraController?.dispose();
    _udpSocket?.close();
    print("[CAMERA] Resources disposed.");
  }
}