import { NextRequest, NextResponse } from "next/server";
import { getOperationCost } from "@/lib/creative-tokens";
import { deductServerTokens } from "@/lib/creative-tokens-server";

const BACKEND_BASE = (process.env.IMAGE_API_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

function rewriteResponseUrls(payload: unknown): unknown {
  if (typeof payload === "string") {
    if (payload.startsWith(`${BACKEND_BASE}/static/`)) {
      return payload.replace(`${BACKEND_BASE}/static/`, "/api/creative/static/");
    }
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(rewriteResponseUrls);
  }

  if (payload && typeof payload === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      next[key] = rewriteResponseUrls(value);
    }
    return next;
  }

  return payload;
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const cost = getOperationCost(path, request.method);

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
    const message = error instanceof Error ? error.message : "Image API unavailable";
    return NextResponse.json(
      {
        error: `Photo editor backend is not reachable at ${BACKEND_BASE}. Start it with: cd photo-editor-dashboard/api && uvicorn app.main:app --reload --port 8000`,
        detail: message,
      },
      { status: 503 }
    );
  }

  const responseType = backendResponse.headers.get("content-type") ?? "";
  if (responseType.includes("application/json")) {
    const data = await backendResponse.json();
    const rewritten = rewriteResponseUrls(data);
    return NextResponse.json(rewritten, { status: backendResponse.status });
  }

  return new NextResponse(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: {
      "content-type": responseType || "application/octet-stream",
    },
  });
}

type RouteContext = { params: { path: string[] } | Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params.path);
}
