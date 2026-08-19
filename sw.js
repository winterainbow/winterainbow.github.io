/* ============================================================
 * sw.js —— Service Worker（PWA 离线缓存）
 * 策略：网络优先（在线永远拿最新资源）+ 离线回退缓存
 * ============================================================ */
var CACHE = 'portfolio-v3';
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
  // 网络优先：在线时永远拉取最新资源（避免旧缓存覆盖新样式/新功能），并顺手更新缓存
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && req.url.indexOf('busuanzi') === -1) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      // 离线兜底：忽略版本参数匹配缓存，失败再回退入口页
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || caches.match('./index.html', { ignoreSearch: true });
      });
    })
  );
});
