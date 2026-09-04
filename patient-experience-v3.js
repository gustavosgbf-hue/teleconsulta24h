/* ConsultaJa24h patient experience v3 — additive JS only */
(function(){
  'use strict';
  var API_BASE = (typeof API!=='undefined'&&API) ? API : 'https://triagem-api.onrender.com';
  var TOKEN_KEY='cj_paciente_token';
  var PATIENT_KEY='cj_paciente_profile';
  var RETENTION_KEY='cj_retencao_optin';
  var accessCard=null;

  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent||'')}
  function isStandalone(){return !!((window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true)}
  function isAndroid(){return /android/i.test(navigator.userAgent||'')}
  function maskEmail(v){var p=String(v||'').split('@');if(p.length!==2)return v||'';var l=p[0],show=l.slice(0,Math.min(2,l.length));return show+'***@'+p[1]}
  function token(){try{return localStorage.getItem(TOKEN_KEY)||''}catch(e){return ''}}
  function setToken(v,p){try{localStorage.setItem(TOKEN_KEY,v);localStorage.setItem(PATIENT_KEY,JSON.stringify(p||{}))}catch(e){}}
  function retentionOptIn(){try{return localStorage.getItem(RETENTION_KEY)==='1'}catch(e){return false}}
  function setRetentionOptIn(v){try{localStorage.setItem(RETENTION_KEY,v?'1':'0')}catch(e){}}
  function svg(name){
    var icons={
      folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
      link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>'
    };return icons[name]||icons.folder;
  }

  function showSheet(html){
    closeSheet();
    var x=document.createElement('div');x.className='cj-sheet';x.id='cjSheet';x.innerHTML='<div class="cj-sheet-card" role="dialog" aria-modal="true">'+html+'</div>';
    x.addEventListener('click',function(e){if(e.target===x)closeSheet()});document.body.appendChild(x);return x;
  }
  function closeSheet(){var x=document.getElementById('cjSheet');if(x)x.remove()}
  window.cjCloseSheet=closeSheet;
  function setSheetError(msg){var e=document.getElementById('cjSheetError');if(e){e.textContent=msg||'';e.style.display=msg?'block':'none'}}

  async function requestOtp(emailOverride){
    var tel=(typeof pacienteTel!=='undefined'&&pacienteTel)||'';
    var cpf=(typeof pacienteCPF!=='undefined'&&pacienteCPF)||'';
    var email=emailOverride||((typeof pacienteEmail!=='undefined'&&pacienteEmail)||'');
    var r=await fetch(API_BASE+'/api/paciente/otp/solicitar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telefone:tel,email:email,cpf:cpf})});
    var d=await r.json().catch(function(){return{}});if(!r.ok||!d.ok)throw new Error(d.error||'Não foi possível enviar o código.');
    if(d.precisa_dados){
      if(email&&cpf){
        var r2=await fetch(API_BASE+'/api/paciente/otp/solicitar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telefone:tel,email:email,cpf:cpf})});
        var d2=await r2.json().catch(function(){return{}});if(!r2.ok||!d2.ok||d2.precisa_dados)throw new Error(d2.error||'Confirme seu e-mail para ativar o acesso.');return d2;
      }
      return d;
    }
    return d;
  }

  function openEmailStep(){
    var known=(typeof pacienteEmail!=='undefined'&&pacienteEmail)||'';
    var html='<div class="cj-sheet-kicker">Seu acesso</div><div class="cj-sheet-title">Organize suas consultas em um só lugar</div><div class="cj-sheet-text">Ative gratuitamente para retomar atendimentos sem salvar links e acessar seus documentos depois.</div>'+
      '<input class="cj-sheet-field" id="cjAccessEmail" type="email" inputmode="email" autocomplete="email" placeholder="Seu e-mail" value="'+esc(known)+'">'+
      '<div class="cj-sheet-error" id="cjSheetError"></div><button class="cj-sheet-primary" id="cjSendCode">Enviar código de acesso</button><button class="cj-sheet-secondary" onclick="cjCloseSheet()">Agora não</button>';
    showSheet(html);
    document.getElementById('cjSendCode').onclick=async function(){
      var b=this;var em=document.getElementById('cjAccessEmail').value.trim();if(!em||em.indexOf('@')<1){setSheetError('Informe um e-mail válido.');return}
      setSheetError('');b.disabled=true;b.textContent='Enviando...';
      try{
        if(typeof pacienteEmail!=='undefined'&&!pacienteEmail){pacienteEmail=em;try{if(typeof salvarSessao==='function')salvarSessao()}catch(e){}}
        var d=await requestOtp(em);if(d.precisa_dados)throw new Error('Não foi possível vincular este acesso automaticamente.');openCodeStep(d.challenge_id,d.email_mascarado||maskEmail(em));
      }catch(e){setSheetError(e.message||'Não foi possível enviar o código.');b.disabled=false;b.textContent='Enviar código de acesso'}
    };
  }

  function openCodeStep(challenge,masked){
    var html='<div class="cj-sheet-kicker">Código enviado</div><div class="cj-sheet-title">Confirme seu acesso</div><div class="cj-sheet-text">Enviamos um código de 6 dígitos para <strong>'+esc(masked||'seu e-mail')+'</strong>.</div>'+
      '<input class="cj-sheet-field cj-sheet-code" id="cjAccessCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000">'+
      '<div class="cj-sheet-error" id="cjSheetError"></div><button class="cj-sheet-primary" id="cjVerifyCode">Ativar meu acesso</button><button class="cj-sheet-secondary" onclick="cjCloseSheet()">Cancelar</button>';
    showSheet(html);var inp=document.getElementById('cjAccessCode');setTimeout(function(){inp&&inp.focus()},120);
    document.getElementById('cjVerifyCode').onclick=async function(){
      var b=this,code=(inp.value||'').replace(/\D/g,'').slice(0,6);if(code.length!==6){setSheetError('Digite os 6 dígitos do código.');return}
      setSheetError('');b.disabled=true;b.textContent='Validando...';
      try{
        var r=await fetch(API_BASE+'/api/paciente/otp/verificar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge_id:challenge,codigo:code})});var d=await r.json().catch(function(){return{}});if(!r.ok||!d.ok||!d.token)throw new Error(d.error||'Código inválido.');
        setToken(d.token,d.paciente);openSuccessStep(d.paciente);renderAccessCard();
      }catch(e){setSheetError(e.message||'Não foi possível validar.');b.disabled=false;b.textContent='Ativar meu acesso'}
    };
  }

  function openSuccessStep(p){
    var html='<div class="cj-sheet-kicker">Acesso ativado</div><div class="cj-sheet-title">Pronto'+(p&&p.nome?', '+esc(String(p.nome).split(' ')[0]):'')+'.</div><div class="cj-sheet-text">Esta consulta e seus documentos podem ser acessados pela sua área ConsultaJá24h. Você não precisa mais guardar o link do atendimento.</div>'+
      '<label class="cj-sheet-check"><input type="checkbox" id="cjRetentionCheck"><span>Quero receber lembretes ocasionais da ConsultaJá24h para facilitar um novo atendimento quando eu precisar. Posso desativar depois.</span></label>'+
      '<button class="cj-sheet-primary" id="cjFinishAccess">Continuar</button><button class="cj-sheet-secondary" id="cjOpenArea">Abrir minha área</button>';
    showSheet(html);document.getElementById('cjRetentionCheck').checked=retentionOptIn();
    document.getElementById('cjFinishAccess').onclick=async function(){setRetentionOptIn(document.getElementById('cjRetentionCheck').checked);if(retentionOptIn())await maybeSubscribeRetention(false);closeSheet();renderAccessCard()};
    document.getElementById('cjOpenArea').onclick=function(){setRetentionOptIn(document.getElementById('cjRetentionCheck').checked);location.href='/conta/'};
  }

  async function beginAccess(){
    if(token()){location.href='/conta/';return}
    var known=(typeof pacienteEmail!=='undefined'&&pacienteEmail)||'';
    if(!known){openEmailStep();return}
    showSheet('<div class="cj-sheet-kicker">Seu acesso</div><div class="cj-sheet-title">Enviando código</div><div class="cj-sheet-text">Só um instante. Estamos preparando seu acesso sem interromper o atendimento.</div>');
    try{var d=await requestOtp(known);if(d.precisa_dados){closeSheet();openEmailStep();return}openCodeStep(d.challenge_id,d.email_mascarado||maskEmail(known))}catch(e){closeSheet();openEmailStep();setTimeout(function(){setSheetError(e.message||'Não foi possível enviar o código.')},0)}
  }
  window.cjBeginAccess=beginAccess;

  function deviceCopy(){
    if(isIOS()&&!isStandalone())return {label:'Adicionar ao iPhone',note:'Adicione à Tela de Início para receber notificações mesmo com o Safari fechado.',action:'install'};
    if(isStandalone())return {label:(window.Notification&&Notification.permission==='granted')?'Notificações ativadas':'Ativar notificações',note:'Receba novas mensagens e volte ao atendimento em um toque.',action:'notify'};
    if(isAndroid())return {label:'Adicionar ao celular',note:'Instale como app para manter o acesso mais fácil.',action:'install'};
    return {label:'Ativar notificações',note:'Receba novas mensagens mesmo com esta aba em segundo plano.',action:'notify'};
  }

  async function deviceAction(){
    var d=deviceCopy();
    if(d.action==='install'){
      if(typeof window.cjInstalarApp==='function')window.cjInstalarApp();return;
    }
    if(typeof window.cjAtivarPushPaciente==='function'){
      await window.cjAtivarPushPaciente();setTimeout(renderAccessCard,250);if(retentionOptIn())await maybeSubscribeRetention(false);
    }
  }
  window.cjDeviceAction=deviceAction;

  async function maybeSubscribeRetention(requestPermission){
    try{
      var t=token();if(!t||!retentionOptIn())return false;
      if(isIOS()&&!isStandalone())return false;
      if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))return false;
      var perm=Notification.permission;if(perm==='default'&&requestPermission)perm=await Notification.requestPermission();if(perm!=='granted')return false;
      var reg=await navigator.serviceWorker.ready;var sub=await reg.pushManager.getSubscription();
      if(!sub){var kd=await (await fetch(API_BASE+'/api/web-push/public-key')).json();if(!kd.ok||!kd.publicKey)return false;var raw=kd.publicKey,pad='='.repeat((4-raw.length%4)%4),b=(raw+pad).replace(/-/g,'+').replace(/_/g,'/'),s=atob(b),arr=new Uint8Array(s.length);for(var i=0;i<s.length;i++)arr[i]=s.charCodeAt(i);sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:arr})}
      var r=await fetch(API_BASE+'/api/paciente/retencao-push',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({opt_in:true,subscription:sub.toJSON()})});return r.ok;
    }catch(e){return false}
  }
  window.cjMaybeSubscribeRetention=maybeSubscribeRetention;

  function renderAccessCard(){
    var wait=document.querySelector('#s-espera .espera-box');if(!wait)return;
    var link=document.getElementById('link-retorno-box');
    if(!document.getElementById('cjReturnCompact')){
      var ret=document.createElement('div');ret.id='cjReturnCompact';ret.className='cj-return-link';ret.innerHTML=svg('link')+'<button type="button" id="cjCopyAccessLink">Copiar link de acesso</button>';if(link&&link.parentNode)link.parentNode.insertBefore(ret,link.nextSibling);else wait.appendChild(ret);
      ret.querySelector('button').onclick=function(){try{if(typeof copiarLinkRetorno==='function')copiarLinkRetorno();this.textContent='Link copiado';var b=this;setTimeout(function(){b.textContent='Copiar link de acesso'},1600)}catch(e){}};
    }
    accessCard=document.getElementById('cjAccessCard');if(!accessCard){accessCard=document.createElement('section');accessCard.id='cjAccessCard';accessCard.className='cj-access-card';var target=document.getElementById('cjReturnCompact');wait.insertBefore(accessCard,target||document.querySelector('.chat-consulta'));}
    var active=!!token(),d=deviceCopy();accessCard.className='cj-access-card'+(active?' cj-access-success':'');
    accessCard.innerHTML='<div class="cj-access-head"><div class="cj-access-icon">'+svg('folder')+'</div><div class="cj-access-copy"><div class="cj-access-title">'+(active?'Seu acesso está pronto':'Seu acesso ConsultaJá24h')+'</div><div class="cj-access-sub">'+(active?'Consultas, documentos e este atendimento ficam organizados na sua área.':'Ative gratuitamente enquanto aguarda. Depois você retoma consultas e documentos sem depender deste link.')+'</div><div class="cj-access-actions"><button class="cj-access-btn" id="cjAccessMain">'+(active?'Abrir minha área':'Ativar meu acesso')+'</button>'+(active?'<button class="cj-access-btn secondary" id="cjNewConsult">Nova consulta</button>':'')+'</div><div class="cj-access-foot">Opcional. Seu atendimento continua normalmente.</div></div></div><div class="cj-device-row"><div class="cj-device-note">'+esc(d.note)+'</div><button class="cj-device-action" id="cjDeviceBtn" '+((isStandalone()&&window.Notification&&Notification.permission==='granted')?'disabled':'')+'>'+esc(d.label)+'</button></div>';
    document.getElementById('cjAccessMain').onclick=function(){if(active)location.href='/conta/';else beginAccess()};var nc=document.getElementById('cjNewConsult');if(nc)nc.onclick=function(){location.href='/consulta/?utm_source=area_paciente&utm_medium=owned&utm_campaign=nova_consulta'};var db=document.getElementById('cjDeviceBtn');if(db&&!db.disabled)db.onclick=deviceAction;
  }

  function cleanWaitingState(){
    var title=document.getElementById('esperaTitulo'),sub=document.getElementById('esperaSub'),anim=document.getElementById('esperaAnim');if(!title||!anim)return;
    var ready=/dispon[ií]vel|assumiu|entrou/i.test((title.textContent||'')+' '+((sub&&sub.textContent)||''));anim.classList.toggle('cj-ready',ready);
    if(ready){title.textContent='Seu médico chegou';if(sub)sub.textContent='O atendimento já está disponível. Você pode continuar pelo chat abaixo.'}
    else {if(/notificado|aguard|procur/i.test(title.textContent||''))title.textContent='Estamos chamando seu médico';if(sub)sub.textContent='Seu atendimento está na fila e será assumido assim que o médico ficar disponível.'}
    var demora=document.getElementById('esperaDemora');if(demora)demora.textContent='Seu atendimento continua ativo. Pode haver uma pequena espera enquanto o médico conclui o atendimento anterior.';
    var aviso=document.getElementById('aviso-horario-espera');if(aviso)aviso.innerHTML='Neste horário pode haver uma pequena espera. Seu atendimento permanece ativo e você será avisado quando o médico entrar.';
    var badgeIcon=document.getElementById('esperaBadgeIcon');if(badgeIcon)badgeIcon.textContent='';
  }

  function boot(){
    cleanWaitingState();renderAccessCard();
    var title=document.getElementById('esperaTitulo');if(title&&window.MutationObserver)new MutationObserver(function(){cleanWaitingState();renderAccessCard()}).observe(title,{childList:true,subtree:true,characterData:true});
    var tries=0,t=setInterval(function(){tries++;if(document.getElementById('s-espera')&&document.getElementById('s-espera').classList.contains('active')){cleanWaitingState();renderAccessCard()}if(tries>80)clearInterval(t)},500);
    if(token()&&retentionOptIn())setTimeout(function(){maybeSubscribeRetention(false)},1800);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
