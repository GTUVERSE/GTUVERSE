import 'package:flutter/material.dart';

class User {
  final String username;
  final String email;
  // final Color color;

  User({
    required this.username,
    required this.email,
    // required this.color,
  });

  // Opsiyonel: JSON'dan user üretmek istersen
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      username: json['username'],
      email: json['email'],
      // color: Colors.grey, // sunucudan renk gelmiyor olabilir
    );
  }

  // Opsiyonel: JSON'a çevirmek istersen
  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'email': email,
      // color JSON'da olmayabilir, burada stringe çevirme yapılabilir
    };
  }
}