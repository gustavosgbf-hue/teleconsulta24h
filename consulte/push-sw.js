self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  var title = data.title || 'ConsultaJá24h';
  var options = {
    body: data.body || 'Você tem uma atualização no seu atendimento.',
    icon: '/apple-icon-180x180.png',
    badge: '/apple-icon-180x180.png',
    tag: data.atendimentoId ? 'pagamento-' + data.atendimentoId : 'consulta24h',
    renotify: false,
    data: { url: data.url || '/consulta/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || '/consulta/';
  event.waitUntil((async function() {
    var clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < clientsList.length; i++) {
      var client = clientsList[i];
      if ('focus' in client) {
        try { await client.navigate(target); } catch (e) {}
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(target);
  })());
});
