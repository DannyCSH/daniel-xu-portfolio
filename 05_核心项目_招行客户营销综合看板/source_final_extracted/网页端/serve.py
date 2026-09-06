#!/usr/bin/env python3
"""静态资源 + 招行网点公开接口本地代理（解决浏览器跨域）

用法:
  python3 serve.py
  打开 http://127.0.0.1:8765/

代理:
  /cmb-api/map/getCmbData?cityName=成都&type=B
  → https://map.cmbchina.com/api/map/getCmbData?...
"""

from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765
UPSTREAM = "https://map.cmbchina.com/api"
CTX = ssl._create_unverified_context()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/cmb-api/"):
            return self.proxy_cmb(parsed)
        return super().do_GET()

    def proxy_cmb(self, parsed: urllib.parse.ParseResult):
        sub = parsed.path[len("/cmb-api/") :]
        target = f"{UPSTREAM}/{sub}"
        if parsed.query:
            target = f"{target}?{parsed.query}"
        try:
            req = urllib.request.Request(
                target,
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://map.cmbchina.com/map",
                    "Accept": "application/json, text/plain, */*",
                    "X-B3-BusinessId": "task3-demo",
                },
            )
            with urllib.request.urlopen(req, timeout=20, context=CTX) as resp:
                body = resp.read()
                content_type = resp.headers.get("Content-Type", "application/json")
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as e:
            err = json.dumps(
                {"returnCode": "HTTP_ERR", "errorMsg": str(e), "body": None},
                ensure_ascii=False,
            ).encode("utf-8")
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(err)))
            self.end_headers()
            self.wfile.write(err)
        except Exception as e:
            err = json.dumps(
                {"returnCode": "PROXY_ERR", "errorMsg": str(e), "body": None},
                ensure_ascii=False,
            ).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(err)))
            self.end_headers()
            self.wfile.write(err)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


def main():
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Serving {ROOT}")
    print(f"Open http://{HOST}:{PORT}/")
    print(f"CMB proxy http://{HOST}:{PORT}/cmb-api/map/getCmbData?cityName=成都&type=B")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")


if __name__ == "__main__":
    main()
