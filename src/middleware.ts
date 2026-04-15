import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCKED_BOTS = [
  "scraperforce",
  "scrapy",
  "python-requests",
  "httpx",
  "curl/",
  "wget/",
  "go-http-client",
  "java/",
  "libwww-perl",
  "php/",
  "mechanize",
  "aiohttp",
  "node-fetch",
  "undici",
];

const BLOCKED_CRAWLERS = [
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "blexbot",
  "dataforseobot",
  "bytespider",
  "petalbot",
  "zoominfobot",
  "diffbot",
  "barkrowler",
  "megaindex",
  "bomborabot",
  "sogou",
  "baiduspider",
];

export function middleware(request: NextRequest) {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  // Block known bad bots and scrapers
  for (const bot of [...BLOCKED_BOTS, ...BLOCKED_CRAWLERS]) {
    if (ua.includes(bot)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Block empty user agents (usually bots)
  if (!ua || ua.length < 10) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|.*\\.svg).*)",
  ],
};
