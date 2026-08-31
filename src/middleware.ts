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

const PUBLIC_DISCOVERY_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/6d5094cafb9c42959d7750b49d31b075.txt",
]);

export function middleware(request: NextRequest) {
  if (PUBLIC_DISCOVERY_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

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
    "/((?!_next/static|_next/image|boda/assets|favicon.ico|icon-.*\\.png|.*\\.svg).*)",
  ],
};
