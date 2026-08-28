(function (w) {
  'use strict';
  if (w.__cjAttendanceCapabilityInstalled) return;
  w.__cjAttendanceCapabilityInstalled = true;

  var CAP_KEY = 'cj_atendimento_caps_v1';
  var ORDER_KEY = 'cj_atendimento_order_map_v1';
  var HEADER = 'X-Atendimento-Token';
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  var nativeFetch = w.fetch.bind(w);
  var bootstrapInFlight = {};

  function now() { return Date.now(); }
  function positiveId(value) {
    var n = Number(value);
    return Number.isSafeInteger(n) && n > 0 ? String(n) : '';
  }
  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      var obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === 'object' ? obj : {};
    } catch (_) { return {}; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function pruneCaps(map) {
    var cutoff = now() - MAX_AGE;
    Object.keys(map || {}).forEach(function (id) {
      var item = map[id];
      if (!item || !item.token || Number(item.ts || 0) < cutoff) delete map[id];
    });
    return map;
  }
  function saveCapability(atendimentoId, token) {
    var id = positiveId(atendimentoId);
    var value = String(token || '').trim();
    if (!id || value.length < 32 || value.length > 200) return;
    var map = pruneCaps(readJson(CAP_KEY));
    map[id] = { token: value, ts: now() };
    writeJson(CAP_KEY, map);
  }
  function capabilityFor(atendimentoId) {
    var id = positiveId(atendimentoId);
    if (!id) return '';
    var map = pruneCaps(readJson(CAP_KEY));
    writeJson(CAP_KEY, map);
    return map[id] && map[id].token ? String(map[id].token) : '';
  }
  function saveOrder(orderId, atendimentoId) {
    var order = String(orderId || '').trim();
    var id = positiveId(atendimentoId);
    if (!order || !id) return;
    var map = readJson(ORDER_KEY);
    map[order] = { atendimentoId: id, ts: now() };
    var cutoff = now() - MAX_AGE;
    Object.keys(map).forEach(function (key) {
      if (!map[key] || Number(map[key].ts || 0) < cutoff) delete map[key];
    });
    writeJson(ORDER_KEY, map);
  }
  function attendanceForOrder(orderId) {
    var order = String(orderId || '').trim();
    if (!order) return '';
    var map = readJson(ORDER_KEY);
    if (map[order] && positiveId(map[order].atendimentoId)) return positiveId(map[order].atendimentoId);
    try {
      var sessao = JSON.parse(localStorage.getItem('cj_sessao') || '{}');
      if (String(sessao.pagbankOrderId || '') === order) return positiveId(sessao.atendimentoId);
    } catch (_) {}
    return '';
  }
  function currentAttendance() {
    try {
      var urlId = positiveId(new URL(w.location.href).searchParams.get('consulta'));
      if (urlId) return urlId;
    } catch (_) {}
    try {
      var sessao = JSON.parse(localStorage.getItem('cj_sessao') || '{}');
      var id = positiveId(sessao.atendimentoId);
      if (id) return id;
    } catch (_) {}
    return '';
  }
  function captureFragment(urlLike) {
    try {
      var u = new URL(String(urlLike || w.location.href), w.location.href);
      var hash = String(u.hash || '').replace(/^#/, '');
      if (!hash) return u;
      var params = new URLSearchParams(hash);
      var token = params.get('cap');
      if (token) {
        var id = positiveId(u.searchParams.get('consulta')) || currentAttendance();
        if (id) saveCapability(id, token);
        params.delete('cap');
        var rest = params.toString();
        u.hash = rest ? '#' + rest : '';
      }
      return u;
    } catch (_) { return null; }
  }
  function stripCurrentFragmentCapability() {
    var u = captureFragment(w.location.href);
    if (!u) return;
    if (u.href !== w.location.href) {
      try { history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch (_) {}
    }
  }

  stripCurrentFragmentCapability();

  ['replaceState', 'pushState'].forEach(function (name) {
    var original = history[name].bind(history);
    history[name] = function (state, title, url) {
      if (url == null) return original(state, title, url);
      var u = captureFragment(url);
      if (!u) return original(state, title, url);
      return original(state, title, u.pathname + u.search + u.hash);
    };
  });

  function urlOf(input) {
    try {
      if (input instanceof Request) return new URL(input.url, w.location.href);
      return new URL(String(input), w.location.href);
    } catch (_) { return null; }
  }
  function bodyObject(init) {
    var body = init && init.body;
    if (!body) return null;
    if (typeof body === 'string') {
      try { return JSON.parse(body); } catch (_) {
        try {
          var sp = new URLSearchParams(body);
          var o = {};
          sp.forEach(function (v, k) { o[k] = v; });
          return o;
        } catch (_) { return null; }
      }
    }
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      return { atendimentoId: body.get('atendimentoId'), orderId: body.get('orderId') };
    }
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
      return { atendimentoId: body.get('atendimentoId'), orderId: body.get('orderId') };
    }
    return null;
  }
  function attendanceFromRequest(url, init) {
    if (!url || !/\/api\//.test(url.pathname)) return '';
    var m = url.pathname.match(/\/api\/atendimento\/status\/(\d+)/)
      || url.pathname.match(/\/api\/chat\/(\d+)/)
      || url.pathname.match(/\/api\/pagamento\/elegibilidade\/(\d+)/)
      || url.pathname.match(/\/api\/atendimento\/(\d+)\/fallback-especialista/)
      || url.pathname.match(/\/api\/paciente\/atendimento\/(\d+)/);
    if (m) return positiveId(m[1]);

    var obj = bodyObject(init);
    var bodyId = positiveId(obj && (obj.atendimentoId || obj.filaId));
    if (bodyId) return bodyId;

    var orderMatch = url.pathname.match(/\/api\/pagbank\/order\/([^/?#]+)/);
    if (orderMatch) return attendanceForOrder(decodeURIComponent(orderMatch[1]));
    if (obj && obj.orderId) return attendanceForOrder(obj.orderId) || currentAttendance();

    return '';
  }
  function isBackendApi(url) {
    if (!url || !url.pathname.startsWith('/api/')) return false;
    var host = String(url.hostname || '').toLowerCase();
    return host === w.location.hostname.toLowerCase() || host === 'triagem-api.onrender.com';
  }
  function addCapabilityHeader(input, init, token) {
    if (!token) return { input: input, init: init };
    var nextInit = Object.assign({}, init || {});
    var headers = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined));
    if (!headers.has(HEADER)) headers.set(HEADER, token);
    nextInit.headers = headers;
    if (input instanceof Request) {
      try { return { input: new Request(input, nextInit), init: undefined }; } catch (_) {}
    }
    return { input: input, init: nextInit };
  }

  function legacySessionIdentity(atendimentoId) {
    var id = positiveId(atendimentoId);
    if (!id) return null;
    var candidatos = [];
    try { candidatos.push(JSON.parse(localStorage.getItem('cj_sessao') || 'null')); } catch (_) {}
    try { candidatos.push(JSON.parse(sessionStorage.getItem('mo_checkout_sessao') || 'null')); } catch (_) {}
    for (var i = 0; i < candidatos.length; i += 1) {
      var s = candidatos[i];
      if (!s || positiveId(s.atendimentoId) !== id) continue;
      var cpf = String(s.pacienteCPF || s.cpf || '').replace(/\D/g, '');
      var tel = String(s.pacienteTel || s.tel || '').replace(/\D/g, '');
      var nome = String(s.pacienteNome || s.nome || '').trim();
      if (cpf.length === 11 && tel.length >= 10 && nome.length >= 5) {
        return { atendimentoId: Number(id), cpf: cpf, tel: tel, nome: nome };
      }
    }
    return null;
  }

  function bootstrapLegacy(atendimentoId, backendUrl) {
    var id = positiveId(atendimentoId);
    if (!id || capabilityFor(id)) return Promise.resolve(capabilityFor(id));
    if (bootstrapInFlight[id]) return bootstrapInFlight[id];
    var identity = legacySessionIdentity(id);
    if (!identity) return Promise.resolve('');
    var endpoint;
    try { endpoint = new URL('/api/atendimento/capability/bootstrap', backendUrl || w.location.href); }
    catch (_) { return Promise.resolve(''); }

    bootstrapInFlight[id] = nativeFetch(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(identity),
      credentials: 'include'
    }).then(function (r) {
      if (!r.ok) return null;
      return r.json().catch(function () { return null; });
    }).then(function (data) {
      var legacyToken = data && data.atendimentoToken ? String(data.atendimentoToken) : '';
      if (legacyToken) saveCapability(id, legacyToken);
      return legacyToken;
    }).catch(function () { return ''; }).finally(function () {
      delete bootstrapInFlight[id];
    });
    return bootstrapInFlight[id];
  }

  function observeResponse(response, url, attendanceId) {
    try {
      if (!isBackendApi(url)) return Promise.resolve(response);
      return response.clone().json().then(function (data) {
        if (!data || typeof data !== 'object') return response;
        var responseId = positiveId(data.atendimentoId || (data.atendimento && data.atendimento.id)) || attendanceId;
        if (data.atendimentoToken && responseId) saveCapability(responseId, data.atendimentoToken);
        if (data.order_id && responseId) saveOrder(data.order_id, responseId);
        if (data.orderId && responseId) saveOrder(data.orderId, responseId);
        if (data.linkRetorno) captureFragment(data.linkRetorno);
        return response;
      }).catch(function () { return response; });
    } catch (_) { return Promise.resolve(response); }
  }

  w.fetch = function capabilityFetch(input, init) {
    var url = urlOf(input);
    var attendanceId = isBackendApi(url) ? attendanceFromRequest(url, init) : '';
    var token = attendanceId ? capabilityFor(attendanceId) : '';
    var patched = addCapabilityHeader(input, init, token);

    return nativeFetch(patched.input, patched.init).then(function (response) {
      if (response.status === 401 && attendanceId && !token && url
          && url.pathname !== '/api/atendimento/capability/bootstrap') {
        return bootstrapLegacy(attendanceId, url.href).then(function (legacyToken) {
          if (!legacyToken) return response;
          var retry = addCapabilityHeader(input, init, legacyToken);
          return nativeFetch(retry.input, retry.init);
        }).then(function (retried) {
          return observeResponse(retried, url, attendanceId);
        });
      }
      return observeResponse(response, url, attendanceId);
    });
  };

  w.ConsultaJaAtendimentoCapability = {
    get: capabilityFor,
    save: saveCapability,
    currentAttendance: currentAttendance,
    bootstrapLegacy: bootstrapLegacy
  };
})(window);
