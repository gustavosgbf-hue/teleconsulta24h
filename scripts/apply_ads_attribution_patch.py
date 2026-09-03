from pathlib import Path

p = Path('consulta/index.html')
s = p.read_text()
start = s.index('function moAdsParamPermitido(chave){')
end = s.index('function moLimparParametrosAntigosDaTriagem(){', start)
new_block = r'''function moAdsParamPermitido(chave){
  return !!chave && chave.toLowerCase() !== 'cpf' && (/^utm_/i.test(chave)||/^gtm_/i.test(chave)||['gclid','gbraid','wbraid','fbclid','debug_tag','force_tag'].indexOf(chave)>=0);
}

function moAdsLerStorage(chave){
  try{
    var raw = sessionStorage.getItem(chave) || localStorage.getItem(chave) || '';
    return raw ? (JSON.parse(raw) || {}) : {};
  }catch(e){ return {}; }
}

function moAdsSalvarStorage(chave,obj){
  try{
    var json = JSON.stringify(obj || {});
    sessionStorage.setItem(chave,json);
    localStorage.setItem(chave,json);
  }catch(e){}
}

function moAdsSnapshotAtual(){
  var snap = {
    landing_url: location.href,
    referrer: document.referrer || '',
    captured_at: new Date().toISOString()
  };
  try{
    var origem = new URLSearchParams(window.location.search);
    origem.forEach(function(valor,chave){
      if(moAdsParamPermitido(chave) && valor) snap[chave] = valor;
    });
  }catch(e){}
  return snap;
}

function moAdsSomenteParams(obj){
  var out = {};
  Object.keys(obj || {}).forEach(function(chave){
    if(moAdsParamPermitido(chave) && obj[chave]) out[chave] = obj[chave];
  });
  return out;
}

function moSalvarAdsParamsAtuais(){
  try{
    var snap = moAdsSnapshotAtual();
    var first = moAdsLerStorage('cj_ads_first_touch');
    if(!first || !first.captured_at) moAdsSalvarStorage('cj_ads_first_touch', snap);

    var paramsAtuais = moAdsSomenteParams(snap);
    if(Object.keys(paramsAtuais).length){
      moAdsSalvarStorage('cj_ads_last_touch', snap);
      // Mantem a chave antiga por compatibilidade com paginas/builds anteriores.
      moAdsSalvarStorage('cj_ads_params', paramsAtuais);
    }
  }catch(e){}
}

function moAdsUltimoTouch(){
  var last = moAdsLerStorage('cj_ads_last_touch');
  if(last && Object.keys(moAdsSomenteParams(last)).length) return last;
  var legacy = moAdsLerStorage('cj_ads_params');
  if(legacy && Object.keys(moAdsSomenteParams(legacy)).length) return legacy;
  return {};
}

function moAplicarAdsParamsSalvos(params){
  try{
    var salvos = moAdsUltimoTouch();
    Object.keys(salvos || {}).forEach(function(chave){
      if(moAdsParamPermitido(chave) && salvos[chave] && !params.has(chave)) params.set(chave, salvos[chave]);
    });
  }catch(e){}
}

function moAdsAttributionPayload(){
  var first = moAdsLerStorage('cj_ads_first_touch');
  var last = moAdsUltimoTouch();
  var out = moAdsSomenteParams(last);
  try{
    var atual = new URLSearchParams(window.location.search);
    atual.forEach(function(valor,chave){
      if(moAdsParamPermitido(chave) && valor) out[chave] = valor;
    });
  }catch(e){}

  // Mantem os campos legados com semantica de origem, evitando que paginas internas
  // como /confirmado substituam a landing/referrer que realmente trouxeram o paciente.
  out.landing_url = first.landing_url || last.landing_url || location.href;
  out.referrer = first.referrer || last.referrer || document.referrer || '';
  out.first_touch_at = first.captured_at || '';
  out.first_landing_url = first.landing_url || '';
  out.first_referrer = first.referrer || '';
  out.last_touch_at = last.captured_at || '';
  out.last_landing_url = last.landing_url || '';
  out.last_referrer = last.referrer || '';
  out.checkout_session_id = moGetCheckoutSessionId();
  out.user_agent = navigator.userAgent || '';
  return out;
}

'''
s = s[:start] + new_block + s[end:]
p.write_text(s)

p = Path('confirmado.html')
s = p.read_text()
old = "var adsRaw = sessionStorage.getItem('cj_ads_params') || localStorage.getItem('cj_ads_params') || '{}';\n    var adsSalvos = JSON.parse(adsRaw);"
new = "var adsRaw = sessionStorage.getItem('cj_ads_last_touch') || localStorage.getItem('cj_ads_last_touch') || sessionStorage.getItem('cj_ads_params') || localStorage.getItem('cj_ads_params') || '{}';\n    var adsSalvos = JSON.parse(adsRaw);"
if old not in s:
    raise SystemExit('confirmado fallback anchor not found')
s = s.replace(old, new, 1)

anchor = "  function pingConfirmadoView(){\n    var payload = {"
replacement = "  function pingConfirmadoView(){\n    var firstTouch = {};\n    var lastTouch = {};\n    try{ firstTouch = JSON.parse(sessionStorage.getItem('cj_ads_first_touch') || localStorage.getItem('cj_ads_first_touch') || '{}') || {}; }catch(e){}\n    try{ lastTouch = JSON.parse(sessionStorage.getItem('cj_ads_last_touch') || localStorage.getItem('cj_ads_last_touch') || '{}') || {}; }catch(e){}\n    var payload = {"
if anchor not in s:
    raise SystemExit('ping anchor not found')
s = s.replace(anchor, replacement, 1)

anchor2 = "      utm_content: params.get('utm_content') || '',\n      href: location.href,\n      referrer: document.referrer || ''"
replacement2 = "      utm_content: params.get('utm_content') || '',\n      firstTouchAt: firstTouch.captured_at || '',\n      firstLandingUrl: firstTouch.landing_url || '',\n      firstReferrer: firstTouch.referrer || '',\n      lastTouchAt: lastTouch.captured_at || '',\n      lastLandingUrl: lastTouch.landing_url || '',\n      lastReferrer: lastTouch.referrer || '',\n      href: location.href,\n      referrer: document.referrer || ''"
if anchor2 not in s:
    raise SystemExit('payload anchor not found')
s = s.replace(anchor2, replacement2, 1)
p.write_text(s)

c = Path('consulta/index.html').read_text()
f = Path('confirmado.html').read_text()
assert "cj_ads_first_touch" in c and "cj_ads_last_touch" in c
assert "firstLandingUrl" in f and "utm_source" in f and "fbclid" in f
assert "AW-17964942771/AT3gCPTl0PsbELOLrfZC" in f
print('ads attribution patch applied')
