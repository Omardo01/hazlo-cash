// Service worker de Hazlo Cash: SOLO avisos push.
//
// Va en JavaScript porque el navegador lo carga directo desde /sw.js, sin
// pasar por el build de la app. A propósito no intercepta peticiones ni guarda
// nada en caché: así la app nunca se queda pegada en una versión vieja.
//
// El aviso llega de la Edge Function enviar-push como { title, body, url }.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(datos.title || 'Hazlo Cash', {
      body: datos.body || '',
      icon: '/icons/icon-192.png',
      data: { url: datos.url || '/' },
      lang: 'es-MX',
    }),
  );
});

// Tocar el aviso: si la app ya está abierta se trae al frente; si no, se abre.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const abierta = ventanas.find((v) => new URL(v.url).origin === self.location.origin);
      if (abierta) return abierta.focus();
      return self.clients.openWindow(destino);
    })(),
  );
});
