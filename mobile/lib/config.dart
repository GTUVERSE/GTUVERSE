import 'package:shared_preferences/shared_preferences.dart';

class Config {
  static String databaseIpValue = '192.168.255.149';     // ⬅️ Default: API IP
  static String portIpValue = '192.168.255.198';         // ⬅️ Default: UDP IP
  static String portNumberValue = '52700';           // ⬅️ Default: UDP Port

  static const _databaseIpKey = 'databaseIp';
  static const _portIpKey = 'portIp';
  static const _portNumberKey = 'portNumber';

  static Future<void> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    databaseIpValue = prefs.getString(_databaseIpKey) ?? databaseIpValue;
    portIpValue = prefs.getString(_portIpKey) ?? portIpValue;
    portNumberValue = prefs.getString(_portNumberKey) ?? portNumberValue;
  }

  static Future<void> update({
    required String newDatabaseIp,
    required String newPortIp,
    required String newPortNumber,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_databaseIpKey, newDatabaseIp);
    await prefs.setString(_portIpKey, newPortIp);
    await prefs.setString(_portNumberKey, newPortNumber);

    databaseIpValue = newDatabaseIp;
    portIpValue = newPortIp;
    portNumberValue = newPortNumber;
  }

  static String buildUrl(String path) {
    return 'http://$databaseIpValue:18080$path';
  }
}