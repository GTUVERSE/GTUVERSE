// app/club/[id]/page.tsx
"use client";

import type React from "react";
import MusicPlayer from "@/components/MusicPlayer"; // MusicPlayer bileşeninizin var olduğunu varsayıyoruz

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar"; // Navbar bileşeninizin var olduğunu varsayıyoruz
import { Sidebar } from "@/components/sidebar"; // Sidebar bileşeninizin var olduğunu varsayıyoruz
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Input ve MessageSquare artık kullanılmıyorsa kaldırılabilir.
// import { Input } from "@/components/ui/input";
// import { MessageSquare } from "lucide-react";
import { Users, Share2, Heart, Volume2, Music, VideoOff, PlayCircle } from "lucide-react"; // MessageSquare kaldırıldı, VideoOff ve PlayCircle eklendi/kaldı
import { roomsAPI } from "@/lib/api-service"; // messageAPI importu kaldırılabilir eğer sadece burada kullanılıyorsa
import { useAuth } from "@/lib/auth-context"; // auth-context dosyanızın yolu
import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_BASE_URL = "http://localhost:18080"; // Backend ana URL'si

type Room = {
  id: string | number;
  name: string;
  host?: string;
  size: number;
  capacity: number;
  type?: string;
  description?: string;
  thumbnail?: string;
  url?: string; // Video URL'si
};

// Message type tanımı kaldırıldı
// type Message = { ... };

