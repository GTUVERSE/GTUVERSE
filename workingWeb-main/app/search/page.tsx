// app/search/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } // URL'den query parametrelerini okumak için
from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar"; // Navbar'ı tekrar kullanabilirsiniz
import { Sidebar } from "@/components/sidebar"; // Sidebar'ı tekrar kullanabilirsiniz
import { roomsAPI } from "@/lib/api-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Tag, Music, SearchX } from "lucide-react";

// ClubsGrid'deki Room tipine benzer bir tip veya onu import edebilirsiniz
type Room = {
  id: number | string;
  name: string;
  size: number;
  capacity: number;
  type: string;
  thumbnail_url?: string | null;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const roomTypeQuery = searchParams.get("type"); // URL'den 'type' parametresini al

  const [results, setResults] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomTypeQuery) {
      const fetchResults = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log(`Searching for room type: ${roomTypeQuery}`);
          const data = await roomsAPI.searchRoomsByType(roomTypeQuery);
          if (Array.isArray(data)) {
            setResults(data);
          } else {
            // API bazen 404 durumunda {error: "mesaj"} dönebilir, fetchAPI bunu hataya çevirir.
            // Eğer fetchAPI 404 için null/undefined dönerse veya data beklenmedik bir formatta ise
            console.warn("Search results data was not an array:", data);
            setResults([]);
          }
        } catch (err: any) {
          console.error("Failed to fetch search results:", err);
          // Backend 404 döndüğünde fetchAPI hata fırlatır, err.message "No rooms found..." içerebilir.
          if (err.message && err.message.toLowerCase().includes("no rooms found")) {
             setError(`'${roomTypeQuery}' tipinde oda bulunamadı.`);
          } else {
             setError(err.message || "Arama sırasında bir hata oluştu.");
          }
          setResults([]); // Hata durumunda sonuçları temizle
        } finally {
          setIsLoading(false);
        }
      };
      fetchResults();
    } else {
      // roomTypeQuery yoksa veya boşsa (örneğin /search sayfasına direkt gelindiyse)
      setResults([]);
      setIsLoading(false);
      // İsteğe bağlı olarak bir mesaj gösterebilirsiniz: "Lütfen bir arama terimi girin."
    }
  }, [roomTypeQuery]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 md:p-6">
        {Array.from({ length: 4 }).map((_, index) => (
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

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-100">
        Arama Sonuçları: <span className="text-purple-400">&quot;{roomTypeQuery}&quot;</span>
      </h1>
      {error && !isLoading && results.length === 0 && ( // Sadece hata varsa ve sonuç yoksa göster
        <div className="text-center py-10 bg-zinc-800/50 rounded-lg shadow-lg">
          <SearchX className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 text-xl">{error}</p>
          <p className="text-purple-300 mt-2">Farklı bir anahtar kelime ile tekrar deneyin.</p>
        </div>
      )}
      {!error && !isLoading && results.length === 0 && roomTypeQuery && (
         <div className="text-center py-10 bg-zinc-800/50 rounded-lg shadow-lg">
          <SearchX className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-200 text-xl">&apos;{roomTypeQuery}&apos; tipinde oda bulunamadı.</p>
          <p className="text-purple-300 mt-2">Farklı bir oda tipi ile aramayı deneyin.</p>
        </div>
      )}
       {!roomTypeQuery && !isLoading && (
        <p className="text-center text-purple-300 text-lg">Lütfen aramak istediğiniz oda tipini girin.</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {results.map((room) => (
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
      )}
    </div>
  );
}


export default function SearchPageContainer() {
    return (
        // Suspense, useSearchParams hook'unun istemci tarafında çalışmasını beklerken fallback göstermek için gereklidir.
        // Next.js 13+ App Router'da dinamik fonksiyonlar (useSearchParams gibi) Suspense boundary gerektirir.
        <Suspense fallback={
            <div className="min-h-screen flex flex-col bg-black text-purple-50">
                <Navbar />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 p-4 md:p-6">
                        <h1 className="text-3xl font-bold mb-6 text-purple-100">Arama Sonuçları Yükleniyor...</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-zinc-800 p-4 rounded-lg shadow space-y-3">
                                <Skeleton className="h-32 w-full rounded-md" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        }>
            <div className="min-h-screen flex flex-col bg-black text-purple-50">
                <Navbar />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1">
                        <SearchResults />
                    </main>
                </div>
            </div>
        </Suspense>
    )
}