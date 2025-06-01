package com.example.gtuverse_mobile_app

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "pose_channel"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
            call, result ->
            if (call.method == "processFrame") {
                val imageBytes = call.argument<ByteArray>("imageBytes")
                if (imageBytes != null) {
                    println("📸 Gelen görüntü byte sayısı: ${imageBytes.size}")
                    // Burada görüntüyü server'a gönderme işlemi yapılabilir (ileride)
                } else {
                    println("🚨 imageBytes null")
                }

                result.success("ok") // ✅ Flutter'a sadece başarı mesajı dönüyoruz
            } else {
                result.notImplemented()
            }
        }
    }
}