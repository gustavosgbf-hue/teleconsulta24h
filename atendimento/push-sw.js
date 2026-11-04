self.addEventListener('push', function(event){
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  var title = data.title || 'ConsultaJá24h';
  var options = {
    body: data.body || 'Você recebeu uma atualização no seu atendimento.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.atendimentoId ? 'cj24h-chat-' + data.atendimentoId : 'cj24h-chat',
    renotify: true,
    data: { url: data.url || '/atendimento/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/atendimento/';
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    for (var i=0;i<list.length;i++) {
      var c=list[i];
      if ('focus' in c) { c.navigate(url); return c.focus(); }
    }
    return clients.openWindow ? clients.openWindow(url) : null;
  }));
});
