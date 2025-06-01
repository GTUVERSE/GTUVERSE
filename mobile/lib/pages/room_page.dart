import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:camera/camera.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../widgets/side_menu.dart';
import '../camera_streaming_service.dart';
import 'package:gtuverse_mobile_app/config.dart';

class RoomPage extends StatefulWidget {
  final dynamic room;
  final String userId;

  const RoomPage({
    Key? key,
    required this.room,
    required this.userId,
  }) : super(key: key);

  @override
  State<RoomPage> createState() => _RoomPageState();
}

class _RoomPageState extends State<RoomPage> {
  late CameraStreamingService _cameraService;
  bool _isConnected = false;
  bool _isStreaming = false;
  String username = 'User';
  List<String> participants = [];

  Timer? _userFetchTimer;

  @override
  void initState() {
    super.initState();
    _cameraService = CameraStreamingService(userId: int.parse(widget.userId), roomId: widget.room.id);
    _loadUsername();
    _initializeCameraStream();
    _startFetchingUsers();
  }

  Future<void> _loadUsername() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      username = prefs.getString('username') ?? 'User';
    });
  }

  Future<void> _initializeCameraStream() async {
    try {
      await _cameraService.initializeCamera();
      await _cameraService.connectToServer();
      setState(() {
        _isConnected = true;
      });
    } catch (e) {
      print("Error initializing camera stream: $e");
    }
  }

  void _startFetchingUsers() {
    final roomId = widget.room.id;
    _userFetchTimer = Timer.periodic(const Duration(seconds: 2), (_) async {
      try {
        final response = await http.get(
          Uri.parse(Config.buildUrl('/rooms/$roomId/users')),
        );

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);

          List<String> names = [];
          if (data is List) {
            names = data.map<String>((user) => user['username'].toString()).toList();
          } else if (data is Map && data.containsKey('username')) {
            names = [data['username'].toString()];
          }

          setState(() {
            participants = names;
          });
        }
      } catch (e) {
        print("Error fetching participants: $e");
      }
    });
  }

  Future<void> _leaveRoom() async {
    final shouldLeave = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Leave Room"),
        content: const Text("Are you sure you want to leave the room?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text("Leave"),
          ),
        ],
      ),
    );

    if (shouldLeave != true) return;

    final roomId = widget.room.id;
    final userId = int.tryParse(widget.userId);

    if (userId == null) {
      print("Invalid user ID format.");
      return;
    }

    try {
      // 1. Kullanıcıyı odadan sil
      final res = await http.delete(
        Uri.parse(Config.buildUrl('/rooms/$roomId/users/$userId')),
      );

      if (res.statusCode == 200) {
        // 2. Oda içindeki kullanıcıları sorgula
        final userRes = await http.get(
          Uri.parse(Config.buildUrl('/rooms/$roomId/users')),
        );

        if (userRes.statusCode == 200) {
          final data = jsonDecode(userRes.body);

          // 3. Eğer liste boşsa → odayı da sil
          bool isEmpty = false;
          if (data is List) {
            isEmpty = data.isEmpty;
          } else if (data is Map && data.containsKey('username')) {
            isEmpty = false; // tek kişi varsa silinmesin
          } else {
            isEmpty = true;
          }

          if (isEmpty) {
            await http.delete(
              Uri.parse(Config.buildUrl('/rooms/$roomId')),
            );
          }
        }
      }
    } catch (e) {
      print("Error leaving room: $e");
    }

    if (context.mounted) Navigator.pop(context, true);
  }

  @override
  void dispose() {
    _cameraService.dispose();
    _userFetchTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Room"),
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(Icons.logout),
          onPressed: _leaveRoom,
        ),
      ),
      drawer: SideMenu(username: username),
      body: Column(
        children: [
          const SizedBox(height: 10),
          Text(
            "Participants in Room:",
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 5),
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: participants.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Chip(
                    label: Text(participants[index]),
                  ),
                );
              },
            ),
          ),
          const Divider(),
          if (_cameraService.controller != null &&
              _cameraService.controller!.value.isInitialized)
            Expanded(
              flex: 4,
              child: AspectRatio(
                aspectRatio: _cameraService.controller!.value.aspectRatio,
                child: CameraPreview(_cameraService.controller!),
              ),
            )
          else
            const Center(child: CircularProgressIndicator()),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _isConnected && !_isStreaming
                    ? () async {
                        await _cameraService.startStreaming();
                        setState(() {
                          _isStreaming = true;
                        });
                      }
                    : null,
                child: const Text("Start Streaming"),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: _isStreaming
                    ? () {
                        _cameraService.stopStreaming();
                        setState(() {
                          _isStreaming = false;
                        });
                      }
                    : null,
                child: const Text("Stop Streaming"),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}