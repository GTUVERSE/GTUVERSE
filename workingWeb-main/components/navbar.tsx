// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // Yönlendirme için
import { useState, type FormEvent } from "react"; // Arama state'i ve event tipi için
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Kullanıcıyı arama sonuçları sayfasına yönlendir, arama terimini query parametresi olarak ekle
      // Örneğin: /search?type=Study
      router.push(`/search?type=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery(""); // Aramadan sonra input'u temizle (isteğe bağlı)
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-900/50 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto flex h-14 items-center px-4"> {/* container ve mx-auto eklendi */}
        {/* Sol Taraf: Logo */}
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-transparent bg-clip-text">
              GTUVERSE
            </span>
          </Link>
          {/* "Explore Clubs" butonu kaldırıldı */}
        </div>

        {/* Orta Taraf: Arama Çubuğu */}
        {/* flex-1 ile esnek genişlik, max-w-md ile maksimum genişlik sınırı */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center max-w-xl mx-auto" // max-w-md'den max-w-xl'e ve mx-4 yerine mx-auto
        >
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Oda tipine göre ara (örn: Study, Game, Music)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-zinc-900 border-purple-900/50 text-purple-100 placeholder:text-purple-400/70 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
            {/* Arama ikonuna tıklanabilirlik eklemek isterseniz:
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <Search className="h-4 w-4 text-purple-400 hover:text-purple-200" />
            </button>
            */}
          </div>
        </form>

        {/* Sağ Taraf: Bildirimler ve Kullanıcı/Auth Butonları */}
        <div className="flex items-center gap-3 md:gap-4 ml-4"> {/* ml-4 eklendi */}
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30 rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0"> {/* p-0 eklendi */}
                    <Avatar className="h-9 w-9 ring-2 ring-purple-500">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="bg-purple-800 text-purple-100 text-xs"> {/* bg-purple-900'dan 800'e, text-xs eklendi */}
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-purple-900/70 shadow-xl"> {/* class'lar güncellendi */}
                  <DropdownMenuLabel className="font-normal text-sm text-purple-200 px-3 py-2"> {/* class'lar güncellendi */}
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-purple-100">{user.username}</p>
                      {user.email && <p className="text-xs leading-none text-purple-400">{user.email}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-800/50" /> {/* class güncellendi */}
                  <DropdownMenuItem asChild className="text-purple-200 focus:bg-purple-800/70 focus:text-purple-50 cursor-pointer">
                    <Link href="/profile" className="w-full">
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-purple-200 focus:bg-purple-800/70 focus:text-purple-50 cursor-pointer">
                    <Link href="/settings" className="w-full">
                      Ayarlar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-purple-800/50" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 focus:bg-red-700/30 focus:text-red-300 cursor-pointer" // class güncellendi
                  >
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30 px-3 md:px-4" asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4" asChild>
                <Link href="/register">Kayıt Ol</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}