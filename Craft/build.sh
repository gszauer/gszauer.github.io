#!/usr/bin/env bash
# Build each Craft app's web version and collect the static sites here, one folder per app
# (webdir/<app>/), next to the launcher (index.html) and the app icons (icons/).
#
# Usage: webdir/build.sh [app ...]      (default: every app)
#
# Needs: the wasm32-unknown-unknown target, trunk, wasm-bindgen-cli 0.2.129 (FilmCraft builds
# with its own `cargo xtask web`, which calls it directly) and, optionally, binaryen's wasm-opt.
# A failed build leaves that app's previous copy in place; the summary lists the failures.
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
  if [[ "$app" == filmcraft ]]; then
    site="$ROOT/filmcraft/target/web/dist"
    (cd "$ROOT/filmcraft" && cargo xtask web)
  else
    site="$ROOT/$app/dist/web"
    (cd "$ROOT/$app/apps/$app-web" && trunk build --release)
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
