# GTÜVerse Mobile App

GTÜVerse, Gebze Teknik Üniversitesi Bilgisayar Mühendisliği Proje dersi kapsamında geliştirilmiş Flutter tabanlı bir mobil uygulamadır. Uygulama, öğrencilerin sanal ortama katılıp kamera görüntülerini sunucuya göndermesini sağlar.

## 🔧 Özellikler

- 📸 Ön kamera görüntüsünü alma ve sunucuya gönderme (15 FPS)
- 👤 Kullanıcı girişi / kaydı (SharedPreferences destekli Remember Me)
- 🏠 Ana sayfada oda oluşturma, oda listesi görüntüleme ve filtreleme
- 🔗 Odaya katılma (ve doluluk kontrolü)
- 🎨 Kullanıcı profili düzenleme (renk, resim ve kullanıcı adı)
- 🌙 Tema değiştirme (light/dark)
- 🧭 Yan menüden ayarlara ve çıkışa erişim
- 🔒 Sunucuya bağlanma: Crow (C++) API ile entegrasyon

## 📦 Kullanılan Paketler

- `camera`: Cihaz kamerası ile çalışmak için
- `image_picker`: Galeriden profil resmi seçimi
- `shared_preferences`: Kullanıcı bilgilerini yerel olarak saklamak için
- `http`: Backend API çağrıları için
- `provider`: Tema yönetimi ve durum yönetimi için
- `path_provider`: Gerektiğinde dosya yolu erişimi

## 🚀 Kurulum

```bash
flutter clean
flutter pub get
flutter run