import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  final ThemeData customLightTheme = ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: const Color(0xFFF5F5F5),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFE0E0E0),
      foregroundColor: Colors.black,
    ),
    colorScheme: ColorScheme.fromSwatch().copyWith(secondary: Colors.teal),

    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.grey),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.grey),
      ),
    ),

    switchTheme: SwitchThemeData(
      thumbColor: MaterialStatePropertyAll(Colors.orangeAccent),
      trackColor: MaterialStatePropertyAll(Colors.lightBlue),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        foregroundColor: MaterialStatePropertyAll<Color>(Color.fromARGB(255, 103, 58, 183)),
      ),
    ),
  );

  final ThemeData customDarkTheme = ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF121212),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF1F1F1F),
      foregroundColor: Colors.white,
    ),
    colorScheme: ColorScheme.fromSwatch(brightness: Brightness.dark)
        .copyWith(secondary: Colors.tealAccent),

    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.white54),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.tealAccent),
      ),
    ),

    switchTheme: SwitchThemeData(
      thumbColor: MaterialStatePropertyAll(Colors.white),
      trackColor: MaterialStatePropertyAll(Colors.blueGrey),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        foregroundColor: MaterialStatePropertyAll<Color>(Color.fromARGB(255, 255, 152, 0)),
      ),
    ),
  );
  ThemeData get currentTheme => _themeMode == ThemeMode.dark ? customDarkTheme : customLightTheme;
  
  ThemeMode _themeMode = ThemeMode.light;

  ThemeMode get themeMode => _themeMode;

  ThemeProvider() {
    _loadThemeFromPrefs();
  }

  void toggleTheme(bool isDark) async {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_dark_mode', isDark);
  }

  Future<void> _loadThemeFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = prefs.getBool('is_dark_mode');

    if (isDark != null) {
      _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
      notifyListeners();
    }
  }
}