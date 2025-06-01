import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'register_page.dart';
import 'room_page.dart';
import '../models/room.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:gtuverse_mobile_app/config.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  String _password = '';
  bool _rememberMe = false;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _loadRememberedUsername();
  }

  Future<void> _loadRememberedUsername() async {
    final prefs = await SharedPreferences.getInstance();
    final rememberedUsername = prefs.getString('remembered_username');
    if (rememberedUsername != null) {
      setState(() {
        _usernameController.text = rememberedUsername;
        _rememberMe = true;
      });
    }
  }

  Future<void> _saveUsernameIfNeeded() async {
    final prefs = await SharedPreferences.getInstance();
    if (_rememberMe) {
      await prefs.setString('remembered_username', _usernameController.text);
    } else {
      await prefs.remove('remembered_username');
    }
  }

  Future<void> loginUser() async {
    final url = Uri.parse(Config.buildUrl('/login'));

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _usernameController.text,
          'password': _password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final userId = data['id']; // 🎯 ID burada geldi

        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt('user_id', userId); // 📥 KAYIT EDİLDİ

        await _saveUsernameIfNeeded(); // zaten vardı
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: ${response.body}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error occurred: $e')),
      );
    }
  }

  void _showIpConfigDialog(BuildContext context) {
    final databaseIpController = TextEditingController(text: Config.databaseIpValue);
    final serverIpController = TextEditingController(text: Config.portIpValue);
    final serverPortController = TextEditingController(text: Config.portNumberValue);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Server Settings'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: databaseIpController,
                decoration: const InputDecoration(labelText: 'Database IP (for API)'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: serverIpController,
                decoration: const InputDecoration(labelText: 'Server IP (for UDP)'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: serverPortController,
                decoration: const InputDecoration(labelText: 'Server Port (for UDP)'),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () async {
                final newDatabaseIp = databaseIpController.text.trim();
                final newServerIp = serverIpController.text.trim();
                final newServerPort = serverPortController.text.trim();

                await Config.update(
                  newDatabaseIp: newDatabaseIp,
                  newPortIp: newServerIp,
                  newPortNumber: newServerPort,
                );
                Navigator.of(context).pop();
              },
              child: const Text('Kaydet'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _usernameController,
                    decoration: const InputDecoration(labelText: 'Username'),
                    validator: (value) => value!.isEmpty ? 'Enter your username' : null,
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Password',
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                    obscureText: _obscurePassword,
                    validator: (value) => value!.isEmpty ? 'Enter your password' : null,
                    onSaved: (value) => _password = value!,
                  ),
                  const SizedBox(height: 8),
                  CheckboxListTile(
                    title: const Text('Remember me'),
                    value: _rememberMe,
                    onChanged: (value) {
                      setState(() {
                        _rememberMe = value ?? false;
                      });
                    },
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        _formKey.currentState!.save();
                        loginUser();
                      }
                    },
                    child: const Text('Login'),
                  ),
                  TextButton(
                    onPressed: () async {
                      final newUser = await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const RegisterPage()),
                      );
                      if (newUser != null && newUser.username != null) {
                        setState(() {
                          _usernameController.text = newUser.username;
                        });
                      }
                    },
                    child: const Text("Don't have an account? Register here"),
                  ),
                  const SizedBox(height: 20),
                  TextButton(
                    onPressed: () => _showIpConfigDialog(context),
                    child: const Text(
                      'Configur IP',
                      style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: _enterDevMode,
                    child: const Text(
                      'Enter DEV MODE',
                      style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _enterDevMode() {
    final dummyRoom = Room(
      id: 52, // DummyRoom'un id'si
      name: 'DummyRoom',
      size: 0,
      capacity: 8,
    );

    final dummyUserId = (100 + DateTime.now().millisecondsSinceEpoch % 900).toString();

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => RoomPage(
          room: dummyRoom,
          userId: dummyUserId,
        ),
      ),
    );
  }
}