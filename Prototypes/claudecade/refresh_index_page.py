#!/usr/bin/env python3
"""Scans for HTML game files and updates index.html."""

import os
import re
import html

DIR = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(DIR, "index.html")

def get_title(filepath):
    """Extract <title> content from an HTML file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read(4096)
    m = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None

ICONS = [
    "&#9876;&#65039;",   # sword
    "&#128163;",         # bomb
    "&#127918;",         # gamepad
    "&#128640;",         # rocket
    "&#9889;",           # lightning
    "&#128142;",         # gem
    "&#127942;",         # trophy
    "&#128126;",         # alien
    "&#128293;",         # fire
    "&#127775;",         # star
]

def build_entry(filename, title, index):
    """Build one game card HTML block."""
    safe_title = html.escape(title)
    safe_href = html.escape(filename)
    icon = ICONS[index % len(ICONS)]
    return (
        f'        <a class="game-card" href="{safe_href}">'
        f'<div class="card-icon">{icon}</div>'
        f'<div class="card-title">{safe_title}</div></a>'
    )

def main():
    # Collect games
    games = []
    for f in sorted(os.listdir(DIR)):
        if f.lower().endswith(".html") and f.lower() != "index.html":
            title = get_title(os.path.join(DIR, f))
            if title:
                games.append((f, title))

    if not games:
        print("No game HTML files found.")
        return

    # Build game entries
    entries = "\n".join(build_entry(f, t, i) for i, (f, t) in enumerate(games))
    block = f"        <!-- GAMES_START -->\n{entries}\n        <!-- GAMES_END -->"

    # Read index.html
    with open(INDEX, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace between markers
    pattern = r" *<!-- GAMES_START -->.*?<!-- GAMES_END -->"
    new_content = re.sub(pattern, block, content, flags=re.DOTALL)

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated index.html with {len(games)} game(s):")
    for f, t in games:
        print(f"  - {t} ({f})")

if __name__ == "__main__":
    main()
