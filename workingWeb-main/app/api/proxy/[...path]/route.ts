// File: app/api/proxy/[...path]/route.ts
import { type NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:18080"; // Backend API'nizin adresi

function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) { // "Bearer " kısmını kontrol edin
    return authHeader; // Tüm "Bearer <token>" string'ini döndürün
    // Veya sadece token'ı istiyorsanız: return authHeader.substring(7);
  }
  return null;
}

function isPromise(obj: any): obj is Promise<any> {
  return !!obj && typeof obj.then === "function";
}

async function getParams(contextOrPromise: any) {
  if (isPromise(contextOrPromise)) {
    return (await contextOrPromise).params;
  }
  return contextOrPromise.params;
}

export async function GET(request: NextRequest, context: any) {
  const params = await getParams(context);
  const path = params.path.join("/");
  const url = new URL(request.url);
  const queryString = url.search; // Query string'i de ilet
  const token = getTokenFromRequest(request);

  try {
    const response = await fetch(`${API_URL}/${path}${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Genellikle GET için zorunlu değil ama API'niz bekliyorsa kalabilir
        ...(token ? { Authorization: token } : {}),
      },
      cache: "no-store", // GET istekleri için cache ayarı
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Yanıtın JSON olup olmadığını kontrol etmeden önce .text() kullanmak daha güvenli olabilir.
    const responseText = await response.text();
    
    if (!response.ok) {
      // Hata durumunda, responseText'i (eğer varsa) error olarak kullan
      return NextResponse.json({ error: responseText || "API error" }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText); // responseText'i JSON olarak parse etmeyi dene
    } catch {
      data = responseText; // Parse edilemezse, ham text'i data olarak ata
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Proxy GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch from API (GET)" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: any) {
  const params = await getParams(context);
  const path = params.path.join("/");
  const token = getTokenFromRequest(request);

  try {
    const body = await request.json(); // POST body'sini al
    const response = await fetch(`${API_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: responseText || "API error" }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Proxy POST error:", error);
    // request.json() fail olursa buraya düşebilir.
    if (error.message.includes("Unexpected token")) {
        return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to fetch from API (POST)" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const params = await getParams(context);
  const path = params.path.join("/");
  const token = getTokenFromRequest(request);

  try {
    const response = await fetch(`${API_URL}/${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json", // DELETE için body yoksa bile Content-Type gerekebilir API'nize göre
        ...(token ? { Authorization: token } : {}),
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: responseText || "API error" }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // DELETE sonrası backend boş yanıt dönebilir veya JSON olmayan bir şey.
      // Eğer responseText boşsa, data undefined olur, bu da sorun değil.
      data = responseText || null; // Boş string yerine null tercih edilebilir.
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Proxy DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch from API (DELETE)" }, { status: 500 });
  }
}

// PUT Handler (api-service.ts'de PUT kullanan metodlar varsa gereklidir)
export async function PUT(request: NextRequest, context: any) {
  const params = await getParams(context);
  const path = params.path.join("/");
  const token = getTokenFromRequest(request);

  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: responseText || "API error" }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Proxy PUT error:", error);
    if (error.message.includes("Unexpected token")) {
        return NextResponse.json({ error: "Invalid JSON in request body for PUT." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to fetch from API (PUT)" }, { status: 500 });
  }
}