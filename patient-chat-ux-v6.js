/* ConsultaJa24h v6 — live consultation menu + contextual CTAs */
(function(){
  'use strict';
  var TOKEN_KEY='cj_paciente_token';
  function hasToken(){try{return !!localStorage.getItem(TOKEN_KEY)}catch(e){return false}}
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function doctorName(){
    var banner=q('#medicoNomeBanner'); if(banner&&banner.textContent.trim())return banner.textContent.trim();
    var p=q('#chatMedicoLabel'); var t=(p&&p.textContent)||'';
    var m=t.match(/(?:m[eé]dico\s+[eé]|m[eé]dico:\s*)([^.]+)/i); if(m&&m[1])return m[1].trim();
    var m2=t.match(/(?:Dr\.?|Dra\.?)\s+[^.]+/i); if(m2)return m2[0].trim();
    return 'Seu médico';
  }
  function closeMenu(){var x=q('#cjMenuV6');if(x)x.remove()}
  function go(url){location.href=url}
  function activateAccess(){closeMenu();if(hasToken())go('/conta/');else if(typeof window.cjBeginAccess==='function')window.cjBeginAccess()}
  function deviceAction(){closeMenu();if(typeof window.cjDeviceAction==='function')window.cjDeviceAction()}
  function copyLink(){closeMenu();try{if(typeof window.copiarLinkRetorno==='function')window.copiarLinkRetorno()}catch(e){}}
  function openMenu(){
    closeMenu();
    var active=hasToken();
    var x=document.createElement('div');x.id='cjMenuV6';x.className='cj-menu-v6';
    x.innerHTML='<div class="cj-menu-v6__sheet" role="dialog" aria-modal="true">'+
      '<div class="cj-menu-v6__grab"></div><div class="cj-menu-v6__title">ConsultaJá24h</div>'+
      item(active?'Abrir minha área':'Ativar meu acesso',active?'Consultas e documentos em um só lugar':'Retome consultas e documentos sem depender deste link','access')+
      item('Meus documentos','Receitas, atestados e arquivos do seu histórico','docs')+
      item('Adicionar ao celular','Acesso rápido pelo seu aparelho','device')+
      item('Copiar link do atendimento','Guarde um acesso direto para esta consulta','copy')+
      '<div class="cj-menu-v6__sep"></div>'+
      item('Nova consulta','Clínica geral · Especialidades · Psicologia','new')+
      item('Renovar receita','Acesse a ConsultaJá24h quando precisar','renew')+
      '<button type="button" class="cj-menu-v6__close" data-cj-v6="close">Fechar</button></div>';
    x.addEventListener('click',function(e){if(e.target===x){closeMenu();return}var a=e.target.closest('[data-cj-v6]');if(!a)return;var k=a.getAttribute('data-cj-v6');if(k==='close')closeMenu();if(k==='access')activateAccess();if(k==='docs'){closeMenu();active?go('/conta/'):activateAccess()}if(k==='device')deviceAction();if(k==='copy')copyLink();if(k==='new'){closeMenu();go('/consulta/?utm_source=chat_menu&utm_medium=owned&utm_campaign=nova_consulta')}if(k==='renew'){closeMenu();go('/consulta/?utm_source=chat_menu&utm_medium=owned&utm_campaign=renovar_receita')}});
    document.body.appendChild(x);
  }
  function item(main,sub,key){return '<button type="button" class="cj-menu-v6__item" data-cj-v6="'+key+'"><span><span class="cj-menu-v6__item-main">'+esc(main)+'</span><span class="cj-menu-v6__item-sub">'+esc(sub)+'</span></span><span class="cj-menu-v6__arrow">›</span></button>'}
  function mountLivebar(){
    var section=q('#s-espera');var chat=q('#chatConsulta');var head=q('#s-espera .chat-header-box');if(!section||!chat||!head||!section.classList.contains('cj-consult-active'))return;
    if(q('.cj-livebar-v6',head))return;
    var bar=document.createElement('div');bar.className='cj-livebar-v6';
    bar.innerHTML='<span class="cj-livebar-v6__status"></span><div class="cj-livebar-v6__copy"><div class="cj-livebar-v6__doctor">'+esc(doctorName())+'</div><div class="cj-livebar-v6__meta">Consulta ativa</div></div><button type="button" class="cj-livebar-v6__menu" aria-label="Mais opções">•••</button>';
    bar.querySelector('button').onclick=openMenu;head.appendChild(bar);
  }
  function mountDocumentCTA(){
    if(hasToken())return;
    var msgs=q('#chatMsgs');if(!msgs||q('.cj-doc-cta-v6',msgs))return;
    var pdfs=qa('.msg-arquivo-pdf',msgs);if(!pdfs.length)return;
    var last=pdfs[pdfs.length-1];var msg=last.closest('.cmsg')||last.parentNode;if(!msg||!msg.parentNode)return;
    var c=document.createElement('div');c.className='cj-doc-cta-v6';
    c.innerHTML='<div class="cj-doc-cta-v6__copy"><div class="cj-doc-cta-v6__title">Seus documentos em um só lugar</div><div class="cj-doc-cta-v6__sub">Ative seu acesso para encontrar consultas e documentos depois.</div></div><button type="button">Ativar acesso</button>';
    c.querySelector('button').onclick=activateAccess;msg.parentNode.insertBefore(c,msg.nextSibling);
  }
  function mountEndCTA(){
    var screen=q('#s-encerrado');var host=q('#s-encerrado .enc-content');if(!screen||!host||!screen.classList.contains('active')||q('.cj-end-cta-v6',host))return;
    var c=document.createElement('section');c.className='cj-end-cta-v6';
    c.innerHTML='<div class="cj-end-cta-v6__eyebrow">Continue pela ConsultaJá24h</div><div class="cj-end-cta-v6__title">Seu cuidado não termina aqui</div><div class="cj-end-cta-v6__sub">Acesse seus documentos e volte quando precisar de um novo atendimento.</div><div class="cj-end-cta-v6__actions"><button type="button" class="cj-end-cta-v6__btn" data-end="area">'+(hasToken()?'Abrir minha área':'Ativar meu acesso')+'</button><button type="button" class="cj-end-cta-v6__btn secondary" data-end="new">Nova consulta</button></div><div class="cj-end-cta-v6__micro">Clínica geral · Especialidades · Psicologia · Renovação de receita</div>';
    c.addEventListener('click',function(e){var b=e.target.closest('[data-end]');if(!b)return;if(b.getAttribute('data-end')==='area')activateAccess();else go('/consulta/?utm_source=pos_consulta&utm_medium=owned&utm_campaign=nova_consulta')});
    var docs=q('#encerrado-documentos',host);if(docs&&docs.nextSibling)host.insertBefore(c,docs.nextSibling);else host.appendChild(c);
  }
  function sync(){mountLivebar();mountDocumentCTA();mountEndCTA()}
  var timer=setInterval(sync,900);setTimeout(sync,100);
  if(window.MutationObserver){new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']})}
})();
