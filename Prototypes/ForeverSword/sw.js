// The HTML5 build's service worker (tools/build.mjs puts it beside the page): it keeps a copy of each file of the game
// as it is fetched, so that the game installed (a PWA) starts, and plays, without a connection.
// Every file the page loads is stamped with a hash of its contents (?v=<hash>: js/fresh.js), so a stamped file once
// kept is good for ever: those come from the copies, and from the network only the first time. The page itself and the
// rest (the manifest, the icons) come from the network, and from the copies only when there is none — a new build is
// played as soon as there is a connection, and brings its new stamps. Of each file only the latest copy is kept.
const COPIES = 'forever-sword-arena';
const PAGE = new URL('./', self.location).href;          // the page, however it was asked for, is kept as the folder's

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('range')) return;
  if (request.mode === 'navigate') event.respondWith(online(event, PAGE));
  else event.respondWith(url.searchParams.has('v') ? kept(event) : online(event, request.url));
});

/** A stamped file: the copy, or the network's (then kept). */
async function kept(event) {
  const copies = await caches.open(COPIES);
  return (await copies.match(event.request)) ?? keep(event, copies, event.request.url, await fetch(event.request));
}

/** The network's (then kept, as `key`); the copy only when there is no network. */
async function online(event, key) {
  const copies = await caches.open(COPIES);
  try { return keep(event, copies, key, await fetch(event.request)); }
  catch (error) { const copy = await copies.match(key); if (copy) return copy; throw error; }
}

/** Keeps a copy of a whole answer (not a part, an error or a redirect) as `key`, in place of any older copy of that
 *  file, and hands the answer on at once: the page reads it as it arrives (the preloader counts it) while it is kept. */
function keep(event, copies, key, response) {
  if (response.status !== 200 || response.type !== 'basic') return response;
  const path = new URL(key).pathname, copy = response.clone();
  event.waitUntil((async () => {
    for (const old of await copies.keys()) if (old.url !== key && new URL(old.url).pathname === path) await copies.delete(old);
    await copies.put(key, copy);
  })().catch(() => {}));                                 // (no room, say: it is fetched again next time)
  return response;
}
