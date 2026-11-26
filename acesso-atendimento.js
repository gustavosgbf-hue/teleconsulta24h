/* Acesso seguro ao atendimento (chat, status e documentos).
   - Guarda a chave do atendimento recebida do servidor e a envia nas chamadas do próprio atendimento.
   - Aceita a chave vinda em link (#k=...) e remove do endereço.
   - Se o servidor pedir confirmação, abre a verificação por código no e-mail. */
(function () {
  'use strict';
  if (window.__cjAcessoAtendimento) return;
  window.__cjAcessoAtendimento = true;

  var API_RE = /^https:\/\/triagem-api\.onrender\.com\/api\//;
  var API = 'https://triagem-api.onrender.com';
  var PREFIXO = 'cj_ak_';
  var TOKEN = 'cj_paciente_token';

  function ler(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function gravar(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }
  function chaveDe(id) { return id ? ler(PREFIXO + id) : ''; }
  function salvarChave(id, k) {
    if (/^\d+$/.test(String(id || '')) && /^[A-Za-z0-9_-]{20,100}$/.test(String(k || ''))) gravar(PREFIXO + id, k);
  }

  try {
    var m = String(location.hash || '').match(/[#&]k=([A-Za-z0-9_-]{20,100})/);
    if (m) {
      var q = new URLSearchParams(location.search);
      var idLink = q.get('consulta') || q.get('retomar_pagamento') || q.get('atendimento');
      salvarChave(idLink, m[1]);
      history.replaceState(null, '', location.pathname + location.search);
    }
  } catch (e) {}

  function idDaUrl(u) {
    var r = String(u).match(/\/api\/(?:chat|atendimento\/status)\/(\d+)/);
    return r ? r[1] : '';
  }
  function idDoCorpo(b) {
    try {
      if (!b) return '';
      if (typeof b === 'string') {
        var j = JSON.parse(b);
        return String((j && (j.atendimentoId || j.atendimento_id || j.filaId)) || '');
      }
      if (typeof FormData !== 'undefined' && b instanceof FormData) return String(b.get('atendimentoId') || '');
    } catch (e) {}
    return '';
  }

  var fetchNativo = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : '';
    if (!url || !API_RE.test(url)) return fetchNativo.apply(this, arguments);
    try {
      var opcoes = init ? Object.assign({}, init) : {};
      var id = idDaUrl(url) || idDoCorpo(opcoes.body);
      var headers = new Headers(opcoes.headers || {});
      var chave = chaveDe(id);
      if (chave && !headers.has('X-Atendimento-Chave')) headers.set('X-Atendimento-Chave', chave);
      var token = ler(TOKEN);
      if (token && id && !headers.has('Authorization') && /\/api\/(chat|atendimento\/status)/.test(url)) {
        headers.set('Authorization', 'Bearer ' + token);
      }
      opcoes.headers = headers;
      return fetchNativo.call(this, url, opcoes).then(function (res) {
        try {
          var nova = res.headers.get('X-Atendimento-Chave-Nova');
          var idNovo = res.headers.get('X-Atendimento-Id');
          if (nova && idNovo) salvarChave(idNovo, nova);
        } catch (e) {}
        if (res.status === 401 && /\/api\/chat\//.test(url)) {
          res.clone().json().then(function (j) {
            if (j && j.code === 'ACESSO_NECESSARIO') abrirConfirmacao(id);
          }).catch(function () {});
        }
        return res;
      });
    } catch (e) {
      return fetchNativo.apply(this, arguments);
    }
  };

  // ── Confirmação de acesso por código no e-mail ─────────────────────────────
  var aberto = false;
  function el(tag, attrs, txt) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function post(caminho, corpo) {
    return fetchNativo(API + caminho, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo),
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.__status = r.status; return j; }); });
  }

  function abrirConfirmacao(atendimentoId) {
    if (aberto || !document.body) return;
    aberto = true;
    var jaLogado = !!ler(TOKEN);

    var fundo = el('div', { id: 'cjAcessoFundo', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cjAcessoTitulo' });
    fundo.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(3,10,9,.82);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Outfit,system-ui,sans-serif';
    var caixa = el('div');
    caixa.style.cssText = 'width:100%;max-width:400px;background:#07100f;border:1px solid rgba(94,224,160,.35);border-radius:18px;padding:24px;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    var titulo = el('h2', { id: 'cjAcessoTitulo' }, 'Confirme que é você');
    titulo.style.cssText = 'margin:0 0 8px;font-size:20px;font-weight:700';
    var texto = el('p', {}, jaLogado
      ? 'Não encontramos este atendimento na sua conta. Confirme com o celular usado no atendimento.'
      : 'Para proteger sua conversa e seus documentos, enviaremos um código para o seu e-mail.');
    texto.style.cssText = 'margin:0 0 16px;font-size:15px;line-height:1.45;color:rgba(255,255,255,.82)';
    var area = el('div');
    var erro = el('p', { role: 'alert' });
    erro.style.cssText = 'margin:10px 0 0;font-size:14px;color:#ff8484;min-height:1em';
    var ajuda = el('p');
    ajuda.style.cssText = 'margin:14px 0 0;font-size:13px;color:rgba(255,255,255,.6)';
    ajuda.appendChild(document.createTextNode('Precisa de ajuda? '));
    var zap = el('a', { href: 'https://wa.me/5598989272727', target: '_blank', rel: 'noopener' }, 'Fale com o suporte');
    zap.style.color = '#5ee0a0';
    ajuda.appendChild(zap);
    caixa.appendChild(titulo); caixa.appendChild(texto); caixa.appendChild(area); caixa.appendChild(erro); caixa.appendChild(ajuda);
    fundo.appendChild(caixa);
    document.body.appendChild(fundo);

    function campo(rotulo, attrs) {
      var l = el('label', {}, rotulo);
      l.style.cssText = 'display:block;font-size:13px;color:rgba(255,255,255,.7);margin:10px 0 6px';
      var i = el('input', attrs);
      i.style.cssText = 'width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:#0d1b19;color:#fff;font-size:16px';
      area.appendChild(l); area.appendChild(i);
      return i;
    }
    function botao(txt, acao) {
      var b = el('button', { type: 'button' }, txt);
      b.style.cssText = 'margin-top:16px;width:100%;padding:13px;border:0;border-radius:12px;background:#5ee0a0;color:#03130f;font-weight:700;font-size:16px;cursor:pointer';
      b.onclick = function () {
        erro.textContent = '';
        b.disabled = true;
        Promise.resolve(acao()).catch(function () { erro.textContent = 'Não foi possível continuar agora. Tente novamente.'; })
          .then(function () { b.disabled = false; });
      };
      area.appendChild(b);
      return b;
    }

    var telefone = '';
    function passoTelefone() {
      area.innerHTML = '';
      var tel = campo('Celular com DDD', { type: 'tel', inputmode: 'tel', autocomplete: 'tel', placeholder: '(98) 99999-9999' });
      botao('Enviar código', function () {
        telefone = tel.value;
        return post('/api/paciente/otp/solicitar', { telefone: telefone }).then(function (j) {
          if (j.challenge_id) return passoCodigo(j.challenge_id, j.email_mascarado);
          if (j.precisa_dados) return passoDados(j.precisa_cpf);
          erro.textContent = j.error || 'Não foi possível enviar o código.';
        });
      });
      tel.focus();
    }
    function passoDados(pedeCpf) {
      area.innerHTML = '';
      texto.textContent = 'Informe um e-mail para receber o código' + (pedeCpf ? ' e o CPF usado no atendimento.' : '.');
      var email = campo('E-mail', { type: 'email', autocomplete: 'email' });
      var cpf = campo('CPF', { inputmode: 'numeric', autocomplete: 'off', placeholder: '000.000.000-00' });
      botao('Enviar código', function () {
        return post('/api/paciente/otp/solicitar', { telefone: telefone, email: email.value, cpf: cpf.value }).then(function (j) {
          if (j.challenge_id) return passoCodigo(j.challenge_id, j.email_mascarado);
          erro.textContent = j.error || 'Não foi possível enviar o código.';
        });
      });
    }
    function passoCodigo(desafio, emailMascarado) {
      area.innerHTML = '';
      texto.textContent = 'Enviamos um código de 6 dígitos para ' + (emailMascarado || 'o seu e-mail') + '.';
      var cod = campo('Código', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
      botao('Confirmar', function () {
        return post('/api/paciente/otp/verificar', { challenge_id: desafio, codigo: cod.value }).then(function (j) {
          if (j.token) { gravar(TOKEN, j.token); location.reload(); return; }
          erro.textContent = j.error || 'Código inválido.';
        });
      });
      cod.focus();
    }
    passoTelefone();
  }

  window.cjAcessoAtendimento = { salvarChave: salvarChave, abrirConfirmacao: abrirConfirmacao };
})();
