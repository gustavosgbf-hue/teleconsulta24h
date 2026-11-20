/*
 * agenda-slots-client.js — agenda de Psicologia consumindo a API paginada.
 *
 *   GET /api/psicologia/slots/:id?inicio=AAAA-MM-DD&dias=14
 *
 * - Janelas de até 14 dias, navegação até 90 dias (limites também impostos pelo backend).
 * - Fuso oficial America/Fortaleza (UTC-3, sem horário de verão): rótulos vêm de
 *   `data`/`hora` devolvidos pelo backend — nunca do fuso do navegador.
 * - Filtra horários passados, duplicados, inválidos ou marcados indisponíveis (409).
 * - Limite de requisições por sessão do modal, intervalo mínimo entre chamadas,
 *   cache por janela (voltar/avançar não refaz requisição) e AbortController.
 *
 * Exposto em window.CJAgendaPsi (e module.exports para testes em Node).
 */
(function (root) {
  'use strict';

  var TZ = 'America/Fortaleza';
  var OFFSET_FORTALEZA_MIN = -180; // UTC-3 fixo
  var JANELA_DIAS = 14;
  var HORIZONTE_DIAS = 90;
  var MAX_REQ_SESSAO = 12;          // 90/14 ≈ 7 janelas + folga p/ erros e recarga após 409
  var INTERVALO_MIN_MS = 700;
  var AUTO_AVANCO_MAX = 2;          // janelas vazias puladas automaticamente
  var MARGEM_PASSADO_MS = 5 * 60 * 1000;
  var DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /** 'AAAA-MM-DD' de hoje em Fortaleza (independe do fuso do navegador). */
  function hojeFortaleza(agoraMs) {
    var d = new Date((agoraMs == null ? Date.now() : agoraMs) + OFFSET_FORTALEZA_MIN * 60000);
    return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
  }

  function parseData(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = Date.UTC(y, mo - 1, d);
    var chk = new Date(t);
    if (chk.getUTCFullYear() !== y || chk.getUTCMonth() !== mo - 1 || chk.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d, t: t };
  }

  function somarDias(dataStr, n) {
    var p = parseData(dataStr);
    if (!p) return null;
    var d = new Date(p.t + n * 86400000);
    return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
  }

  function diffDias(a, b) {
    var pa = parseData(a), pb = parseData(b);
    if (!pa || !pb) return NaN;
    return Math.round((pb.t - pa.t) / 86400000);
  }

  function rotuloDia(dataStr) {
    var p = parseData(dataStr);
    if (!p) return '';
    var dow = new Date(p.t).getUTCDay();
    return DIAS[dow] + ', ' + p.d + '/' + MESES[p.m - 1];
  }

  function rotuloSlot(slot) {
    return rotuloDia(slot.data).replace(',', '') + ' às ' + slot.hora;
  }

  function rotuloPeriodo(inicio, fim) {
    var a = parseData(inicio), b = parseData(fim || inicio);
    if (!a || !b) return '';
    return a.d + '/' + MESES[a.m - 1] + ' – ' + b.d + '/' + MESES[b.m - 1];
  }

  /** Data/hora de Fortaleza a partir de um instante ISO (fallback quando a API não manda). */
  function partesFortaleza(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return null;
    var d = new Date(t + OFFSET_FORTALEZA_MIN * 60000);
    return {
      data: d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()),
      hora: pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes())
    };
  }

  /**
   * Normaliza e filtra os slots recebidos: remove inválidos, passados (com margem),
   * fora do horizonte, duplicados e os marcados como indisponíveis.
   */
  function filtrarSlots(lista, opts) {
    opts = opts || {};
    var agora = opts.agoraMs == null ? Date.now() : opts.agoraMs;
    var limite = agora + HORIZONTE_DIAS * 86400000;
    var indisponiveis = opts.indisponiveis || {};
    var vistos = {};
    var out = [];
    (Array.isArray(lista) ? lista : []).forEach(function (s) {
      if (!s || typeof s.iso !== 'string') return;
      var t = Date.parse(s.iso);
      if (!isFinite(t) || t <= agora + MARGEM_PASSADO_MS || t > limite) return;
      var iso = new Date(t).toISOString();
      if (vistos[iso] || indisponiveis[iso]) return;
      vistos[iso] = true;
      var p = partesFortaleza(iso);
      var data = /^\d{4}-\d{2}-\d{2}$/.test(s.data || '') ? s.data : p.data;
      var hora = /^\d{2}:\d{2}$/.test(s.hora || '') ? s.hora : p.hora;
      var slot = { iso: iso, data: data, hora: hora };
      slot.label = rotuloSlot(slot);
      out.push(slot);
    });
    out.sort(function (a, b) { return a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0; });
    return out;
  }

  function agruparPorDia(slots) {
    var grupos = [];
    var atual = null;
    slots.forEach(function (s) {
      if (!atual || atual.data !== s.data) {
        atual = { data: s.data, rotulo: rotuloDia(s.data), slots: [] };
        grupos.push(atual);
      }
      atual.slots.push(s);
    });
    return grupos;
  }

  /**
   * Fallback (backend antigo sem /slots): grade semanal {"0":["09:00"],...} interpretada
   * em Fortaleza. O backend continua sendo a autoridade na reserva (409 se ocupado).
   */
  function slotsDeGradeSemanal(disp, inicio, dias, agoraMs) {
    var obj = disp;
    if (typeof obj === 'string') { try { obj = JSON.parse(obj); } catch (_) { obj = null; } }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    var out = [];
    for (var i = 0; i < dias; i++) {
      var data = somarDias(inicio, i);
      var p = parseData(data);
      if (!p) continue;
      var dow = String(new Date(p.t).getUTCDay());
      var horas = Array.isArray(obj[dow]) ? obj[dow] : [];
      horas.slice(0, 48).forEach(function (h) {
        var m = /^(\d{1,2}):(\d{2})$/.exec(String(h).trim());
        if (!m || +m[1] > 23 || +m[2] > 59) return;
        var t = Date.UTC(p.y, p.m - 1, p.d, +m[1], +m[2]) - OFFSET_FORTALEZA_MIN * 60000;
        out.push({ iso: new Date(t).toISOString(), data: data, hora: pad2(+m[1]) + ':' + m[2] });
      });
    }
    return filtrarSlots(out, { agoraMs: agoraMs });
  }

  /**
   * Controlador de agenda de um profissional.
   *   cfg: { api, profissionalId, fetch, disponibilidadeLegada, agora, sleep }
   * Métodos: primeira(), proxima(), anterior(), atual(), marcarIndisponivel(iso), abortar()
   */
  function criarAgenda(cfg) {
    var fetchFn = cfg.fetch || (typeof fetch !== 'undefined' ? fetch.bind(root) : null);
    var agoraFn = cfg.agora || function () { return Date.now(); };
    var sleep = cfg.sleep || function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var estado = {
      paginas: [], idx: -1, reqs: 0, ultimoReq: 0, carregando: false,
      indisponiveis: {}, ctrl: null, legado: false, encerrado: false
    };

    function hoje() { return hojeFortaleza(agoraFn()); }

    function fimHorizonte() { return somarDias(hoje(), HORIZONTE_DIAS); }

    /** Próxima janela só se estiver dentro do horizonte (não confia cegamente na API). */
    function proximoValido(pg) {
      var prox = pg && pg.proximo_inicio;
      return prox && diffDias(prox, fimHorizonte()) >= 0 ? prox : null;
    }

    function erro(msg, codigo) { var e = new Error(msg); e.codigo = codigo; return e; }

    function paginaLegada(inicio) {
      var restantes = diffDias(inicio, fimHorizonte()) + 1;
      var dias = Math.max(0, Math.min(JANELA_DIAS, restantes));
      var fim = somarDias(inicio, Math.max(0, dias - 1));
      var prox = somarDias(inicio, dias);
      return {
        inicio: inicio, fim: fim,
        proximo_inicio: diffDias(prox, fimHorizonte()) >= 0 ? prox : null,
        slots: slotsDeGradeSemanal(cfg.disponibilidadeLegada, inicio, dias, agoraFn()),
        legado: true
      };
    }

    function buscar(inicio) {
      if (estado.legado) return Promise.resolve(paginaLegada(inicio));
      if (estado.reqs >= MAX_REQ_SESSAO) {
        return Promise.reject(erro('Limite de consultas atingido. Feche e abra a agenda novamente para ver mais datas.', 'limite_local'));
      }
      var espera = estado.ultimoReq + INTERVALO_MIN_MS - agoraFn();
      return (espera > 0 ? sleep(espera) : Promise.resolve()).then(function () {
        if (estado.encerrado) throw erro('Agenda fechada.', 'abortado');
        estado.reqs++;
        estado.ultimoReq = agoraFn();
        estado.ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var url = cfg.api + '/api/psicologia/slots/' + encodeURIComponent(String(cfg.profissionalId)) +
          '?inicio=' + encodeURIComponent(inicio) + '&dias=' + JANELA_DIAS;
        return fetchFn(url, { signal: estado.ctrl ? estado.ctrl.signal : undefined, headers: { accept: 'application/json' } });
      }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (d) {
          if (r.status === 429) throw erro('Muitas consultas seguidas. Aguarde alguns segundos e tente de novo.', 'rate_limit');
          if (r.status === 404 && !(d && d.ok === false)) {
            // Rota inexistente (backend antigo): usa a grade do perfil no fuso de Fortaleza.
            if (cfg.disponibilidadeLegada != null) { estado.legado = true; return paginaLegada(inicio); }
            throw erro('Agenda indisponível no momento.', 'sem_rota');
          }
          if (!r.ok || !d || d.ok !== true) throw erro((d && d.error) || 'Não foi possível carregar os horários.', 'http_' + r.status);
          return {
            inicio: d.inicio || inicio,
            fim: d.fim || somarDias(inicio, JANELA_DIAS - 1),
            proximo_inicio: d.proximo_inicio || null,
            estruturada: d.disponibilidade_estruturada !== false,
            slots: filtrarSlots(d.slots, { agoraMs: agoraFn(), indisponiveis: estado.indisponiveis })
          };
        });
      });
    }

    function carregar(inicio, autoRestante) {
      if (estado.carregando) return Promise.reject(erro('Carregando…', 'ocupado'));
      estado.carregando = true;
      return buscar(inicio).then(function (pg) {
        estado.carregando = false;
        estado.paginas = estado.paginas.slice(0, estado.idx + 1);
        estado.paginas.push(pg);
        estado.idx = estado.paginas.length - 1;
        if (!pg.slots.length && proximoValido(pg) && autoRestante > 0 && pg.estruturada !== false) {
          return carregar(proximoValido(pg), autoRestante - 1);
        }
        return atual();
      }, function (e) { estado.carregando = false; throw e; });
    }

    function atual() {
      var pg = estado.paginas[estado.idx];
      if (!pg) return null;
      var slots = pg.slots.filter(function (s) {
        return !estado.indisponiveis[s.iso] && Date.parse(s.iso) > agoraFn() + MARGEM_PASSADO_MS;
      });
      return {
        inicio: pg.inicio, fim: pg.fim, periodo: rotuloPeriodo(pg.inicio, pg.fim),
        slots: slots, grupos: agruparPorDia(slots),
        temAnterior: estado.idx > 0,
        temProxima: !!proximoValido(pg),
        estruturada: pg.estruturada !== false,
        legado: !!pg.legado,
        timezone: TZ
      };
    }

    return {
      primeira: function () {
        estado.paginas = []; estado.idx = -1;
        return carregar(hoje(), AUTO_AVANCO_MAX);
      },
      proxima: function () {
        var pg = estado.paginas[estado.idx];
        if (!pg || !proximoValido(pg)) return Promise.resolve(atual());
        if (estado.paginas[estado.idx + 1]) { estado.idx++; return Promise.resolve(atual()); }
        return carregar(proximoValido(pg), 0);
      },
      anterior: function () {
        if (estado.idx > 0) estado.idx--;
        return Promise.resolve(atual());
      },
      /** Recarrega a janela atual (ex.: após 409), sem usar cache. */
      recarregar: function () {
        var pg = estado.paginas[estado.idx];
        if (!pg) return this.primeira();
        estado.paginas = estado.paginas.slice(0, estado.idx);
        estado.idx = estado.paginas.length - 1;
        return carregar(pg.inicio, 0);
      },
      atual: atual,
      marcarIndisponivel: function (iso) {
        var t = Date.parse(iso);
        if (isFinite(t)) estado.indisponiveis[new Date(t).toISOString()] = true;
      },
      abortar: function () {
        estado.encerrado = true;
        if (estado.ctrl) { try { estado.ctrl.abort(); } catch (_) {} }
      },
      _estado: estado
    };
  }

  var api = {
    TZ: TZ, JANELA_DIAS: JANELA_DIAS, HORIZONTE_DIAS: HORIZONTE_DIAS, MAX_REQ_SESSAO: MAX_REQ_SESSAO,
    hojeFortaleza: hojeFortaleza, somarDias: somarDias, diffDias: diffDias,
    rotuloDia: rotuloDia, rotuloSlot: rotuloSlot, rotuloPeriodo: rotuloPeriodo,
    filtrarSlots: filtrarSlots, agruparPorDia: agruparPorDia,
    slotsDeGradeSemanal: slotsDeGradeSemanal, criarAgenda: criarAgenda
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CJAgendaPsi = api;
})(typeof window !== 'undefined' ? window : globalThis);
