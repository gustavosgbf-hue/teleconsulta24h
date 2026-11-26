/* Microsoft Advertising (UET). Carregado apenas em páginas de entrada e na confirmação de pagamento.
   Não envia dados pessoais nem clínicos: só pageLoad (páginas de entrada) e o evento "purchase" com valor.
   Nunca atrasa a navegação do paciente: tudo é assíncrono. */
(function () {
  var TI = '187301293';
  if (!/^\d+$/.test(TI)) return;

  var script = document.currentScript;
  // data-manual="1" (confirmação): carrega o bat.js logo, mas sem pageLoad,
  // para não enviar a URL antes de a página limpar parâmetros sensíveis.
  var manual = !!(script && script.getAttribute('data-manual') === '1');

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
        if (!manual) window.uetq.push('pageLoad');
      } catch (e) {}
    };
    var ref = document.getElementsByTagName('script')[0];
    ref.parentNode.insertBefore(s, ref);
  } catch (e) {}

  // Conversão: somente pagamento confirmado, uma vez por atendimento neste navegador.
  // Apenas enfileira o evento e retorna; não bloqueia nem atrasa o redirecionamento.
  window.cjUetPurchase = function (txId, valor) {
    try {
      var chave = 'cj_uet_purchase_' + String(txId || '');
      if (!txId || localStorage.getItem(chave)) return;
      localStorage.setItem(chave, '1');
    } catch (e) {}
    try {
      window.uetq = window.uetq || [];
      window.uetq.push('event', 'purchase', {
        revenue_value: Number(valor) || 0,
        currency: 'BRL'
      });
    } catch (e) {}
  };
})();
