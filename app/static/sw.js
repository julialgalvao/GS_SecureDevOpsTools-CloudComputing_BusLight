// Service worker: guarda o site e as últimas respostas da API para funcionar com internet ruim.
const CACHE = "buslight-v1";
const ARQUIVOS = [
  "/",
  "/static/style.css",
  "/static/app.js",
  "/static/icone.svg",
  "/static/vendor/leaflet/leaflet.css",
  "/static/vendor/leaflet/leaflet.js",
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n)))),
  );
});

self.addEventListener("fetch", (ev) => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== "GET" || url.origin !== self.location.origin) return;
  // chegada ao vivo não faz sentido vir do cache
  if (url.pathname.endsWith("/chegada")) return;

  // primeiro a rede; se falhar, a última versão guardada
  ev.respondWith(
    fetch(ev.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(ev.request, copia));
        return resp;
      })
      .catch(() => caches.match(ev.request)),
  );
});
