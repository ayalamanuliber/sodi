#!/usr/bin/env python3
"""Submit all SODI URLs to IndexNow (Bing, DuckDuckGo, Yandex)."""

import json
import os
import requests

KEY = "6d5094cafb9c42959d7750b49d31b075"
HOST = "sodi.com.ar"
CONTENT_DIR = os.path.join(os.path.dirname(__file__), "..", "content")

def get_all_urls():
    urls = [
        f"https://{HOST}",
        f"https://{HOST}/blog",
        f"https://{HOST}/diagnostico",
    ]

    for f in sorted(os.listdir(CONTENT_DIR)):
        if f.endswith(".json"):
            slug = f.replace(".json", "")
            urls.append(f"https://{HOST}/blog/{slug}")

    return urls

def submit(engine_url):
    urls = get_all_urls()
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": f"https://{HOST}/{KEY}.txt",
        "urlList": urls,
    }

    print(f"\nSubmitting {len(urls)} URLs to {engine_url}...")
    try:
        r = requests.post(
            f"{engine_url}/indexnow",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        print(f"  Status: {r.status_code}")
        if r.status_code == 200:
            print("  Success!")
        elif r.status_code == 202:
            print("  Accepted (will be processed)")
        else:
            print(f"  Response: {r.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    urls = get_all_urls()
    print(f"Total URLs to submit: {len(urls)}")
    print(f"Key: {KEY}")
    print(f"First 5: {urls[:5]}")
    print(f"Last 5: {urls[-5:]}")

    for engine in [
        "https://api.indexnow.org",
        "https://www.bing.com",
        "https://yandex.com",
    ]:
        submit(engine)

    print("\nDone! DuckDuckGo uses Bing's index, so it's covered.")
