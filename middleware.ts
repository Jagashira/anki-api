import { NextResponse, type NextRequest } from "next/server";

// 許可するオリジンのリスト
const allowedOrigins = [
  // あなたの新しいChrome拡張機能のID
  "chrome-extension://ooigjceiiklimnhblplokmpkopjliman",
  // ローカル開発用（Viteサーバー）
  "http://localhost:5173",
];

export function middleware(request: NextRequest) {
  // APIへのリクエストでなければ、何もしない
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Preflightリクエスト(OPTIONS)への対応
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    const origin = request.headers.get("origin");

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-API-Key, Authorization"
    );
    response.headers.set("Access-Control-Max-Age", "86400");

    return response;
  }

  // 通常のリクエストへの対応
  const response = NextResponse.next();
  const origin = request.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

// Middlewareを適用するパスを指定
export const config = {
  matcher: "/api/:path*",
};
