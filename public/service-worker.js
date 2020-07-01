const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/favicon.ico",
    "/styles.css",
    "/icons/icon-144x144.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v2";
const RUNTIME = "runtime";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

//      caches.open(CACHE_NAME)
//          .then(cache => cache.addAll(FILES_TO_CACHE))
//           .then(self.skipWaiting())
//     );
// });


self.addEventListener("activate", function (evt) {
    const currentCache = [CACHE_NAME, RUNTIME];
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removed old cahced data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    evt.respondWith(
        cache.match(evt.request).then(function (response) {
            return response || fetch(evt.request);
        })
    );
});