#!/usr/bin/env python3
"""Serve webdir (the launcher and the apps) on http://127.0.0.1:8080/, or on the port given.

Usage: python3 webdir/serve.py [port]

Build file names stay the same from build to build, so every response says
`Cache-Control: no-cache`: the browser revalidates each file (a cheap 304 when it hasn't changed)
instead of reusing a stale .wasm, which would also fail index.html's integrity check.
"""
import functools
import http.server
import os
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
root = os.path.dirname(os.path.abspath(__file__))
with http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=root)) as httpd:
    print(f"serving {root} on http://127.0.0.1:{port}/", flush=True)
    httpd.serve_forever()
