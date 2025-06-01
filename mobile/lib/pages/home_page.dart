import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import 'room_page.dart';
import '../models/room.dart';
import '../widgets/side_menu.dart';
import 'package:gtuverse_mobile_app/config.dart';


class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String? username;
  int? userId;
  List<Room> rooms = [];
  bool showRooms = false;

  final TextEditingController _roomNameController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _roomTypeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProfile();
    showRooms = true;
    _fetchRooms();
  }

  Future<void> _loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final rememberedUsername = prefs.getString('remembered_username');
    // final url = Uri.parse('http://192.168.137.111:18080/users/username/$rememberedUsername');
    final url = Uri.parse(Config.buildUrl('/users/username/$rememberedUsername'));

    if (rememberedUsername == null) return;

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          username = rememberedUsername;
          userId = data['id'];
        });
      }
    } catch (_) {}
  }

  Future<void> _fetchRooms() async {
    // final url = Uri.parse('http://192.168.137.111:18080/rooms');
    final url = Uri.parse(Config.buildUrl('/rooms'));

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        setState(() {
          try {
            final List<Room> parsedRooms = [];
            for (var e in jsonList) {
              try {
                final room = Room.fromJson(e);
                parsedRooms.add(room);
              } catch (err) {
                print('Room parse error: $err for entry: $e');
              }
            }
            setState(() {
              rooms = parsedRooms;
              showRooms = true;
            });
          } catch (outerErr) {
            print('Outer fetchRooms error: $outerErr');
          }
          showRooms = true;
        });
      }
    } catch (_) {}
  }

  Future<void> _createRoom(String roomName, String roomType) async {
    if (roomName.isEmpty || roomType.isEmpty) return;

    try {
      final response = await http.post(
        // Uri.parse('http://192.168.137.111:18080/rooms'),
        Uri.parse(Config.buildUrl('/rooms')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': roomName,
          'type': roomType,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final roomJson = json.decode(response.body);
        final Room room = Room.fromJson(roomJson);

        await _joinRoomApiOnly(room);

        final shouldRefresh = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => RoomPage(
              room: room,
              userId: userId!.toString(),
            ),
          ),
        );

        if (shouldRefresh == true) {
          _fetchRooms(); // refresh room list
        }
      } else if (response.statusCode == 409) {
        showErrorDialog("Room with the same name already exists.");
      } else {
        showErrorDialog("Failed to create room. (${response.statusCode})");
      }
    } catch (e) {
      print('Error creating room: $e');
      showErrorDialog("Could not create room. Check your connection.");
    }
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Error"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

Future<bool> _joinRoomApiOnly(Room room) async {
  if (userId == null) return false;

  // final url = Uri.parse('http://192.168.137.111:18080/rooms/${room.id}/users');
  final url = Uri.parse(Config.buildUrl('/rooms/${room.id}/users'));

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'user_id': userId}),
    );

    return response.statusCode == 201;
  } catch (e) {
    print('Join API error: $e');
    return false;
  }
}

  Future<void> _joinRoom(Room room) async {
    final success = await _joinRoomApiOnly(room);

    if (success) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) =>
              RoomPage(room: room, userId: userId!.toString()),
        ),
      ).then((_) => _fetchRooms());
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to join room.")),
      );
    }
  }

  List<Room> _filteredRooms() {
    final query = _searchController.text.toLowerCase();
    return rooms.where((room) => room.name.toLowerCase().contains(query)).toList();
  }

  void _showCreateRoomDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Create Room'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _roomNameController,
                decoration: const InputDecoration(hintText: 'Room name'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _roomTypeController,
                decoration: const InputDecoration(hintText: 'Room type'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _roomNameController.clear();
                _roomTypeController.clear();
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final name = _roomNameController.text.trim();
                final type = _roomTypeController.text.trim();
                if (name.isNotEmpty && type.isNotEmpty) {
                  _createRoom(name, type);
                }
                Navigator.pop(context);
                _roomNameController.clear();
                _roomTypeController.clear();
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredRooms();

    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      drawer: SideMenu(username: username ?? 'User'),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Center(
              child: Wrap(
                spacing: 16,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: _showCreateRoomDialog,
                    child: const Text('Create Room'),
                  ),
                  ElevatedButton(
                    onPressed: _fetchRooms,
                    child: const Text('Refresh Rooms'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search rooms by name',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) => setState(() {}),
            ),
            const SizedBox(height: 16),
            if (showRooms)
              Expanded(
                child: filtered.isEmpty
                    ? const Center(child: Text('No rooms found'))
                    : ListView.builder(
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final room = filtered[index];
                          return Card(
                            child: ListTile(
                              title: Text(room.name),
                              subtitle: Text('Size: ${room.size} / ${room.capacity}'),
                              trailing: ElevatedButton(
                                onPressed: () => _joinRoom(room),
                                child: const Text('Join'),
                              ),
                            ),
                          );
                        },
                      ),
              ),
          ],
        ),
      ),
    );
  }
}