// lib/api-service.ts

const API_URL = "/api/proxy"; // Proxy endpoint'iniz

/**
 * API'ye genel istekleri yönetmek için kullanılan yardımcı fonksiyon.
 * Proxy üzerinden backend'e istek atar.
 * Başarılı yanıtları { data: ... } yapısından çıkarır.
 * Hata durumlarını yönetir.
 * @param endpoint Hedef API endpoint'i (örn: "users", "rooms/123").
 * @param options Standart fetch API seçenekleri (method, body, headers vb.).
 * @returns Promise<any> - API'den gelen veri.
 */
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  try {
    console.log(`[API Service] Fetching via Proxy: ${API_URL}/${endpoint}`);
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`[API Service] Proxy Response Status for ${endpoint}: ${response.status}`);

    if (response.status === 204) {
      return [];
    }

    const jsonResponse = await response.json();

    if (!response.ok) {
      const errorMessage = jsonResponse.error || `API Error: ${response.status} ${response.statusText || 'Bilinmeyen Hata'}`;
      console.error(`[API Service] API Error from proxy for ${endpoint}:`, errorMessage, jsonResponse);
      throw new Error(errorMessage);
    }

    if (jsonResponse.hasOwnProperty('data')) {
      return jsonResponse.data;
    } else {
      console.warn(`[API Service] Proxy response for ${endpoint} successful, but 'data' field is missing.`, jsonResponse);
      return jsonResponse;
    }

  } catch (error: any) {
    console.error(`[API Service] FetchAPI critical error for endpoint '${endpoint}':`, error.message);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error.message || `API isteği sırasında bilinmeyen bir hata oluştu: ${endpoint}`));
  }
};

// --- User API ---
export const userAPI = {
  login: async (credentials: { username: string; password: string }) => {
    return fetchAPI("login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    return fetchAPI("register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getProfile: async (userId: string | number) => {
    return fetchAPI(`users/${userId}`);
  },

  getAll: async () => {
    return fetchAPI("users");
  },

  getUserRooms: async (userId: string | number) => {
    return fetchAPI(`usersWEB/${userId}/rooms`);
  },

  getByUsername: async (username: string) => {
    return fetchAPI(`users/username/${encodeURIComponent(username)}`);
  },

  updateUsername: async (userId: string | number, newUsername: string) => {
    return fetchAPI(`users/${userId}/username`, {
      method: "PUT",
      body: JSON.stringify({ username: newUsername }),
    });
  }
};

// --- Rooms API ---
export const roomsAPI = {
  getAll: async () => {
    return fetchAPI("roomsWEB");
  },

  getById: async (roomId: string | number) => {
    // Bu fonksiyon /roomsWEB/:id'yi çağırır ve backend'den gelen 'url' alanını da içermelidir.
    return fetchAPI(`roomsWEB/${roomId}`);
  },

  create: async (roomData: { name: string; type: string }) => {
    return fetchAPI("rooms", {
      method: "POST",
      body: JSON.stringify(roomData),
    });
  },

  update: async (roomId: string | number, roomData: any) => {
    return fetchAPI(`rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(roomData),
    });
  },

  delete: async (roomId: string | number) => {
    return fetchAPI(`rooms/${roomId}`, {
      method: "DELETE",
    });
  },

  addUser: async (roomId: string | number, userId: number) => {
    return fetchAPI(`rooms/${roomId}/users`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },

  getRoomUsers: async (roomId: string | number) => {
    return fetchAPI(`rooms/${roomId}/users`);
  },

  removeUser: async (roomId: string | number, userId: number) => {
    return fetchAPI(`rooms/${roomId}/users/${userId}`, {
      method: "DELETE",
    });
  },

  searchRoomsByType: async (type: string) => {
    if (!type || type.trim() === "") {
      console.warn("[API Service] Search room by type: type is empty, returning empty array.");
      return Promise.resolve([]);
    }
    return fetchAPI(`rooms/type/${encodeURIComponent(type.trim())}`);
  },
};

// --- Stream API ---
export const streamAPI = {
  getAll: async () => {
    return fetchAPI("streams");
  },

  getById: async (streamId: string | number) => {
    return fetchAPI(`streams/${streamId}`);
  },

  create: async (streamData: any) => {
    return fetchAPI("streams", {
      method: "POST",
      body: JSON.stringify(streamData),
    });
  },

  update: async (streamId: string | number, streamData: any) => {
    return fetchAPI(`streams/${streamId}`, {
      method: "PUT",
      body: JSON.stringify(streamData),
    });
  },

  delete: async (streamId: string | number) => {
    return fetchAPI(`streams/${streamId}`, {
      method: "DELETE",
    });
  },
};
