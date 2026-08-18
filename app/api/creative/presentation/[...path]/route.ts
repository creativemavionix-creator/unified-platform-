import { NextRequest, NextResponse } from "next/server";
import { getOperationCost } from "@/lib/creative-tokens";
import { deductServerTokens } from "@/lib/creative-tokens-server";

const BACKEND_BASE = (process.env.PRESENTATION_API_BACKEND_URL ?? "http://localhost:8001").replace(/\/$/, "");

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const cost = getOperationCost(`presentation/${path}`, request.method);

  if (cost > 0) {
    const tokenResult = await deductServerTokens(cost);
    if (!tokenResult.ok) {
      return NextResponse.json(
        { error: tokenResult.error, balance: tokenResult.balance },
        { status: 402 }
      );
    }
  }

  const targetUrl = `${BACKEND_BASE}/api/${path}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Presentation API unavailable";
    return NextResponse.json(
      {
        error: `Presentation backend is not reachable at ${BACKEND_BASE}. Start it with: cd ai-presentation-builder/api && uvicorn app.main:app --reload --port 8001`,
        detail: message,
      },
      { status: 503 }
    );
  }

  const responseType = backendResponse.headers.get("content-type") ?? "";
  if (responseType.includes("application/json")) {
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  }

  return new NextResponse(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: {
      "content-type": responseType || "application/octet-stream",
    },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
