/* ConsultaJa24h v6 — live consultation actions + post-consultation retention */
(function(){
  'use strict';
  var TOKEN_KEY='cj_paciente_token';
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
  function doctorName(){
    var banner=q('#medicoNomeBanner'); if(banner&&banner.textContent.trim())return banner.textContent.trim();
    var p=q('#chatMedicoLabel'); var t=(p&&p.textContent)||'';
    var m2=t.match(/(?:Dr\.?|Dra\.?)\s+[^.]+/i); if(m2)return m2[0].trim();
    return 'Seu médico';
  }
  function closeMenu(immediate){var x=q('#cjMenuV6');if(!x)return;if(immediate){x.remove();return}if(x.classList.contains('is-closing'))return;x.classList.add('is-closing');setTimeout(function(){if(x.parentNode)x.remove()},220)}
  function go(url){setTimeout(function(){location.href=url},180)}
  function activateAccess(){closeMenu();if(hasToken())go('/conta/');else if(typeof window.cjBeginAccess==='function')window.cjBeginAccess()}
  function deviceAction(){closeMenu();if(typeof window.cjDeviceAction==='function')window.cjDeviceAction()}
  function copyLink(){closeMenu();try{if(typeof window.copiarLinkRetorno==='function')window.copiarLinkRetorno()}catch(e){}}
  function item(main,sub,key,ico){return '<button type="button" class="cj-menu-v6__item" data-cj-v6="'+key+'"><span class="cj-menu-v6__icon">'+icon(ico)+'</span><span class="cj-menu-v6__item-copy"><span class="cj-menu-v6__item-main">'+esc(main)+'</span>'+(sub?'<span class="cj-menu-v6__item-sub">'+esc(sub)+'</span>':'')+'</span><span class="cj-menu-v6__arrow">'+icon('chevron')+'</span></button>'}
  function group(label,html){return '<div class="cj-menu-v6__group"><div class="cj-menu-v6__group-label">'+esc(label)+'</div>'+html+'</div>'}
  function openMenu(){
    closeMenu(true);
    var active=hasToken();
    var x=document.createElement('div');x.id='cjMenuV6';x.className='cj-menu-v6';
    x.innerHTML='<div class="cj-menu-v6__sheet" role="dialog" aria-modal="true">'+
      '<div class="cj-menu-v6__grab"></div><div class="cj-menu-v6__head"><div><div class="cj-menu-v6__eyebrow">ConsultaJá24h</div><div class="cj-menu-v6__title">Ações da consulta</div></div><button type="button" class="cj-menu-v6__x" data-cj-v6="close" aria-label="Fechar">×</button></div>'+
      group('Consulta',item('Meus documentos','Receitas, atestados e arquivos','docs','docs')+item('Copiar link do atendimento','Para retomar esta consulta','copy','link'))+
      group('Seu acesso',item(active?'Abrir minha área':'Ativar meu acesso',active?'Consultas e documentos organizados':'Retome consultas e documentos depois','access','account')+item('Adicionar ao celular','Acesso rápido neste aparelho','device','device'))+
      group('Quando precisar novamente',item('Nova consulta','Clínica geral · Especialidades · Psicologia','new','plus')+item('Renovar receita','Acesse a ConsultaJá24h quando precisar','renew','renew'))+
      '</div>';
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
  function removeDocumentCTA(){document.querySelectorAll('.cj-doc-cta-v6').forEach(function(c){c.remove()})}
  function mountEndCTA(){
    var screen=q('#s-encerrado');var host=q('#s-encerrado .enc-content');if(!screen||!host||!screen.classList.contains('active')||q('.cj-end-cta-v6',host))return;
    var c=document.createElement('section');c.className='cj-end-cta-v6';
    c.innerHTML='<div class="cj-end-cta-v6__eyebrow">Seu acesso ConsultaJá24h</div><div class="cj-end-cta-v6__title">Continue com tudo organizado</div><div class="cj-end-cta-v6__sub">Acesse seus documentos e volte quando precisar de um novo atendimento.</div><div class="cj-end-cta-v6__actions"><button type="button" class="cj-end-cta-v6__btn" data-end="area">'+(hasToken()?'Abrir minha área':'Ativar meu acesso')+'</button><button type="button" class="cj-end-cta-v6__btn secondary" data-end="new">Nova consulta</button></div><div class="cj-end-cta-v6__micro">Clínica geral · Especialidades · Psicologia · Renovação de receita</div>';
    c.addEventListener('click',function(e){var b=e.target.closest('[data-end]');if(!b)return;if(b.getAttribute('data-end')==='area')activateAccess();else go('/consulta/?utm_source=pos_consulta&utm_medium=owned&utm_campaign=nova_consulta')});
    var docs=q('#encerrado-documentos',host);if(docs&&docs.nextSibling)host.insertBefore(c,docs.nextSibling);else host.appendChild(c);
  }
  function sync(){mountLivebar();removeDocumentCTA();mountEndCTA()}
  setInterval(sync,1200);setTimeout(sync,100);
  if(window.MutationObserver){new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']})}
})();
