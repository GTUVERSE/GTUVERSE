import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'pages/login_page.dart';
import 'pages/home_page.dart';
// import 'pages/room_page.dart';
import 'pages/settings_page.dart';
import 'providers/theme_provider.dart';
import 'package:flutter/services.dart';
import 'pages/splash_page.dart';
import 'config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // IP/Port ayarlarını yükle
  await Config.loadSettings();

  // Allow only portrait mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(
    ChangeNotifierProvider(
      create: (_) => ThemeProvider(),
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Virtual Room',
          debugShowCheckedModeBanner: false,
          theme: themeProvider.customLightTheme,
          darkTheme: themeProvider.customDarkTheme,
          themeMode: themeProvider.themeMode,
          initialRoute: '/',
          routes: {
            '/': (_) => SplashPage(),
            '/login': (_) => LoginPage(),
            '/home': (_) => HomePage(),
            // '/room': (_) => RoomPage(),
            '/settings': (_) => SettingsPage(),
          },
        );
      },
    );
  }
}