// node --test tools/agenda-slots-client.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../psicologo-online/agenda-slots-client.js');

const AGORA = Date.parse('2026-11-20T23:30:00.000Z'); // 20:30 de 20/11 em Fortaleza

test('hoje em Fortaleza independe do fuso do navegador', () => {
  assert.equal(A.hojeFortaleza(AGORA), '2026-11-20');
  assert.equal(A.hojeFortaleza(Date.parse('2026-11-21T02:59:00Z')), '2026-11-20');
  assert.equal(A.hojeFortaleza(Date.parse('2026-11-21T03:00:00Z')), '2026-11-21');
});

test('filtra passados, além de 90 dias, duplicados, inválidos e indisponíveis', () => {
  const slots = [
    { iso: '2026-11-20T23:00:00.000Z', data: '2026-11-20', hora: '20:00' },    // passado
    { iso: '2026-11-20T23:32:00.000Z', data: '2026-11-20', hora: '20:32' },    // dentro da margem de 5 min
    { iso: '2026-11-21T12:00:00.000Z', data: '2026-11-21', hora: '09:00' },
    { iso: '2026-11-21T12:00:00Z', data: '2026-11-21', hora: '09:00' },        // duplicado
    { iso: '2026-11-22T13:00:00.000Z', data: '2026-11-22', hora: '10:00' },    // indisponível
    { iso: '2027-03-01T12:00:00.000Z', data: '2027-03-01', hora: '09:00' },    // > 90 dias
    { iso: 'lixo' }, null, { data: '2026-11-23' },
  ];
  const out = A.filtrarSlots(slots, { agoraMs: AGORA, indisponiveis: { '2026-11-22T13:00:00.000Z': true } });
  assert.deepEqual(out.map(s => s.iso), ['2026-11-21T12:00:00.000Z']);
  assert.equal(out[0].label, 'Sáb 21/nov às 09:00');
});

test('sem data/hora da API, deriva de Fortaleza (UTC-3)', () => {
  const [s] = A.filtrarSlots([{ iso: '2026-11-25T01:30:00.000Z' }], { agoraMs: AGORA });
  assert.equal(s.data, '2026-11-24');
  assert.equal(s.hora, '22:30');
});

test('grade semanal legada interpretada em Fortaleza', () => {
  const out = A.slotsDeGradeSemanal({ 6: ['09:00'], 0: ['25:00', 'x'] }, '2026-11-20', 14, AGORA);
  assert.deepEqual(out.map(s => s.iso), ['2026-11-21T12:00:00.000Z', '2026-11-28T12:00:00.000Z']);
  assert.deepEqual(A.slotsDeGradeSemanal('texto livre', '2026-11-20', 14, AGORA), []);
});

function respostaSlots(inicio, slots, proximo) {
  return { status: 200, ok: true, json: async () => ({ ok: true, inicio, fim: A.somarDias(inicio, 13), proximo_inicio: proximo, disponibilidade_estruturada: true, slots }) };
}

test('pagina em janelas de 14 dias, pula janelas vazias e usa cache ao voltar', async () => {
  const urls = [];
  let t = AGORA;
  const fetch = async (url) => {
    urls.push(url);
    const inicio = /inicio=([\d-]+)/.exec(url)[1];
    if (inicio === '2026-11-20') return respostaSlots(inicio, [], '2026-12-04');
    if (inicio === '2026-12-04') return respostaSlots(inicio, [{ iso: '2026-12-05T12:00:00.000Z', data: '2026-12-05', hora: '09:00' }], '2026-12-18');
    if (inicio === '2026-12-18') return respostaSlots(inicio, [{ iso: '2026-12-19T12:00:00.000Z', data: '2026-12-19', hora: '09:00' }], null);
    throw new Error('inesperado ' + url);
  };
  const ag = A.criarAgenda({ api: 'https://api', profissionalId: 5, fetch, agora: () => t, sleep: async (ms) => { t += ms; } });
  const p1 = await ag.primeira();
  assert.equal(p1.inicio, '2026-12-04'); // pulou a janela vazia automaticamente
  assert.equal(p1.slots.length, 1);
  assert.ok(p1.temAnterior && p1.temProxima);
  assert.ok(urls.every(u => /dias=14/.test(u) && u.startsWith('https://api/api/psicologia/slots/5?')));
  const p2 = await ag.proxima();
  assert.equal(p2.inicio, '2026-12-18');
  assert.equal(p2.temProxima, false);
  const n = urls.length;
  const p3 = await ag.anterior();
  assert.equal(p3.inicio, '2026-12-04');
  await ag.proxima();
  assert.equal(urls.length, n, 'voltar/avançar usa cache');
});

