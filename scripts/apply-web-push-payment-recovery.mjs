import fs from 'node:fs';

const path = 'consulta/index.html';
let s = fs.readFileSync(path, 'utf8');

function replaceOnce(needle, replacement, label) {
  if (!s.includes(needle)) throw new Error(`Patch point not found: ${label}`);
  s = s.replace(needle, replacement);
}

if (!s.includes('id="moPushRecoveryWrap"')) {
  replaceOnce(
    `      <div style="text-align:center;font-size:.68rem;color:rgba(255,255,255,.34);line-height:1.45">Após o pagamento, você será direcionado para a triagem médica. Sem mensalidade, fidelidade ou cobrança extra.</div>`,
    `      <div style="text-align:center;font-size:.68rem;color:rgba(255,255,255,.34);line-height:1.45">Após o pagamento, você será direcionado para a triagem médica. Sem mensalidade, fidelidade ou cobrança extra.</div>\n      <div id="moPushRecoveryWrap" style="display:none;margin-top:10px;padding:10px 11px;border-radius:11px;border:1px solid rgba(94,224,160,.15);background:rgba(94,224,160,.045);text-align:center">\n        <button type="button" id="moPushRecoveryBtn" onclick="moAtivarPushRecuperacao()" style="border:0;background:none;color:#b4e05a;font-family:'Outfit',sans-serif;font-size:.74rem;font-weight:700;cursor:pointer;padding:2px 4px">🔔 Avisar se o pagamento não concluir</button>\n        <div id="moPushRecoveryMeta" style="font-size:.61rem;color:rgba(255,255,255,.34);margin-top:3px;line-height:1.4">Opcional · o aviso funciona mesmo se você fechar esta página.</div>\n      </div>`,
    'push recovery UI'
  );
}

if (!s.includes('var moWebPushRegistrando=false;')) {
  replaceOnce(
    `var moStepAntesSaida=1,moTentouRecuperarSaida=false;`,
    `var moStepAntesSaida=1,moTentouRecuperarSaida=false;\nvar moWebPushRegistrando=false;`,
    'web push state'
  );
}

