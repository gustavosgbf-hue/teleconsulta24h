/* ConsultaJá24h — camada visual 1116. Somente apresentação: não altera fluxo, rede, pagamento, tracking,
   triagem (OpenAI), fila, autenticação nem documentos. Sem dados fictícios; tudo vem do DOM/estado real. */
(function(){
  'use strict';
  var d=document,r=d.documentElement,KEY='cj-visual-1116-theme';
  function q(s,x){return (x||d).querySelector(s)}
  function qa(s,x){return [].slice.call((x||d).querySelectorAll(s))}

  /* ---------- tema ---------- */
  var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  if(saved!=='light'&&saved!=='dark')saved=(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';
  function applyTheme(t){
    r.classList.add('cjv');r.setAttribute('data-cjv-theme',t);
    var night=t!=='light';
    qa('.cjv-tg').forEach(function(b){
      b.setAttribute('aria-checked',night?'true':'false');
      b.setAttribute('aria-label',night?'Modo noite ativo. Alternar para dia':'Modo dia ativo. Alternar para noite');
    });
  }
  var SUN='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  var MOON='<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  function makeToggle(){
    var b=d.createElement('button');b.type='button';b.className='cjv-tg';b.setAttribute('role','switch');
    b.innerHTML='<svg class="sun" viewBox="0 0 24 24" aria-hidden="true">'+SUN+'</svg><svg class="moon" viewBox="0 0 24 24" aria-hidden="true">'+MOON+'</svg><span class="cjv-tg__thumb" aria-hidden="true"><svg class="ti-sun" viewBox="0 0 24 24">'+SUN+'</svg><svg class="ti-moon" viewBox="0 0 24 24">'+MOON+'</svg></span>';
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var next=r.getAttribute('data-cjv-theme')==='light'?'dark':'light';
      applyTheme(next);try{localStorage.setItem(KEY,next)}catch(x){}
    });
    return b;
  }
  function ensureToggle(host,before){
    if(!host||q('.cjv-tg',host))return;
    var t=makeToggle();
    if(before&&before.parentNode===host)host.insertBefore(t,before);else host.appendChild(t);
    applyTheme(r.getAttribute('data-cjv-theme'));
  }
  applyTheme(saved);

  /* ---------- viewport dinâmica / teclado ---------- */
  var vv=window.visualViewport;
  function fit(){
    var h=vv?vv.height:window.innerHeight;
    r.style.setProperty('--cjv-vvh',h+'px');
    var kb=vv?(window.innerHeight-vv.height>150):false;
    r.classList.toggle('cjv-kb',kb);
    if(kb&&window.scrollY)window.scrollTo(0,0);
    var m=q('#chatMsgs');if(kb&&m&&d.activeElement&&d.activeElement.id==='chatInputPaciente')m.scrollTop=m.scrollHeight;
    var t=q('#triageChat');if(kb&&t&&d.activeElement&&d.activeElement.id==='triageInput')t.scrollTop=t.scrollHeight;
  }
  if(vv){vv.addEventListener('resize',fit);vv.addEventListener('scroll',fit)}
  window.addEventListener('resize',fit);window.addEventListener('orientationchange',fit);fit();

  /* ---------- chat: avatar/nome reais do médico, toggle no cabeçalho ---------- */
  function realDoctorName(){
    var n=(typeof window._medicoNomeAtual==='string'&&window._medicoNomeAtual.trim())||'';
    return n;/* sem nome real atribuído => sem inventar */
  }
  function initials(name){
    var p=String(name).replace(/^\s*(dr\.?|dra\.?|doutor(a)?)\s+/i,'').split(/\s+/).filter(Boolean);
    if(!p.length)return '';
    var a=p[0].charAt(0),b=p.length>1?p[p.length-1].charAt(0):'';
    return (a+b).toUpperCase();
  }
  function mountChatHeader(){
    var bar=q('#s-espera .cj-livebar-v6');if(!bar)return;
    var name=realDoctorName(),ini=name?initials(name):'';
    var av=q('.cjv-av',bar);
    if(ini){
      if(!av){av=d.createElement('div');av.className='cjv-av';av.setAttribute('aria-hidden','true');bar.insertBefore(av,bar.firstChild)}
      if(av.textContent!==ini)av.textContent=ini;
      var nm=q('.cj-livebar-v6__doctor',bar);if(nm&&nm.textContent!==name)nm.textContent=name;
    }else if(av){av.remove()}
    ensureToggle(bar,q('.cj-livebar-v6__menu',bar));
  }

  /* ---------- chat: clipe oculta opções (Câmera / Galeria / PDF) ---------- */
  var ICON={
    cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    gal:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    pdf:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'
  };
  var sheet=null;
  function closeSheet(){
    if(!sheet||sheet.hidden)return;sheet.hidden=true;
    var c=q('#s-espera .chat-clip-btn');if(c)c.setAttribute('aria-expanded','false');
  }
  function openSheet(){
    var row=q('#s-espera .chat-input-row'),clip=q('#s-espera .chat-clip-btn');if(!row||!clip)return;
    if(!sheet){
      sheet=d.createElement('div');sheet.className='cjv-sheet';sheet.id='cjvSheet';sheet.setAttribute('role','menu');sheet.setAttribute('aria-label','Anexar');
      [['cam','Câmera'],['gal','Galeria'],['pdf','PDF']].forEach(function(o){
        var b=d.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.setAttribute('data-att',o[0]);
        b.innerHTML='<i><svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[o[0]]+'</svg></i>'+o[1];sheet.appendChild(b);
      });
      row.parentNode.insertBefore(sheet,row);
      sheet.addEventListener('click',function(e){
        var b=e.target.closest('button[data-att]');if(!b)return;
        var inp=q('#chat-file-input');if(!inp)return;
        var k=b.getAttribute('data-att');
        inp.removeAttribute('capture');
        if(k==='cam'){inp.accept='image/*';inp.setAttribute('capture','environment')}
        else if(k==='gal')inp.accept='image/*';
        else inp.accept='application/pdf,.pdf';
        closeSheet();inp.click();
        /* restaura o seletor original após abrir (a lógica existente de onchange permanece) */
        setTimeout(function(){inp.accept='image/*,.pdf';inp.removeAttribute('capture')},1000);
      });
    }
    sheet.hidden=false;sheet.classList.add('pre');
    requestAnimationFrame(function(){requestAnimationFrame(function(){sheet.classList.remove('pre')})});
    clip.setAttribute('aria-expanded','true');
    var m=q('#chatMsgs');if(m)m.scrollTop=m.scrollHeight;
  }
  d.addEventListener('click',function(e){
    var clip=e.target.closest&&e.target.closest('#s-espera .chat-clip-btn');
    if(clip){e.preventDefault();e.stopImmediatePropagation();(!sheet||sheet.hidden)?openSheet():closeSheet();return}
    if(sheet&&!sheet.hidden&&!sheet.contains(e.target))closeSheet();
  },true);
  d.addEventListener('focusin',function(e){if(e.target&&e.target.id==='chatInputPaciente')closeSheet()});
  d.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&sheet&&!sheet.hidden){closeSheet();var c=q('#s-espera .chat-clip-btn');if(c)c.focus()}
  });

  /* ---------- triagem ---------- */
  function mountTriage(){var b=q('#s-triage .ia-banner');ensureToggle(b)}

  /* ---------- pós-consulta ---------- */
  var GSVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z"/></svg>';
  var IG='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>';
  function fmtDate(iso){
    try{var t=new Date(iso);if(isNaN(t))return '';return t.toLocaleDateString('pt-BR')+' · '+t.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}
  }
  function mountEnd(){
    var host=q('#s-encerrado .enc-content');if(!host)return;
    ensureToggle(q('.enc-heading',host));
    /* Google: o <a> original (id, href, target e exibição controlada pela lógica existente) é só reapresentado */
    var g=q('#btn-avaliar-google',host);
    if(g&&!g.getAttribute('data-cjv')){
      g.setAttribute('data-cjv','1');g.setAttribute('rel','noopener noreferrer');g.setAttribute('target','_blank');
      g.innerHTML='<span class="cjv-gmark">'+GSVG+'</span><span class="cjv-gtxt"><b>Avalie no Google</b><small>Leva menos de 1 minuto</small></span><span class="cjv-open" aria-hidden="true">Avaliar</span>';
      host.insertBefore(g,q('.enc-chat',host));
    }
    /* Documentos: rótulo neutro, sem inferir tipo */
    qa('.enc-documento',host).forEach(function(a){
      if(a.getAttribute('data-cjv'))return;a.setAttribute('data-cjv','1');
      var n=q('.enc-documento__nome',a),s=q('.enc-documento__acao',a);
      if(n)n.textContent='Documento médico';
      if(s)s.textContent=fmtDate(a.getAttribute('data-cj-criado'))||'Documento';
      var o=d.createElement('span');o.className='cjv-open';o.textContent='Abrir';a.appendChild(o);
    });
    /* ícone oficial do app (sem recolorir) */
    qa('.cj-end-cta-v6__apphead>img',host).forEach(function(i){if(i.getAttribute('src')!=='/assets/app-icon-ja.png'){i.src='/assets/app-icon-ja.png';i.alt='Ícone do app ConsultaJá24h'}});
    /* links discretos: só quando a tela de fato é de consulta concluída */
    var done=q('#s-encerrado').dataset.consultationCompleted==='true';
    var quiet=q('.cjv-quiet',host);
    if(done&&!quiet){
      quiet=d.createElement('div');quiet.className='cjv-quiet';
      quiet.innerHTML='<a class="cjv-renew" href="/renovacao-de-receita"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/></svg><span>Renovar minha receita</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a><a href="https://www.instagram.com/consultaja24h" target="_blank" rel="noopener noreferrer">'+IG+'Veja mais no nosso Instagram</a>';
      host.insertBefore(quiet,q('.enc-chat',host));
    }else if(!done&&quiet)quiet.remove();
  }

  /* overlay de documento: https/http já validados pela lógica existente; fallback sempre visível */
  var scrim=null,lastFocus=null;
  function closeDoc(){
    if(!scrim)return;scrim.remove();scrim=null;
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function openDoc(a){
    var url;try{url=new URL(a.href,location.origin)}catch(e){return false}
    if(url.protocol!=='https:')return false;/* só https: evita conteúdo misto e esquemas inesperados */
    lastFocus=a;closeDoc();lastFocus=a;
    var when=fmtDate(a.getAttribute('data-cj-criado'));
    scrim=d.createElement('div');scrim.className='cjv-scrim';
    scrim.innerHTML='<div class="cjv-pip" role="dialog" aria-modal="true" aria-labelledby="cjvPipT"><div class="cjv-pip__bar"><span class="t"><b id="cjvPipT">Documento médico</b><small></small></span><button type="button" class="cjv-pip__x" aria-label="Fechar documento"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="cjv-pip__body"></div><div class="cjv-pip__note">Se o documento não aparecer aqui, use Abrir ou Baixar.</div><div class="cjv-pip__ft"><button type="button" class="ghost" data-x>Fechar</button><a data-open target="_blank" rel="noopener noreferrer">Abrir</a><a data-dl target="_blank" rel="noopener noreferrer" download>Baixar</a></div></div>';
    q('small',scrim).textContent=when;
    q('[data-open]',scrim).href=url.href;q('[data-dl]',scrim).href=url.href;
    var f=d.createElement('iframe');f.title='Documento médico';f.referrerPolicy='no-referrer';f.loading='lazy';f.src=url.href;
    q('.cjv-pip__body',scrim).appendChild(f);
    scrim.addEventListener('pointerdown',function(e){if(e.target===scrim)closeDoc()});
    q('.cjv-pip__x',scrim).onclick=closeDoc;q('[data-x]',scrim).onclick=closeDoc;
    d.body.appendChild(scrim);q('.cjv-pip__x',scrim).focus();
    return true;
  }
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('#s-encerrado .enc-documento');
    if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;
    if(openDoc(a)){e.preventDefault()}/* falha => comportamento original (abrir em nova aba) */
  });
  d.addEventListener('keydown',function(e){
    if(!scrim)return;
    if(e.key==='Escape'){closeDoc();return}
    if(e.key==='Tab'){
      var f=qa('button,a[href]',scrim);if(!f.length)return;
      var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}
    }
  });

  /* ---------- chat: ticks reais e citação de resposta (somente leitura) ----------
     Fonte: campos que o GET legado /api/chat/:id já devolve (lido_medico_em, reply_to_id).
     Sem o campo na resposta => nada é exibido (nunca simulamos "lida"). Envio de reply_to_id
     NÃO é feito aqui: o POST legado do web não o suporta (exigiria backend). */
  var TICK1='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4 4 10-10"/></svg>';
  var TICK2='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 12.5 4 4 9-9M9 15.5l1 1 10-10"/></svg>';
  window.cjvChatMeta=function(list){
    try{
      if(!Array.isArray(list))return;
      var byId={};list.forEach(function(m){if(m&&m.id!=null)byId[String(m.id)]=m});
      list.forEach(function(m){
        if(!m||m.id==null)return;
        var el=q('#chatMsgs .cmsg[data-mid="'+String(m.id).replace(/[^0-9]/g,'')+'"]');if(!el)return;
        if(m.autor==='paciente'&&('lido_medico_em' in m)){
          var ts=q('.ts',el);
          if(ts){
            var tk=q('.cjv-tick',ts),read=!!m.lido_medico_em;
            if(!tk){tk=d.createElement('span');tk.className='cjv-tick';ts.appendChild(tk)}
            var st=read?'r':'s';
            if(tk.getAttribute('data-st')!==st){
              tk.setAttribute('data-st',st);tk.innerHTML=read?TICK2:TICK1;
              tk.setAttribute('role','img');tk.setAttribute('aria-label',read?'Lida pelo médico':'Enviada');
            }
          }
        }
        if(m.reply_to_id!=null&&!q('.cjv-quote',el)){
          var tgt=byId[String(m.reply_to_id)],bub=q('.bub',el);
          if(tgt&&bub){
            var qb=d.createElement('div');qb.className='cjv-quote';
            var who=d.createElement('b');who.textContent=tgt.autor==='medico'?'Médico':'Você';
            var tx=d.createElement('span');
            var raw=String(tgt.texto||'')||(tgt.arquivo_tipo==='pdf'?'PDF':tgt.arquivo_url?'Imagem':'');
            tx.textContent=raw.length>120?raw.slice(0,117)+'…':raw;
            qb.appendChild(who);qb.appendChild(tx);bub.insertBefore(qb,bub.firstChild);
          }
        }
      });
    }catch(e){}
  };

  var pend=false;
  function sync(){mountChatHeader();mountTriage();mountEnd()}
  function schedule(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;sync()})}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',sync);else sync();
  setInterval(function(){if(!d.hidden)sync()},2500);
  if(window.MutationObserver)new MutationObserver(schedule).observe(d.body||r,{subtree:true,childList:true,attributes:true,attributeFilter:['data-consultation-completed']});
})();