test('limite de requisições e intervalo mínimo entre chamadas', async () => {
  let t = AGORA;
  const chamadas = [];
  const fetch = async (url) => {
    chamadas.push(t);
    const inicio = /inicio=([\d-]+)/.exec(url)[1];
    return respostaSlots(inicio, [], A.somarDias(inicio, 14));
  };
  const ag = A.criarAgenda({ api: 'x', profissionalId: 1, fetch, agora: () => t, sleep: async (ms) => { t += ms; } });
  await ag.primeira();
  let erro = null;
  try { for (let i = 0; i < 20; i++) await ag.proxima(); } catch (e) { erro = e; }
  assert.ok(chamadas.length <= A.MAX_REQ_SESSAO);
  for (let i = 1; i < chamadas.length; i++) assert.ok(chamadas[i] - chamadas[i - 1] >= 700);
  // 90 dias / 14 = 7 janelas: o cliente para no horizonte mesmo se a API insistir
  assert.equal(erro, null);
  assert.equal(chamadas.length, 7);
  assert.equal(ag.atual().temProxima, false);
  assert.ok(A.diffDias(ag.atual().inicio, A.somarDias('2026-11-20', 90)) < 14);
});

test('limite local de requisições por sessão', async () => {
  let n = 0;
  const fetch = async () => { n++; return { status: 500, ok: false, json: async () => ({ ok: false, error: 'falhou' }) }; };
  const ag = A.criarAgenda({ api: 'x', profissionalId: 1, fetch, agora: () => AGORA, sleep: async () => {} });
  let ultimo;
  for (let i = 0; i < 30; i++) { try { await ag.recarregar(); } catch (e) { ultimo = e; } }
  assert.equal(n, A.MAX_REQ_SESSAO);
  assert.equal(ultimo.codigo, 'limite_local');
});

test('429 vira mensagem amigável; rota ausente usa grade legada', async () => {
  const ag429 = A.criarAgenda({ api: 'x', profissionalId: 1, agora: () => AGORA, sleep: async () => {},
    fetch: async () => ({ status: 429, ok: false, json: async () => ({ ok: false }) }) });
  await assert.rejects(ag429.primeira(), e => e.codigo === 'rate_limit');

  const agLeg = A.criarAgenda({ api: 'x', profissionalId: 1, agora: () => AGORA, sleep: async () => {},
    disponibilidadeLegada: '{"6":["09:00"]}',
    fetch: async () => ({ status: 404, ok: false, json: async () => { throw new Error('html'); } }) });
  const pg = await agLeg.primeira();
  assert.equal(pg.legado, true);
  assert.equal(pg.slots[0].iso, '2026-11-21T12:00:00.000Z');
});

test('horário marcado indisponível (409) some da janela', async () => {
  const fetch = async (url) => respostaSlots('2026-11-20', [
    { iso: '2026-11-21T12:00:00.000Z', data: '2026-11-21', hora: '09:00' },
    { iso: '2026-11-21T13:00:00.000Z', data: '2026-11-21', hora: '10:00' },
  ], null);
  const ag = A.criarAgenda({ api: 'x', profissionalId: 1, fetch, agora: () => AGORA, sleep: async () => {} });
  await ag.primeira();
  ag.marcarIndisponivel('2026-11-21T12:00:00Z');
  assert.deepEqual(ag.atual().slots.map(s => s.hora), ['10:00']);
  assert.equal(ag.atual().grupos[0].rotulo, 'Sáb, 21/nov');
});
