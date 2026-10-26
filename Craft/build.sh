#!/usr/bin/env bash
# Build each Craft app's web version and collect the static sites here, one folder per app
# (webdir/<app>/), next to the launcher (index.html) and the app icons (icons/).
#
# Usage: webdir/build.sh [app ...]      (default: every app)
#
# Needs: the wasm32-unknown-unknown target, trunk, wasm-bindgen-cli 0.2.129 (FilmCraft builds
# with its own `cargo xtask web`, which calls it directly) and, optionally, binaryen's wasm-opt.
# A failed build leaves that app's previous copy in place; the summary lists the failures.
#
# patches/<app>.patch takes the Discord buttons out of that app (and, for PhotoCraft and
# VectorCraft, the brand mark at the start of the web build's menu bar). It is applied to the app's
# working tree (and left there) unless it already is; if it no longer applies, the app isn't built.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
APPS=(deckcraft designcraft filmcraft gridcraft pdfcraft photocraft soundcraft vectorcraft wordcraft)
[[ $# -gt 0 ]] && APPS=("$@")

mkdir -p "$HERE/icons"
built=()
failed=()
for app in "${APPS[@]}"; do
  echo "==> $app ($(date +%H:%M:%S))"
  patch="$HERE/patches/$app.patch"
  if [[ -f "$patch" ]] && ! git -C "$ROOT/$app" apply --reverse --check "$patch" 2>/dev/null; then
    if ! git -C "$ROOT/$app" apply "$patch"; then
      echo "!! $app: patches/$app.patch no longer applies (the app's code changed); update it"
      failed+=("$app")
      continue
    fi
    echo "applied patches/$app.patch"
  fi
  if [[ "$app" == filmcraft ]]; then
    site="$ROOT/filmcraft/target/web/dist"
    (cd "$ROOT/filmcraft" && cargo xtask web)
  else
    site="$ROOT/$app/dist/web"
    # No content hashes in file names, so each build replaces the same files (serve.py stops
    # browsers reusing a stale copy).
    (cd "$ROOT/$app/apps/$app-web" && trunk build --release --filehash false)
  fi
  if [[ $? -ne 0 || ! -f "$site/index.html" ]]; then
    echo "!! $app: build failed"
    failed+=("$app")
    continue
  fi
  rm -rf "${HERE:?}/$app"
  mkdir -p "$HERE/$app"
  cp -R "$site/." "$HERE/$app/"
  cp "$ROOT/$app/assets/app-icon/hicolor/256x256/apps/ai.storyteller.$app.png" "$HERE/icons/$app.png"
  built+=("$app")
  echo "<== $app: $(du -sh "$HERE/$app" | cut -f1)"
done

echo
echo "built:  ${built[*]:-none}"
echo "failed: ${failed[*]:-none}"
[[ ${#failed[@]} -eq 0 ]]
