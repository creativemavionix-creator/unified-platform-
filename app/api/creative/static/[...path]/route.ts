import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = (process.env.IMAGE_API_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = `${BACKEND_BASE}/static/${path.join("/")}${request.nextUrl.search}`;

  try {
    const backendResponse = await fetch(targetUrl, { cache: "no-store" });
    if (!backendResponse.ok) {
      return NextResponse.json({ error: "Static asset not found" }, { status: backendResponse.status });
    }

    const contentType = backendResponse.headers.get("content-type") ?? "application/octet-stream";
    return new NextResponse(await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image backend unavailable" }, { status: 503 });
  }
}
