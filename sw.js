// Redirect any leftover GitHub Pages service worker to the new Netlify address.
var NEW_ORIGIN = 'https://rampa-israel.netlify.app';
var PREFIX = '/rampa';

function toNewUrl(oldUrl) {
  var url = new URL(oldUrl, self.location.origin);
  var path = url.pathname || '/';
  if (path.indexOf(PREFIX) === 0) {
    path = path.slice(PREFIX.length);
  }
  if (!path) path = '/';
  if (path.charAt(0) !== '/') path = '/' + path;
  return NEW_ORIGIN + path + url.search + url.hash;
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.map(function (key) { return caches.delete(key); }));
    await self.clients.claim();
    var clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map(function (client) {
      if (client.navigate) return client.navigate(toNewUrl(client.url));
      return null;
    }));
    await self.registration.unregister();
  })());
});
