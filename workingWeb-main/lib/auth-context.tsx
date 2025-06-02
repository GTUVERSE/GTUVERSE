// File: contexts/AuthContext.tsx (veya AuthProvider'ınızın bulunduğu dosya)
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api-service"; // api-service.ts dosyanızın yolu

type User = {
  id: string; // Backend'den gelen 'id' number olabilir, userAPI yanıtına göre ayarlayın.
  username: string;
  email?: string;
  avatar?: string;
  token?: string; // Eğer backend token sağlıyorsa
};

type AuthContextType = {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta true olabilir
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("gtuverse-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("gtuverse-user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("gtuverse-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gtuverse-user");
    }
  }, [user]);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // userAPI.login artık doğrudan backend yanıtını (proxy'den gelen 'data' alanı) döndürür
      // veya bir hata fırlatır.
      const loginData = await userAPI.login(credentials);
      console.log("LOGIN RESPONSE (unwrapped by fetchAPI):", loginData);

      // Backend yanıtına göre loginData'nın yapısını kontrol edin
      // Örnek: { id: 1, username: "funda" } veya { user: { id: 1, ... }, token: "..." }
      
      let loggedInUser: User | null = null;

      if (loginData && loginData.id && loginData.username) { // Yanıt doğrudan kullanıcı bilgisi ise
        loggedInUser = {
          id: String(loginData.id), // ID'nin string olduğundan emin olalım
          username: loginData.username,
          // Backend'den email veya avatar geliyorsa buraya ekleyin
          // email: loginData.email, 
          avatar: loginData.avatar || `/placeholder.svg?height=40&width=40`,
          token: loginData.token || "", // Eğer token bu seviyede geliyorsa
        };
      } else if (loginData && loginData.user && loginData.token) { // Yanıt { user: ..., token: ... } ise
        loggedInUser = {
          id: String(loginData.user.id),
          username: loginData.user.username,
          email: loginData.user.email,
          avatar: loginData.user.avatar || `/placeholder.svg?height=40&width=40`,
          token: loginData.token,
        };
      }
      // Diğer başarılı yanıt formatlarını buraya ekleyebilirsiniz.

      if (loggedInUser) {
        setUser(loggedInUser);
        router.push("/");
      } else {
        // Beklenmedik yanıt formatı
        console.error("Invalid login response structure:", loginData);
        setError("Giriş başarısız. Sunucudan geçersiz yanıt alındı.");
      }

    } catch (err: any) {
      console.error("Login error in AuthContext:", err);
      setError(err.message || "Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // userAPI.register artık doğrudan backend yanıtını veya "Registered" gibi bir string döndürebilir
      const registrationData = await userAPI.register(credentials);
      console.log("REGISTER RESPONSE (unwrapped by fetchAPI):", registrationData);

      // Backend'den gelen yanıta göre kontrol:
      // 1. "Registered" string'i
      // 2. { message: "User registered", user: {...}, token: "..." } gibi bir obje
      if (typeof registrationData === 'string' && registrationData.toLowerCase().includes('registered')) {
        // Sadece "Registered" mesajı döndüyse login sayfasına yönlendir
        router.push("/login"); // Veya otomatik login deneyebilirsiniz
      } else if (registrationData && registrationData.user && registrationData.token) {
        // Kullanıcı bilgisi ve token döndüyse
        const registeredUser: User = {
          id: String(registrationData.user.id),
          username: registrationData.user.username,
          email: registrationData.user.email,
          avatar: registrationData.user.avatar || `/placeholder.svg?height=40&width=40`,
          token: registrationData.token,
        };
        setUser(registeredUser);
        router.push("/"); // Veya login sayfasına yönlendirip login olmasını isteyebilirsiniz
      } else if (registrationData && registrationData.message && registrationData.message.toLowerCase().includes('registered')) {
         // { message: "User registered..." } gibi bir yanıt
        router.push("/login");
      }
      else {
         // Beklenmedik yanıt formatı veya hata (fetchAPI zaten hata fırlatmalıydı)
        console.error("Invalid registration response structure:", registrationData);
        // setError("Kayıt başarısız. Sunucudan geçersiz yanıt alındı.");
        // Eğer fetchAPI'den bir hata fırlatılmadıysa ama yanıt da beklenildiği gibi değilse:
        // Bu durum genellikle fetchAPI'nin bir hata yakalayıp fırlatmasıyla çözülür.
        // Eğer registrationData bir string ise ve hata mesajı içeriyorsa:
        if (typeof registrationData === 'string') {
            setError(registrationData);
        } else {
            setError("Kayıt başarısız. Bilinmeyen bir sorun oluştu.");
        }
      }
    } catch (err: any) {
      console.error("Registration error in AuthContext:", err);
      setError(err.message || "Kayıt başarısız. Lütfen farklı bir kullanıcı adı deneyin veya daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // localStorage.removeItem("gtuverse-user"); // Bu useEffect [user] tarafından zaten yapılacak
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}