import 'package:flutter/material.dart';
import 'dart:async';

class SplashPage extends StatefulWidget {
  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    Timer(Duration(seconds: 3), () {
      Navigator.pushReplacementNamed(context, '/login');
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final splashAsset = isDark
        ? 'assets/splash/gtuverse_splash_dark.png'
        : 'assets/splash/gtuverse_splash_light.png';

    return Scaffold(
      body: Center(
        child: Image.asset(splashAsset, fit: BoxFit.cover, width: double.infinity, height: double.infinity),
      ),
    );
  }
}