if (!s.includes('function moUrlBase64ToUint8Array')) {
  replaceOnce(
    `function moErroSeguro(msg){\n  return String(msg||'erro_desconhecido').replace(/\\s+/g,' ').slice(0,140);\n}\n`,
    `function moErroSeguro(msg){\n  return String(msg||'erro_desconhecido').replace(/\\s+/g,' ').slice(0,140);\n}\n\nfunction moUrlBase64ToUint8Array(base64String){\n  var padding='='.repeat((4-base64String.length%4)%4);\n  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');\n  var raw=window.atob(base64);\n  var output=new Uint8Array(raw.length);\n  for(var i=0;i<raw.length;i++) output[i]=raw.charCodeAt(i);\n  return output;\n}\n\nfunction moWebPushDisponivel(){\n  return !!(window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);\n}\n\nfunction moMostrarPushRecuperacao(){\n  if(!moWebPushDisponivel()||!moAtendimentoId) return;\n  var wrap=document.getElementById('moPushRecoveryWrap');\n  if(!wrap) return;\n  if(Notification.permission==='denied'){ wrap.style.display='none'; return; }\n  wrap.style.display='block';\n  if(Notification.permission==='granted') moRegistrarPushRecuperacao(false);\n}\n\nasync function moRegistrarPushRecuperacao(pedirPermissao){\n  if(moWebPushRegistrando||!moWebPushDisponivel()||!moAtendimentoId||!moTelVal) return false;\n  moWebPushRegistrando=true;\n  var btn=document.getElementById('moPushRecoveryBtn');\n  var meta=document.getElementById('moPushRecoveryMeta');\n  try{\n    var permission=Notification.permission;\n    if(permission==='default'&&pedirPermissao) permission=await Notification.requestPermission();\n    if(permission!=='granted'){\n      if(permission==='denied'&&meta) meta.textContent='Notificações bloqueadas neste navegador.';\n      return false;\n    }\n    if(btn){ btn.disabled=true; btn.textContent='Ativando aviso...'; }\n    var registration=await navigator.serviceWorker.register('/consulta/push-sw.js',{scope:'/consulta/'});\n    await navigator.serviceWorker.ready;\n    var keyRes=await fetch(MO_API+'/api/web-push/public-key');\n    var keyData=await keyRes.json();\n    if(!keyData.ok||!keyData.publicKey) throw new Error('push_indisponivel');\n    var subscription=await registration.pushManager.getSubscription();\n    if(!subscription){\n      subscription=await registration.pushManager.subscribe({\n        userVisibleOnly:true,\n        applicationServerKey:moUrlBase64ToUint8Array(keyData.publicKey)\n      });\n    }\n    var res=await fetch(MO_API+'/api/web-push/subscribe',{\n      method:'POST',\n      headers:{'Content-Type':'application/json'},\n      body:JSON.stringify({\n        atendimentoId:moAtendimentoId,\n        telefone:moTelVal,\n        subscription:subscription.toJSON()\n      })\n    });\n    var data=await res.json().catch(function(){return {};});\n    if(!res.ok||!data.ok) throw new Error(data.error||'push_subscribe_failed');\n    if(btn){ btn.disabled=true; btn.textContent='✓ Aviso de pagamento ativado'; }\n    if(meta) meta.textContent='Se continuar pendente, enviaremos um único lembrete em cerca de 25 minutos.';\n    moTrackOnce('webpush_optin_'+moAtendimentoId,'payment_recovery_webpush_optin',{atendimento_id:moAtendimentoId});\n    return true;\n  }catch(e){\n    if(btn){ btn.disabled=false; btn.textContent='🔔 Avisar se o pagamento não concluir'; }\n    if(meta) meta.textContent='Não foi possível ativar agora. Seu pagamento continua normalmente.';\n    moTrack('payment_recovery_webpush_error',{error_message:moErroSeguro(e.message)});\n    return false;\n  }finally{\n    moWebPushRegistrando=false;\n  }\n}\n\nfunction moAtivarPushRecuperacao(){\n  moTrack('payment_recovery_webpush_click',{atendimento_id:moAtendimentoId||''});\n  moRegistrarPushRecuperacao(true);\n}\nwindow.moAtivarPushRecuperacao=moAtivarPushRecuperacao;\n\nasync function moRetomarPagamentoPorPush(){\n  var params;\n  try{ params=new URLSearchParams(window.location.search); }catch(e){ return false; }\n  var pushId=params.get('retomar_pagamento');\n  if(!pushId) return false;\n  var sessao=null;\n  try{ sessao=JSON.parse(localStorage.getItem('cj_sessao')||'null'); }catch(e){ sessao=null; }\n  if(!sessao||String(sessao.atendimentoId)!==String(pushId)) return false;\n  moAtendimentoId=sessao.atendimentoId;\n  moTipoConsulta=sessao.tipoConsulta||'chat';\n  moOrderId=sessao.pagbankOrderId||null;\n  moNomeVal=sessao.pacienteNome||'';\n  moTelVal=sessao.pacienteTel||'';\n  moCPFVal=sessao.pacienteCPF||'';\n  moEmailVal=sessao.pacienteEmail||'';\n  moAtendimentoTerceiro=!!sessao.atendimentoParaTerceiro;\n  moPagadorNomeVal=sessao.pagadorNome||'';\n  moPagadorCPFVal=sessao.pagadorCPF||'';\n  moPagadorEmailVal=sessao.pagadorEmail||'';\n  moEspecialidadeSolicitada=sessao.especialidadeSolicitada||'';\n  moMetodoAtual=sessao.paymentMethod||'pix';\n  try{\n    var r=await moFetchComTimeout(MO_API+'/api/atendimento/status/'+encodeURIComponent(pushId),{},5000);\n    var d=await r.json();\n    if(d.ok&&d.atendimento&&d.atendimento.pagamento_status==='confirmado'){\n      moTrack('payment_recovery_webpush_return',{result:'already_paid',atendimento_id:pushId});\n      moRedirecionarConfirmadoObrigatorio(pushId,moTipoConsulta,moMetodoAtual,'webpush_recovery_paid');\n      return true;\n    }\n  }catch(e){}\n  document.getElementById('moOverlay').classList.add('open');\n  document.body.classList.add('mo-open');\n  document.body.style.overflow='hidden';\n  moAtualizarProdutoCheckout();\n  moMetodo(moMetodoAtual);\n  moIrStep(2);\n  var pixCpf=document.getElementById('moPixCPF');\n  if(pixCpf&&moPagadorCPFVal) pixCpf.value=moPagadorCPFVal;\n  var payCpf=document.getElementById('moPayCPF');\n  if(payCpf&&moPagadorCPFVal) payCpf.value=moPagadorCPFVal;\n  var payNome=document.getElementById('moPayNome');\n  if(payNome&&moPagadorNomeVal) payNome.value=moPagadorNomeVal;\n  var cardEmail=document.getElementById('moCardEmail');\n  if(cardEmail&&moPagadorEmailVal) cardEmail.value=moPagadorEmailVal;\n  moMostrarPushRecuperacao();\n  moTrack('payment_recovery_webpush_return',{result:'checkout_opened',atendimento_id:pushId});\n  try{\n    params.delete('retomar_pagamento'); params.delete('src');\n    history.replaceState({},'',window.location.pathname+(params.toString()?'?'+params.toString():'')+window.location.hash);\n  }catch(e){}\n  return true;\n}\n`,
    'web push functions'
  );
}

if (!s.includes("moMostrarPushRecuperacao();\n    // [TRACKING] Dispara gerou_pix")) {
  replaceOnce(
    `    moTrack('pix_qr_visible', {contexto:moPreContexto||'geral'});\n    // [TRACKING] Dispara gerou_pix`,
    `    moTrack('pix_qr_visible', {contexto:moPreContexto||'geral'});\n    moMostrarPushRecuperacao();\n    // [TRACKING] Dispara gerou_pix`,
    'show push after pix'
  );
}

if (!s.includes("moMostrarPushRecuperacao();\n    var ok=!!(d&&")) {
  replaceOnce(
    `    var d=await r.json();\n    var ok=!!(d&&(d.ok===true||d.status==='approved'||d.status==='paid'||d.transaction_id||d.transactionId));`,
    `    var d=await r.json();\n    moMostrarPushRecuperacao();\n    var ok=!!(d&&(d.ok===true||d.status==='approved'||d.status==='paid'||d.transaction_id||d.transactionId));`,
    'show push after card attempt'
  );
}

if (!s.includes("var retomadoPorPush=await moRetomarPagamentoPorPush();")) {
  replaceOnce(
    `document.addEventListener('DOMContentLoaded',function(){\n  moExibirRetomadaConfirmada();`,
    `document.addEventListener('DOMContentLoaded',async function(){\n  var retomadoPorPush=await moRetomarPagamentoPorPush();\n  if(!retomadoPorPush) moExibirRetomadaConfirmada();`,
    'resume from web push'
  );
}

fs.writeFileSync(path, s);
console.log('Applied web push payment recovery patch');
