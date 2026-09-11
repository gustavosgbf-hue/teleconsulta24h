/* ConsultaJa24h v7 — live consultation actions + post-consultation retention */
(function(){
  'use strict';
  var TOKEN_KEY='cj_paciente_token';
  var PLAY_STORE_URL='https://play.google.com/store/apps/details?id=com.consultaja24h.app';
  function isAndroid(){return /android/i.test(navigator.userAgent||'')}
  function isNativeApp(){return !!window.ReactNativeWebView||/ConsultaJa24hApp/i.test(navigator.userAgent||'')}
  function trackAppDownload(source){try{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'app_download_click',app_store:'google_play',source:source||'pos_consulta'})}catch(e){}}
  function hasToken(){try{return !!localStorage.getItem(TOKEN_KEY)}catch(e){return false}}
  function q(s,r){return (r||document).querySelector(s)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function icon(name){
    var m={
      account:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3.2-6 7-6s6.3 2 7 6"/></svg>',
      docs:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
      device:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 18.5h4"/></svg>',
      link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>',
      plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
      renew:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7a8 8 0 1 0 1 7"/><path d="M20 3v4h-4"/></svg>',
      more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.55"/><circle cx="12" cy="12" r="1.55"/><circle cx="19" cy="12" r="1.55"/></svg>',
      chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"/></svg>'
    };return m[name]||m.account;
  }
  function googlePlayMark(){
    return '<svg class="cj-end-play-mark" viewBox="0 0 32 36" aria-hidden="true"><path fill="#00d7fe" d="M2 2.6v30.8c0 1.8 2 2.8 3.4 1.7L22.8 18 5.4.9C4-.2 2 .8 2 2.6z"/><path fill="#00f076" d="M5.4.9 22.8 18l4.6-4.5L8.8.6C7.7-.2 6.4-.1 5.4.9z"/><path fill="#ffd900" d="m22.8 18-17.4 17.1c1 1 2.4 1.1 3.5.4l18.6-12.9-4.7-4.6z"/><path fill="#ff3a44" d="M29.6 16.1 27.4 14l-4.6 4 4.7 4.6 2.1-1.5c1.9-1.3 1.9-3.7 0-5z"/></svg>';
  }
  function mountEndAppStyle(){
    if(q('#cj-end-app-v7-style'))return;
    var s=document.createElement('style');s.id='cj-end-app-v7-style';
    s.textContent='#s-encerrado .cj-end-cta-v6.is-app{background:linear-gradient(145deg,#102b1c,#0b1d14)!important;border-color:#315a3a!important}#s-encerrado .cj-end-play-badge{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;width:auto!important;min-height:54px!important;margin:14px 0 5px!important;padding:8px 14px!important;background:#040706!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:12px!important;color:#fff!important;text-decoration:none!important}#s-encerrado .cj-end-play-mark{width:27px;height:31px;display:block;flex:0 0 auto}#s-encerrado .cj-end-play-badge>span{display:flex;flex-direction:column;align-items:flex-start;gap:1px}#s-encerrado .cj-end-play-badge small{font:600 8px/1 "Outfit",sans-serif;letter-spacing:.09em;color:#c7cfca}#s-encerrado .cj-end-play-badge strong{font:600 17px/1.05 "Outfit",sans-serif;color:#fff}#s-encerrado .cj-end-cta-v6__micro{display:none!important}@media(max-width:760px){#s-encerrado .cj-end-cta-v6.is-app{padding:20px!important}#s-encerrado .cj-end-cta-v6__title{font-size:21px!important}#s-encerrado .cj-end-cta-v6__sub{font-size:13.5px!important;line-height:1.45!important}#s-encerrado .cj-end-cta-v6__actions{margin-top:14px!important;padding-top:14px!important}}';
    document.head.appendChild(s);
  }
  function mountRetentionClarityStyle(){
    if(q('#cj-retention-clarity-v8-style'))return;
    var s=document.createElement('style');s.id='cj-retention-clarity-v8-style';
    s.textContent='#s-encerrado .cj-end-access-guide{margin:17px 0 0;padding:15px 0 0;border-top:1px solid rgba(255,255,255,.11)}#s-encerrado .cj-end-access-guide__eyebrow{font:650 9px/1 Outfit,sans-serif;letter-spacing:.11em;color:#8fdc78}#s-encerrado .cj-end-access-guide__title{margin-top:6px;font:600 15px/1.25 Outfit,sans-serif;color:#eef6ef}#s-encerrado .cj-end-access-guide__steps{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}#s-encerrado .cj-end-access-guide__step{display:flex;align-items:flex-start;gap:7px;padding:9px;border-radius:10px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);font:500 10.5px/1.3 Outfit,sans-serif;color:#b9cabd}#s-encerrado .cj-end-access-guide__step b{display:grid;place-items:center;width:18px;height:18px;flex:0 0 18px;border-radius:50%;background:rgba(155,234,69,.12);color:#b9ef81;font-size:9px}#s-encerrado .cj-end-access-guide__note{margin-top:9px;font:400 10px/1.4 Outfit,sans-serif;color:#8fa197}@media(max-width:760px){#s-encerrado .cj-end-access-guide__steps{grid-template-columns:1fr;gap:6px}#s-encerrado .cj-end-access-guide__step{padding:8px 9px}.cj-live-app-cta{margin:8px 10px 0;display:grid;grid-template-columns:34px minmax(0,1fr) auto 24px;align-items:center;gap:8px;padding:8px 8px 8px 9px;border-radius:12px;background:linear-gradient(145deg,rgba(67,223,126,.075),rgba(8,20,15,.75));border:1px solid rgba(120,230,165,.13)}.cj-live-app-cta__icon{width:34px;height:34px;border-radius:8px}.cj-live-app-cta__copy{min-width:0}.cj-live-app-cta__copy strong{display:block;font:600 11px/1.2 Outfit,sans-serif;color:#eef6f0}.cj-live-app-cta__copy small{display:block;margin-top:2px;font:400 9px/1.25 Outfit,sans-serif;color:#8ea198}.cj-live-app-cta__link{padding:7px 9px;border-radius:8px;background:#9bea45;color:#102a15;text-decoration:none;font:700 9.5px/1 Outfit,sans-serif}.cj-live-app-cta__x{width:24px;height:24px;border:0;background:transparent;color:#698076;font:400 16px/1 sans-serif;padding:0}}';
    document.head.appendChild(s);
  }

  function doctorName(){
    var banner=q('#medicoNomeBanner'); if(banner&&banner.textContent.trim())return banner.textContent.trim();
    var p=q('#chatMedicoLabel'); var t=(p&&p.textContent)||'';
    var m2=t.match(/(?:Dr\.?|Dra\.?)\s+[^.]+/i); if(m2)return m2[0].trim();
    return 'Seu médico';
  }
  function closeMenu(immediate){var x=q('#cjMenuV6');if(!x)return;if(immediate){x.remove();return}if(x.classList.contains('is-closing'))return;x.classList.add('is-closing');setTimeout(function(){if(x.parentNode)x.remove()},220)}
  function go(url){setTimeout(function(){location.href=url},180)}
  function activateAccess(){closeMenu();if(hasToken())go('/conta/');else if(typeof window.cjBeginAccess==='function')window.cjBeginAccess()}
  function deviceAction(){closeMenu();if(isAndroid()){trackAppDownload('chat_menu');window.open(PLAY_STORE_URL,'_blank','noopener');return}if(typeof window.cjDeviceAction==='function')window.cjDeviceAction()}
  function copyLink(){closeMenu();try{if(typeof window.copiarLinkRetorno==='function')window.copiarLinkRetorno()}catch(e){}}
  function item(main,sub,key,ico){return '<button type="button" class="cj-menu-v6__item" data-cj-v6="'+key+'"><span class="cj-menu-v6__icon">'+icon(ico)+'</span><span class="cj-menu-v6__item-copy"><span class="cj-menu-v6__item-main">'+esc(main)+'</span>'+(sub?'<span class="cj-menu-v6__item-sub">'+esc(sub)+'</span>':'')+'</span><span class="cj-menu-v6__arrow">'+icon('chevron')+'</span></button>'}
  function group(label,html){return '<div class="cj-menu-v6__group"><div class="cj-menu-v6__group-label">'+esc(label)+'</div>'+html+'</div>'}
  function openMenu(){
    closeMenu(true);
    var active=hasToken();
    var x=document.createElement('div');x.id='cjMenuV6';x.className='cj-menu-v6';
    x.innerHTML='<div class="cj-menu-v6__sheet" role="dialog" aria-modal="true">'+'<div class="cj-menu-v6__grab"></div><div class="cj-menu-v6__head"><div><div class="cj-menu-v6__eyebrow">ConsultaJá24h</div><div class="cj-menu-v6__title">Ações da consulta</div></div><button type="button" class="cj-menu-v6__x" data-cj-v6="close" aria-label="Fechar">×</button></div>'+group('Consulta',item('Meus documentos','Receitas, atestados e arquivos','docs','docs')+item('Copiar link do atendimento','Para retomar esta consulta','copy','link'))+group('Seu acesso',item(active?'Abrir minha área':'Ativar meu acesso',active?'Consultas e documentos organizados':'Retome consultas e documentos depois','access','account')+item(isAndroid()?'Baixar aplicativo':'Adicionar ao celular',isAndroid()?'Disponível na Google Play':'Acesso rápido neste aparelho','device','device'))+group('Quando precisar novamente',item('Nova consulta','Clínica geral · Especialidades · Psicologia','new','plus')+item('Renovar receita','Acesse a ConsultaJá24h quando precisar','renew','renew'))+'</div>';
    x.addEventListener('click',function(e){if(e.target===x){closeMenu();return}var a=e.target.closest('[data-cj-v6]');if(!a)return;var k=a.getAttribute('data-cj-v6');if(k==='close')closeMenu();if(k==='access')activateAccess();if(k==='docs'){closeMenu();hasToken()?go('/conta/'):activateAccess()}if(k==='device')deviceAction();if(k==='copy')copyLink();if(k==='new'){closeMenu();go('/consulta/?utm_source=chat_menu&utm_medium=owned&utm_campaign=nova_consulta')}if(k==='renew'){closeMenu();go('/consulta/?utm_source=chat_menu&utm_medium=owned&utm_campaign=renovar_receita')}});
    document.body.appendChild(x);
  }
  function mountLivebar(){
    var section=q('#s-espera');var chat=q('#chatConsulta');var head=q('#s-espera .chat-header-box');if(!section||!chat||!head||!section.classList.contains('cj-consult-active'))return;
    if(q('.cj-livebar-v6',head))return;
    var bar=document.createElement('div');bar.className='cj-livebar-v6';
    bar.innerHTML='<span class="cj-livebar-v6__status"></span><div class="cj-livebar-v6__copy"><div class="cj-livebar-v6__doctor">'+esc(doctorName())+'</div><div class="cj-livebar-v6__meta">Consulta ativa</div></div><button type="button" class="cj-livebar-v6__menu" aria-label="Mais opções">'+icon('more')+'</button>';
    bar.querySelector('button').onclick=openMenu;head.appendChild(bar);
  }
  function mountLiveAppCTA(){
    var section=q('#s-espera');var msgs=q('#s-espera .chat-msgs');
    if(!section||!msgs||!section.classList.contains('cj-consult-active'))return;
    if(!isAndroid()||isNativeApp())return;
    try{if(sessionStorage.getItem('cj_live_app_cta_dismissed')==='1')return}catch(e){}
    if(q('.cj-live-app-cta',msgs))return;
    var c=document.createElement('div');c.className='cj-live-app-cta';
    c.innerHTML='<img class="cj-live-app-cta__icon" src="/icon-192.png" alt=""><div class="cj-live-app-cta__copy"><strong>Também temos aplicativo</strong><small>Consultas e documentos na Google Play</small></div><a class="cj-live-app-cta__link" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener">Baixar</a><button class="cj-live-app-cta__x" type="button" aria-label="Fechar">×</button>';
    c.querySelector('a').addEventListener('click',function(){trackAppDownload('consulta_ativa')});
    c.querySelector('button').addEventListener('click',function(){try{sessionStorage.setItem('cj_live_app_cta_dismissed','1')}catch(e){}c.remove()});
    msgs.insertBefore(c,msgs.firstChild);
  }
  function removeDocumentCTA(){document.querySelectorAll('.cj-doc-cta-v6').forEach(function(c){c.remove()})}
  function mountEndCTA(){
    var screen=q('#s-encerrado');var host=q('#s-encerrado .enc-content');if(!screen||!host)return;
    var existing=q('.cj-end-cta-v6',host);
    var eligible=screen.classList.contains('active')&&screen.dataset.consultationCompleted==='true'&&screen.dataset.paymentConfirmed==='true';
    if(!eligible){if(existing)existing.remove();if(host.classList.contains('has-end-actions'))host.classList.remove('has-end-actions');return}
    if(existing)return;
    host.classList.add('has-end-actions');
    var c=document.createElement('section');c.className='cj-end-cta-v6 is-app';
    c.innerHTML='<div class="cj-end-cta-v6__apphead"><img src="/icon-192.png" alt=""><div><div class="cj-end-cta-v6__eyebrow">APP CONSULTAJÁ24H</div><div class="cj-end-cta-v6__title">Leve a ConsultaJá24h no celular.</div></div></div><div class="cj-end-cta-v6__sub">Baixe o app para acessar consultas e documentos com mais facilidade.</div><a class="cj-end-cta-v6__play cj-end-play-badge" data-end="play" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play">'+googlePlayMark()+'<span><small>DISPONÍVEL NO</small><strong>Google Play</strong></span></a><div class="cj-end-access-guide"><div class="cj-end-access-guide__eyebrow">SEU ACESSO</div><div class="cj-end-access-guide__title">Quer guardar tudo para depois?</div><div class="cj-end-access-guide__steps"><div class="cj-end-access-guide__step"><b>1</b><span>Crie seu acesso</span></div><div class="cj-end-access-guide__step"><b>2</b><span>Entre quando precisar</span></div><div class="cj-end-access-guide__step"><b>3</b><span>Veja consultas e documentos</span></div></div><div class="cj-end-access-guide__note">O aplicativo é opcional. Seu acesso também funciona pelo navegador.</div></div><div class="cj-end-cta-v6__actions"><button type="button" class="cj-end-cta-v6__btn" data-end="area">'+(hasToken()?'Abrir minha área':'Criar meu acesso')+'</button><button type="button" class="cj-end-cta-v6__btn secondary" data-end="new">Nova consulta</button></div>';
    c.addEventListener('click',function(e){var b=e.target.closest('[data-end]');if(!b)return;var k=b.getAttribute('data-end');if(k==='play'){trackAppDownload('pos_consulta');return}if(k==='area')activateAccess();else go('/consulta/?utm_source=pos_consulta&utm_medium=owned&utm_campaign=nova_consulta')});
    var docs=q('#encerrado-documentos',host);if(docs&&docs.nextSibling)host.insertBefore(c,docs.nextSibling);else host.appendChild(c);
  }
  function sync(){mountLivebar();mountLiveAppCTA();removeDocumentCTA();mountEndCTA()}
  mountEndAppStyle();
  mountRetentionClarityStyle();
  setInterval(sync,1200);setTimeout(sync,100);
  if(window.MutationObserver){new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','data-consultation-completed','data-payment-confirmed']})}
})();
