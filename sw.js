/* ============================================================
 * sw.js —— Service Worker（PWA 离线缓存）
 * 策略：缓存优先 + 后台更新（首次在线时缓存核心资源）
 * ============================================================ */
var CACHE = 'portfolio-v2';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './i18n.js',
  './app.js',
  './avatar.jpg',
  './resume.pdf',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        // 离线兜底：尝试返回缓存的入口页
        return caches.match('./index.html', { ignoreSearch: true });
      });
    })
  );
});
