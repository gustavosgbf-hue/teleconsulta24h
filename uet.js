/* Microsoft Advertising (UET). Carregado apenas em páginas de entrada e na confirmação de pagamento.
   Não envia dados pessoais nem clínicos: só pageLoad e o evento "purchase" com valor. */
(function () {
  var TI = '187301293';
  if (!/^\d+$/.test(TI)) return;

  var script = document.currentScript;
  var manual = !!(script && script.getAttribute('data-manual') === '1');
  var carregando = null;

  function carregar() {
    if (carregando) return carregando;
    carregando = new Promise(function (resolve) {
      try {
        window.uetq = window.uetq || [];
        var s = document.createElement('script');
        s.src = 'https://bat.bing.net/bat.js?ti=' + TI;
        s.async = true;
        s.onload = function () {
          try {
            var o = { ti: TI, enableAutoSpaTracking: false };
            o.q = window.uetq;
            window.uetq = new UET(o);
            window.uetq.push('pageLoad');
          } catch (e) {}
          resolve();
        };
        s.onerror = function () { resolve(); };
        var ref = document.getElementsByTagName('script')[0];
        ref.parentNode.insertBefore(s, ref);
      } catch (e) { resolve(); }
    });
    return carregando;
  }

  // Conversão: somente pagamento confirmado, uma vez por atendimento neste navegador.
  // Retorna uma Promise que resolve em no máximo ~2,5 s, para não atrasar o paciente.
  window.cjUetPurchase = function (txId, valor) {
    var limite = new Promise(function (r) { setTimeout(r, 2500); });
    try {
      var chave = 'cj_uet_purchase_' + String(txId || '');
      if (!txId || localStorage.getItem(chave)) return Promise.resolve();
      localStorage.setItem(chave, '1');
    } catch (e) {}
    var envio = carregar().then(function () {
      try {
        window.uetq = window.uetq || [];
        window.uetq.push('event', 'purchase', {
          revenue_value: Number(valor) || 0,
          currency: 'BRL'
        });
      } catch (e) {}
      return new Promise(function (r) { setTimeout(r, 600); });
    });
    return Promise.race([envio, limite]);
  };

  if (!manual) carregar();
})();