export default function ClubPage() {
  const params = useParams();
  const clubId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  // chatMessage ve messages state'leri kaldırıldı
  // const [chatMessage, setChatMessage] = useState("");
  // const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!clubId) {
        setError("Kulüp ID bulunamadı.");
        setLoading(false);
        return;
    }

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        const roomData = await roomsAPI.getById(clubId);
        console.log("[ClubPage] Fetched room:", roomData);

        if (roomData && typeof roomData === 'object' && !Array.isArray(roomData) && roomData.id) {
          setRoom(roomData as Room);
        } else {
          console.error("[ClubPage] Fetched room data is not a valid room object or is empty:", roomData);
          setError("Kulüp bilgileri alınamadı veya geçersiz formatta.");
          setRoom(null);
        }

        // Mesajları çekme bloğu tamamen kaldırıldı.
        // try {
        //   const messagesData = await messageAPI.getRoomMessages(clubId);
        // ...
        // } catch (msgErr) { ... }

      } catch (err: any) {
        console.error("[ClubPage] Failed to fetch room details:", err);
        setError(`Kulüp bilgilerini yüklerken bir hata oluştu: ${err.message}`);
        setRoom({
          id: clubId,
          name: "Neon Lounge - Hata Durumu",
          host: "DJ Virtual",
          size: 0,
          capacity: 0,
          type: "Bilinmiyor",
          description:
            "Bu kulüp bilgileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          url: "", // Hata durumunda url eklendi
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [clubId]);

  // handleSendMessage fonksiyonu tamamen kaldırıldı.
  // const handleSendMessage = async (e: React.FormEvent) => { ... };

  // Video oynatma/durdurma fonksiyonu
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      // Buton ikonunu değiştirmek için ek bir state yönetimi gerekebilir (isPlaying gibi)
    }
  };

  // Yükleme durumu için render
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-b from-black to-zinc-900">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="w-full h-24 rounded-lg" />
            </div>
            {/* Mesajlaşma bölümü için ayrılan skeleton kaldırıldı, ana içerik alanını ayarlayın */}
            <div className="lg:col-span-1 hidden lg:block"> {/* Placeholder for right column if needed */}
                 <Skeleton className="w-full h-[calc(100vh-8rem)] rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Hata durumu veya oda bulunamadı durumu için render
  if (error && !room) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-center px-4">
          <div className="p-6 bg-zinc-800 border border-red-700 text-red-200 rounded-lg max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Bir Sorun Oluştu</h2>
            <p className="whitespace-pre-wrap break-words">{error || "Kulüp bulunamadı veya yüklenirken bir hata oluştu."}</p>
            <Button onClick={() => (window.location.href = "/")} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white">
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Oda verisi yoksa (ama kritik bir hata da yoksa) render
  if (!room) { 
     return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-center px-4">
          <div className="p-6 bg-zinc-800 border border-purple-700 text-purple-200 rounded-lg max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Kulüp Yükleniyor...</h2>
            <p>Kulüp bilgileri bulunamadı veya hala yükleniyor. Lütfen bekleyin veya ana sayfaya dönün.</p>
             {error && <p className="mt-2 text-red-400 whitespace-pre-wrap break-words">{error}</p>}
            <Button onClick={() => (window.location.href = "/")} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white">
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Oda verisi başarıyla yüklendiğinde ana render
  const videoSource = room.url ? `${BACKEND_BASE_URL}/${room.url.startsWith('/') ? room.url.substring(1) : room.url}` : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-black text-purple-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        {/* Ana içerik alanı, mesajlaşma bölümü kaldırıldığı için grid yapısı değişebilir */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gradient-to-b from-black to-zinc-900"> {/* lg:grid-cols-4'ten lg:grid-cols-3'e */}
          
          {/* Sol taraf içerik (Video ve Oda Bilgileri) */}
          {/* Mesajlaşma bölümü olmadığı için bu kısım daha fazla yer kaplayabilir: lg:col-span-2'den lg:col-span-3'e veya direkt olarak ana content */}
          <div className="lg:col-span-3 space-y-4"> {/* Veya lg:col-span-full eğer sidebar yoksa ve tek sütun ise */}
            
            {/* Music Player üstte kalabilir veya video alanının bir parçası olabilir */}
            <div className="mb-4"> {/* lg:col-span-4 kaldırıldı, çünkü ana grid artık 3 sütunlu */}
              <MusicPlayer />
            </div>

            {/* Video Oynatıcı */}
            <div className="relative aspect-video bg-zinc-950 rounded-lg overflow-hidden shadow-2xl border border-purple-900/30">
              {videoSource ? (
                <video
                  ref={videoRef}
                  src={videoSource}
                  controls
                  loop
                  className="w-full h-full object-cover"
                  poster={room.thumbnail || `${BACKEND_BASE_URL}/placeholder_video.jpg`}
                  onError={(e) => {
                    console.error("Video Error:", e);
                    (e.target as HTMLVideoElement).style.display = 'none';
                  }}
                >
                  Tarayıcınız video etiketini desteklemiyor.
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                   <VideoOff className="w-24 h-24 text-purple-700 mb-4" />
                  <p className="text-purple-300 text-lg">Video mevcut değil veya yüklenemedi.</p>
                  {room.thumbnail && <img src={room.thumbnail} alt="Oda görseli" className="mt-4 max-h-40 opacity-50 rounded" />}
                </div>
              )}
               {!videoSource && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 pointer-events-none">
                  <VideoOff className="w-24 h-24 text-purple-700 mb-4" />
                  <p className="text-purple-300 text-lg">Video mevcut değil.</p>
                </div>
              )}

              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow"> CANLI </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow"> <Users className="h-3 w-3" /> {room.size}/{room.capacity} </div>
              
              {videoSource && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <Button onClick={togglePlay} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      {/* İkonun dinamik değişimi için ek state gerekebilir (örn: isPlaying) */}
                      <PlayCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"> <Volume2 className="h-5 w-5" /> </Button>
                  </div>
                  <div className="flex items-center gap-2"> <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 text-xs"> HD </Button> </div>
                </div>
              )}
            </div>

            {/* Oda Bilgileri */}
            <div className="flex items-start gap-4 p-1">
              <Avatar className="h-12 w-12 ring-2 ring-purple-600">
                <AvatarImage src={room.host && room.host.includes('/') ? room.host : "/placeholder.svg"} alt={room.host || room.name} />
                <AvatarFallback className="bg-purple-900">{(room.host || room.name).charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-purple-100">{room.name}</h1>
                <div className="flex items-center gap-2 text-sm text-purple-300 flex-wrap">
                  <span>{room.host || "Bilinmeyen Host"}</span> <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1"> <Music className="h-3 w-3" /> {room.type || "Çeşitli"} </span> <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1"> <Users className="h-3 w-3" /> {room.size}/{room.capacity} katılıyor </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-purple-700 text-purple-300 hover:bg-purple-900/30 hover:text-purple-100"> <Heart className="h-4 w-4 mr-2" /> Takip Et </Button>
                <Button variant="outline" size="sm" className="border-purple-700 text-purple-300 hover:bg-purple-900/30 hover:text-purple-100"> <Share2 className="h-4 w-4 mr-2" /> Paylaş </Button>
              </div>
            </div>

            {/* Kulüp Hakkında */}
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-purple-900/30">
              <h2 className="font-semibold mb-2 text-purple-200">Kulüp Hakkında</h2>
              <p className="text-sm text-purple-300 whitespace-pre-wrap"> {room.description || "Bu kulüp için henüz bir açıklama girilmemiş."} </p>
            </div>
          </div>

          {/* Mesajlaşma bölümü tamamen kaldırıldı */}
          {/* <div className="lg:col-span-1 flex flex-col ..."> ... </div> */}
        </main>
      </div>
    </div>
  );
}