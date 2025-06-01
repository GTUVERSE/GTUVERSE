import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

import '../providers/theme_provider.dart';
import 'package:gtuverse_mobile_app/config.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final TextEditingController _usernameController = TextEditingController();
  bool _darkMode = false;
  int? userId;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final username = prefs.getString('remembered_username');
    final id = prefs.getInt('user_id');

    if (username != null) {
      _usernameController.text = username;
    }

    setState(() {
      userId = id;
      _darkMode = Provider.of<ThemeProvider>(context, listen: false).themeMode == ThemeMode.dark;
    });
  }

  Future<void> _saveProfile() async {
    final newUsername = _usernameController.text.trim();

    if (newUsername.isEmpty || userId == null) return;

    try {
      final url = Uri.parse(Config.buildUrl('/users/$userId/username'));
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': newUsername}),
      );

      if (response.statusCode == 200) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile saved')),
          );
        }
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Update failed: ${response.body}')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text('Username'),
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                hintText: 'Enter your username',
              ),
            ),
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('Dark Mode'),
              value: _darkMode,
              onChanged: (value) {
                setState(() {
                  _darkMode = value;
                });
                  Provider.of<ThemeProvider>(context, listen: false).toggleTheme(value);
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saveProfile,
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }
}