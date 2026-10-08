#!/usr/bin/env python3
"""Parity check: https://sodi.com.ar (Vercel) vs a Workers URL. Read-only GETs/HEADs only.
Usage: cf/parity.py https://sodi.cf-workers-20261008.workers.dev [out.json]"""
import sys, re, json, hashlib, concurrent.futures as cf, urllib.request, urllib.error, urllib.parse
PROD = "https://sodi.com.ar"
NEW = sys.argv[1].rstrip("/")
OUT = sys.argv[2] if len(sys.argv) > 2 else "parity.json"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
opener = urllib.request.build_opener(NoRedirect)

def get(url):
    url = urllib.parse.quote(url, safe=":/?&=%#")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        r = opener.open(req, timeout=40); code, h, body = r.status, r.headers, r.read()
    except urllib.error.HTTPError as e:
        code, h, body = e.code, e.headers, e.read()
    except Exception as e:
        return {"err": str(e)}
    return {"status": code, "ct": h.get("content-type"), "cc": h.get("cache-control"), "loc": h.get("location"),
            "xrt": h.get("x-robots-tag"), "body": body}

def first(rx, s, flags=re.S | re.I):
    m = re.search(rx, s, flags); return (m.group(1).strip() if m else None)

def semantic(body):
    s = body.decode("utf-8", "replace")
    return {
        "title": first(r"<title[^>]*>(.*?)</title>", s),
        "desc": first(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', s),
        "canon": first(r'<link[^>]+rel="canonical"[^>]+href="([^"]*)"', s),
        "h1": [re.sub(r"<[^>]+>", "", x).strip() for x in re.findall(r"<h1[^>]*>(.*?)</h1>", s, re.S | re.I)],
        "ld": sorted(hashlib.sha256(x.strip().encode()).hexdigest()[:12] for x in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', s, re.S | re.I)),
        "hreflang": sorted(re.findall(r'<link[^>]+hreflang="[^"]*"[^>]*>', s)),
        "robots": first(r'<meta[^>]+name="robots"[^>]+content="([^"]*)"', s),
        "text": hashlib.sha256(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)\b.*?</\1>", "", s, flags=re.S | re.I))).strip().encode()).hexdigest()[:16],
        "links": sorted(set(x for x in re.findall(r'<a[^>]+href="([^"]*)"', s))),
        "og": sorted(re.findall(r'<meta[^>]+property="og:[^"]*"[^>]*>', s)),
    }

def norm_hash(body):
    s = body.decode("utf-8", "replace")
    s = re.sub(r"/_next/static/[^\"' )\\]+", "/_next/static/X", s)
    s = re.sub(r'"b":"[^"]*"', '"b":"X"', s)
    s = re.sub(r'dpl_[A-Za-z0-9]+|\?dpl=[A-Za-z0-9_]+', 'DPL', s)
    s = re.sub(r'\$undefined|"nonce":"[^"]*"', '', s)
    return hashlib.sha256(s.encode()).hexdigest()

def check(path):
    a, b = get(PROD + path), get(NEW + path)
    rec = {"path": path, "diffs": []}
    if "err" in a or "err" in b:
        rec["diffs"].append(f"error prod={a.get('err')} new={b.get('err')}"); return rec
    for k in ("status", "loc"):
        if a[k] != b[k]: rec["diffs"].append(f"{k}: {a[k]} vs {b[k]}")
    if (a["ct"] or "").lower() != (b["ct"] or "").lower(): rec["diffs"].append(f"content-type: {a['ct']} vs {b['ct']}")
    if a["cc"] != b["cc"]: rec["diffs"].append(f"cache-control: {a['cc']} vs {b['cc']}")
    rec["status"] = a["status"]
    ha, hb = hashlib.sha256(a["body"]).hexdigest(), hashlib.sha256(b["body"]).hexdigest()
    rec["exact"] = ha == hb
    if not rec["exact"]:
        rec["norm"] = norm_hash(a["body"]) == norm_hash(b["body"])
        if "html" in (a["ct"] or ""):
            sa, sb = semantic(a["body"]), semantic(b["body"])
            sd = [k for k in sa if sa[k] != sb[k]]
            rec["semantic_ok"] = not sd
            if sd: rec["diffs"].append("semantic: " + ",".join(sd))
        else:
            rec["semantic_ok"] = False
            rec["diffs"].append(f"body differs ({len(a['body'])} vs {len(b['body'])} bytes)")
    return rec

def sitemap_paths():
    b = get(PROD + "/sitemap.xml")["body"].decode()
    return [urllib.parse.urlparse(u).path or "/" for u in re.findall(r"<loc>(.*?)</loc>", b)]

EXTRA = ["/", "/robots.txt", "/sitemap.xml", "/blog", "/plantillas", "/diagnostico", "/directorio", "/directorio-comercial-argentino",
         "/directorio-comercial-argentino/pago-error", "/directorio/pago-error", "/propuestas/edifier", "/boda", "/boda/prueba", "/invitacion",
         "/boda/x-no-existe", "/blog/", "/diagnostico/", "/nope-xyz", "/blog/nope-xyz", "/favicon.ico", "/6d5094cafb9c42959d7750b49d31b075.txt",
         "/api/boda/rsvp", "/api/boda/invitados", "/api/boda/configuracion", "/api/boda/cancion", "/api/boda/admin/login", "/api/boda/admin/logout",
         "/api/checkout", "/api/directorio/download", "/api/directorio/confirm", "/api/mercadopago/webhook", "/api/boda-studio",
         "/_next/image?url=%2Ffavicon.ico&w=64&q=75"]
paths = list(dict.fromkeys(EXTRA + sitemap_paths()))
res = []
with cf.ThreadPoolExecutor(12) as ex:
    for r in ex.map(check, paths): res.append(r)
json.dump(res, open(OUT, "w"), indent=1)
n = len(res); exact = sum(r.get("exact", False) for r in res)
sem = sum((not r.get("exact", False)) and r.get("semantic_ok", False) and not any(not d.startswith("semantic") for d in r["diffs"]) for r in res)
clean = [r for r in res if not r["diffs"]]
print(f"checked={n} exact_body={exact} no_diffs(any metadata)={len(clean)} with_diffs={n-len(clean)}")
from collections import Counter
c = Counter(d.split(":")[0] for r in res for d in r["diffs"]); print("diff kinds:", dict(c))
for r in res:
    if r["diffs"]: print(r["path"], "|", "; ".join(r["diffs"]))
