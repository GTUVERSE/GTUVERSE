// components/ClubsGrid.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Next.js Image component'i için
import { roomsAPI } from "@/lib/api-service";
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton bileşeniniz
import { Users, Tag, Music } from "lucide-react"; // İkonlar

// Backend /roomsWEB yanıtına göre bir Room tipi tanımlayın
// Bu tip, backend'den gelen tüm odaların listelendiği endpoint'in her bir elemanının yapısını yansıtmalıdır.
type Room = {
  id: number | string; // Backend'den gelen ID tipi (genellikle number)
  name: string;
  size: number;
  capacity: number;
  type: string; // Oda türü (örn: "Study", "Game", "Music")
  thumbnail_url?: string | null; // Oda için bir görsel URL'si (opsiyonel)
  // Backend'den gelebilecek diğer alanlar (örn: host_username, is_live vb.)
};

export function ClubsGrid() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const roomsData = await roomsAPI.getAll(); // fetchAPI üzerinden veri çeker
        
        if (Array.isArray(roomsData)) {
          setRooms(roomsData);
        } else {
          // fetchAPI, 204 durumunda veya data'nın dizi olmadığı durumlarda [] döndürmeliydi.
          // Bu ek kontrol, beklenmedik bir durum için.
          console.warn("Rooms data from API was not an array as expected:", roomsData);
          setRooms([]); // Güvenlik için boş dizi ata
        }
      } catch (err: any) {
        console.error("Failed to fetch rooms for ClubsGrid:", err);
        setError(err.message || "Kulüpler yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []); // Component mount edildiğinde çalışır

  if (isLoading) {
    // Yükleme sırasında gösterilecek skeleton loader'lar
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-zinc-800 p-4 rounded-lg shadow space-y-3">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400 text-lg">Hata: {error}</p>
        <p className="text-purple-300 mt-2">Kulüpleri yüklerken bir sorun oluştu. Lütfen sayfanızı yenileyin veya daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-purple-200 text-lg">Şu anda gösterilecek aktif kulüp bulunmamaktadır.</p>
        <p className="text-purple-400 mt-2">Yeni kulüpler için daha sonra tekrar kontrol edin!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
      {rooms.map((room) => (
        <Link key={room.id} href={`/club/${room.id}`} passHref legacyBehavior>
          <a className="block group bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
            <div className="relative w-full aspect-[16/10] bg-zinc-700">
              {room.thumbnail_url ? (
                <Image
                  src={room.thumbnail_url}
                  alt={`${room.name} thumbnail`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                  <Music className="w-16 h-16 text-purple-400 opacity-70" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
               {/* Canlı etiketi veya özel bir durum için opsiyonel */}
               {/* <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">LIVE</div> */}
            </div>
            <div className="p-4 space-y-2">
              <h3 
                className="text-lg font-semibold text-purple-200 group-hover:text-purple-100 truncate transition-colors duration-300"
                title={room.name}
              >
                {room.name}
              </h3>
              <div className="flex items-center text-xs text-purple-400 gap-3">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {room.type || "Çeşitli"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {room.size}/{room.capacity}
                </span>
              </div>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}