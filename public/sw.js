// Service Worker para Comida Wings & Boneless PWA
const CACHE_VERSION = "comida-wings-v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DATA_CACHE = `data-${CACHE_VERSION}`;

// Recursos iniciales críticos para precachear en la instalación
const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
  "/api/products",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        // Precacheamos los recursos tolerando posibles fallos individuales
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            fetch(url, { cache: "reload" })
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((err) => {
                console.warn(`[SW] Precache omitido para ${url}:`, err);
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptamos peticiones GET y del protocolo http/https
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. Catálogo de productos y API de datos: Estrategia Network-First con fallback a Caché
  if (url.pathname.startsWith("/api/products")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return new Response(
            JSON.stringify({
              error: "offline",
              message: "Estás navegando sin conexión a internet.",
              products: [],
            }),
            {
              headers: { "Content-Type": "application/json" },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // 2. Navegación de páginas HTML: Network-First con fallback a la última versión en caché o la Home
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const homePage = await caches.match("/");
          if (homePage) return homePage;

          return new Response(
            `<!DOCTYPE html>
            <html lang="es">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Modo Sin Conexión | Comida Wings</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
                  h1 { color: #FFC72C; font-size: 2rem; margin-bottom: 0.5rem; }
                  p { color: #a3a3a3; max-width: 400px; line-height: 1.5; font-size: 0.95rem; }
                  button { background: #005A36; color: white; border: none; padding: 12px 24px; border-radius: 9999px; font-weight: bold; cursor: pointer; margin-top: 1.5rem; }
                </style>
              </head>
              <body>
                <h1>🍗 Sin Conexión</h1>
                <p>Parece que perdiste tu conexión a internet. Revisa tus datos móviles o WiFi para seguir explorando el menú.</p>
                <button onclick="window.location.reload()">Reintentar Conexión</button>
              </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html" },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // 3. Activos Estáticos (imágenes, CSS, JS, fuentes, iconos): Estrategia Cache-First
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|woff|woff2|css|js|ico)$/i) ||
    url.hostname.includes("unsplash.com") ||
    url.hostname.includes("supabase.co");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Si está en caché, devolvemos y en segundo plano actualizamos el caché si es conveniente
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // En caso de fallo de red en imagen, retornar un SVG transparente vacío
            if (request.destination === "image") {
              return new Response(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#262626"/></svg>',
                { headers: { "Content-Type": "image/svg+xml" } }
              );
            }
          });
      })
    );
    return;
  }

  // 4. Default: Network con fallback a caché
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
