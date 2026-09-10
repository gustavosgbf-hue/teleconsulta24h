(function(){
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }
  ready(function(){
    var PLAY_STORE_URL='https://play.google.com/store/apps/details?id=com.consultaja24h.app';
    function isAppleMobile(){
      var ua=navigator.userAgent||'';
      return /iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
    }
    function trackAppDownload(source){
      try{
        window.dataLayer=window.dataLayer||[];
        window.dataLayer.push({event:'app_download_click',app_store:'google_play',source:source||'landing'});
      }catch(e){}
    }
    function playBadge(){
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/></svg><span><strong>Baixar aplicativo</strong><small>Disponível na Google Play</small></span>';
    }
    function mountAppPromos(){
      if(isAppleMobile())return;
      var priceAnchor=document.getElementById('heroPriceAnchor');
      if(priceAnchor&&!document.querySelector('.cj-play-hero')){
        var heroApp=document.createElement('div');
        heroApp.className='cj-play-hero';
        heroApp.innerHTML='<a class="cj-play-hero__link" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play"><span class="cj-play-hero__new">NOVO</span><span class="cj-play-hero__copy"><strong>Também disponível no aplicativo</strong><small>Baixe na Google Play e acesse atendimentos e documentos com mais facilidade.</small></span><span class="cj-play-hero__arrow">›</span></a>';
        heroApp.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_hero')});
        priceAnchor.parentNode.insertBefore(heroApp,priceAnchor.nextSibling);
      }
      var finalCta=document.querySelector('.cta-final');
      if(finalCta&&!document.querySelector('.cj-app-callout')){
        var appSection=document.createElement('section');
        appSection.className='cj-app-callout reveal visible';
        appSection.setAttribute('aria-labelledby','cjAppCalloutTitle');
        appSection.innerHTML='<div class="cj-app-callout__inner"><div class="cj-app-callout__icon"><img src="/icon-192.png" alt="" loading="lazy"></div><div class="cj-app-callout__copy"><div class="cj-app-callout__eyebrow">SEU CUIDADO CONTINUA</div><h2 id="cjAppCalloutTitle">Da próxima vez, abra o app.</h2><p>Seus atendimentos e documentos reunidos. Baixe agora e tenha a ConsultaJá24h sempre à mão.</p></div><a class="cj-app-callout__play" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play">'+playBadge()+'</a></div>';
        appSection.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_section')});
        finalCta.parentNode.insertBefore(appSection,finalCta);
      }
    }

    function syncTrustNumbers(){
      var heroBadge=document.getElementById('heroBadge');
      var heroBadgeText='★★★★★ 4,7 · +4.000 atendimentos';
      if(heroBadge && heroBadge.textContent!==heroBadgeText) heroBadge.textContent=heroBadgeText;

      var heroProof=document.querySelector('#heroReviewProof span');
      var heroProofHtml='4,7 no Google · <strong>Ver avaliações</strong> · +4.000 atendimentos';
      if(heroProof && heroProof.innerHTML!==heroProofHtml) heroProof.innerHTML=heroProofHtml;

      var reviewsBadge=document.getElementById('reviewsBadgeTxt');
      if(reviewsBadge){
        var atual=reviewsBadge.innerHTML;
        var proximo=atual
          .replace(/5,0 no Google/g,'4,7 no Google')
          .replace(/\+2\.000 atendimentos/g,'+4.000 atendimentos');
        if(proximo!==atual) reviewsBadge.innerHTML=proximo;
      }
    }

    function fixPixStatusVisibility(){
      var status=document.getElementById('moPixStatus');
      var qr=document.getElementById('moQrWrap');
      if(!status||!qr||!qr.parentNode) return;
      if(status.parentNode===qr){
        qr.parentNode.insertBefore(status,qr);
        status.style.marginTop='10px';
        status.style.marginBottom='8px';
      }
    }

    function mountCeoVisualRefinement(){
      document.body.classList.add('cj-ceo-refined');
      if(document.getElementById('cj-ceo-refined-style'))return;
      var style=document.createElement('style');
      style.id='cj-ceo-refined-style';
      style.textContent='\
      body.cj-ceo-refined{background:#07100d}\
      body.cj-ceo-refined .hero{background:#f5f7f2;color:#15382f;border:1px solid #dce7df;box-shadow:0 30px 80px rgba(0,0,0,.18);border-radius:30px;margin-top:18px;margin-bottom:22px;overflow:hidden}\
      body.cj-ceo-refined .hero #heroTitle{color:#173c31!important;text-shadow:none!important}\
      body.cj-ceo-refined .hero #heroTitle em{background:linear-gradient(135deg,#0c9469,#16c783);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}\
      body.cj-ceo-refined .hero #heroSub{color:#5e7169!important}\
      body.cj-ceo-refined .hero__proof-row{color:#52675e!important}\
      body.cj-ceo-refined .hero__proof-row svg{color:#12986d!important;filter:none!important}\
      body.cj-ceo-refined .hero #heroReviewProof{color:#5c6f66!important}\
      body.cj-ceo-refined .hero #heroReviewProof strong{color:#0b8f66!important;text-decoration-color:#0b8f6645!important}\
      body.cj-ceo-refined .hero #heroSecurity{color:#75877f!important}\
      body.cj-ceo-refined .hero .hero__intent-title{color:#41584e!important}\
      body.cj-ceo-refined .hero .hero__intent-btn{background:#fff!important;border-color:#dbe5df!important;color:#27483d!important;box-shadow:0 8px 24px rgba(21,56,47,.06)!important}\
      body.cj-ceo-refined .hero .hero__intent-btn--primary{background:#123f33!important;border-color:#123f33!important;color:#efffe9!important}\
      body.cj-ceo-refined .hero .hero__intent-icon{color:#14976e!important;filter:none!important}\
      body.cj-ceo-refined .hero .hero__intent-btn--primary .hero__intent-icon{color:#9bea45!important}\
      body.cj-ceo-refined .hero .cj-play-hero__link{background:#edf5ef!important;border-color:#cddfd3!important;color:#173c31!important}\
      body.cj-ceo-refined .hero .cj-play-hero__copy strong{color:#173c31!important}\
      body.cj-ceo-refined .hero .cj-play-hero__copy small{color:#65776e!important}\
      body.cj-ceo-refined .hero .cj-play-hero__new{background:#173c31!important;color:#baf46f!important}\
      body.cj-ceo-refined .hero .cj-play-hero__arrow{color:#0b8f66!important}\
      body.cj-ceo-refined .how-section{background:#f2f5f0!important;color:#173c31!important;border-top:1px solid #dbe5df!important;border-bottom:1px solid #dbe5df!important}\
      body.cj-ceo-refined .how-section .section-label{color:#0b8f66!important}\
      body.cj-ceo-refined .how-section .section-title{color:#173c31!important}\
      body.cj-ceo-refined .how-section .section-sub{color:#66786f!important}\
      body.cj-ceo-refined .how-section .steps{grid-template-columns:repeat(3,minmax(0,1fr))!important}\
      body.cj-ceo-refined .how-section .step{background:#fff!important;border:1px solid #dce6e0!important;box-shadow:0 14px 34px rgba(21,56,47,.06)!important;color:#173c31!important}\
      body.cj-ceo-refined .how-section .step__num{background:#edf6ef!important;border-color:#cbe2d1!important;color:#0b8f66!important}\
      body.cj-ceo-refined .how-section .step h3{color:#173c31!important}\
      body.cj-ceo-refined .how-section .step p{color:#66786f!important}\
      body.cj-ceo-refined .how-section .how-summary{background:#e6f2e8!important;border-color:#c9dfcf!important;color:#335448!important}\
      .cj-flow-mini{margin-top:16px;padding:11px 12px;border-radius:13px;background:#f5f8f5;border:1px solid #e0e8e3;display:flex;align-items:center;gap:9px;min-height:58px}\
      .cj-flow-mini__icon{width:34px;height:34px;border-radius:10px;background:#e4f5e8;color:#0b8f66;display:flex;align-items:center;justify-content:center;flex:0 0 auto}\
      .cj-flow-mini__icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\
      .cj-flow-mini__copy{min-width:0;text-align:left}.cj-flow-mini__copy strong{display:block;font-size:.76rem;color:#21483b}.cj-flow-mini__copy small{display:block;margin-top:2px;font-size:.66rem;line-height:1.3;color:#74857d}\
      .cj-flow-mini__wa{margin-left:auto;width:27px;height:27px;border-radius:50%;background:#20c768;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.68rem}\
      body.cj-ceo-refined .cj-app-callout{background:#f2f5f0;border-color:#dbe5df}\
      body.cj-ceo-refined .cj-app-callout__inner{background:#123f33;border-color:#2c6755;box-shadow:0 18px 50px rgba(0,0,0,.16)}\
      body.cj-ceo-refined .cj-video-section video{aspect-ratio:9/16;object-fit:cover;background:#08120f!important}\
      @media(max-width:720px){\
        body.cj-ceo-refined .hero{margin:0;border-radius:0;border-left:0;border-right:0;box-shadow:none;padding-top:30px!important;padding-bottom:30px!important}\
        body.cj-ceo-refined .hero #heroTitle{font-size:clamp(34px,10.8vw,46px)!important;line-height:1.02!important;letter-spacing:-.05em!important;margin-bottom:15px!important}\
        body.cj-ceo-refined .hero #heroSub{font-size:15px!important;line-height:1.48!important;max-width:96%!important}\
        body.cj-ceo-refined .hero #heroCTA{min-height:62px!important;border-radius:15px!important;font-size:16px!important}\
        body.cj-ceo-refined .hero .hero__intent{margin-top:22px!important}\
        body.cj-ceo-refined .hero .hero__intent-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}\
        body.cj-ceo-refined .hero .hero__intent-btn{min-height:58px!important;padding:12px 11px!important;font-size:13px!important}\
        body.cj-ceo-refined .how-section{padding:38px 16px!important}\
        body.cj-ceo-refined .how-section .steps{grid-template-columns:1fr!important;gap:9px!important;margin-top:26px!important}\
        body.cj-ceo-refined .how-section .step{display:grid!important;grid-template-columns:40px 1fr!important;column-gap:12px!important;row-gap:3px!important;padding:14px!important;border-radius:16px!important}\
        body.cj-ceo-refined .how-section .step__num{grid-row:1 / span 3!important;width:38px!important;height:38px!important;margin:0!important;border-radius:11px!important}\
        body.cj-ceo-refined .how-section .step h3{margin:1px 0 2px!important;font-size:1rem!important}\
        body.cj-ceo-refined .how-section .step p{font-size:.82rem!important;line-height:1.45!important}\
        .cj-flow-mini{grid-column:2;margin-top:7px;min-height:48px;padding:8px 10px}\
        .cj-flow-mini__icon{width:30px;height:30px}\
        .cj-conversion-dock{bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;padding:6px 7px 6px 10px!important;min-height:60px!important;border-radius:15px!important}\
        .cj-conversion-dock__title{font-size:13px!important}.cj-conversion-dock__sub{display:none!important}\
        .cj-conversion-dock__btn{min-height:42px!important;padding:0 14px!important;font-size:13px!important;border-radius:11px!important}\
        .whatsapp-float.visible{bottom:calc(78px + env(safe-area-inset-bottom,0px))!important;right:13px!important;width:48px!important;height:48px!important}\
      }';
      document.head.appendChild(style);

      var how=document.querySelector('.how-section');
      var specialty=document.querySelector('.specialty-bridge');
      if(how&&specialty&&specialty.parentNode===how.parentNode){
        specialty.parentNode.insertBefore(how,specialty);
      }

      var demoVideo=document.querySelector('.cj-video-section video');
      if(demoVideo){
        demoVideo.setAttribute('poster','/consulta/video-poster-v1.svg');
      }

      var title=how&&how.querySelector('.section-title');
      var sub=how&&how.querySelector('.section-sub');
      if(title) title.innerHTML='Como funciona';
      if(sub) sub.textContent='Do pagamento ao atendimento e aos documentos, sem complicação.';
      var steps=how?how.querySelectorAll('.step'):[];
      if(steps.length>=3){
        var data=[
          {title:'1. Inicie a consulta',copy:'Informe seus dados e confirme o pagamento único por PIX ou cartão.',icon:'<path d="M7 3h10v18H7z"/><path d="M10 7h4M10 11h4M10 15h2"/>',mini:'Cadastro e pagamento',small:'Tudo pelo celular'},
          {title:'2. Fale com um médico',copy:'Converse por chat, sem câmera, ou por vídeo, conforme disponibilidade médica.',icon:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',mini:'Médico disponível',small:'Chat ou vídeo'},
          {title:'3. Receba seus documentos',copy:'Após avaliação, documentos ficam em PDF e, quando houver indicação, a receita digital pode chegar via Memed no WhatsApp.',icon:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4"/><path d="M9 13h6M9 16h4"/>',mini:'Receita médica.pdf',small:'Documento digital',wa:true}
        ];
        steps.forEach(function(step,i){
          var h=step.querySelector('h3'),p=step.querySelector('p');
          if(h)h.textContent=data[i].title;
          if(p)p.textContent=data[i].copy;
          if(!step.querySelector('.cj-flow-mini')){
            var mini=document.createElement('div');
            mini.className='cj-flow-mini';
            mini.innerHTML='<span class="cj-flow-mini__icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+data[i].icon+'</svg></span><span class="cj-flow-mini__copy"><strong>'+data[i].mini+'</strong><small>'+data[i].small+'</small></span>'+(data[i].wa?'<span class="cj-flow-mini__wa" aria-label="WhatsApp">W</span>':'');
            step.appendChild(mini);
          }
        });
      }
    }

    syncTrustNumbers();
    fixPixStatusVisibility();
    mountAppPromos();
    mountCeoVisualRefinement();
    setTimeout(syncTrustNumbers,800);
    setTimeout(syncTrustNumbers,2200);
    setTimeout(syncTrustNumbers,4500);
    setTimeout(fixPixStatusVisibility,250);
    setTimeout(fixPixStatusVisibility,900);

    var reviewsBadge=document.getElementById('reviewsBadgeTxt');
    if(reviewsBadge && typeof MutationObserver!=='undefined'){
      new MutationObserver(function(){
        var atual=reviewsBadge.innerHTML;
        if(/5,0 no Google|\+2\.000 atendimentos/.test(atual)) syncTrustNumbers();
      }).observe(reviewsBadge,{childList:true,subtree:true,characterData:true});
    }

    var hero=document.querySelector('.hero');
    if(hero && !document.querySelector('.cj-social-proof')){
      var proof=document.createElement('a');
      proof.className='cj-social-proof';
      proof.href='https://www.instagram.com/consultaja24h';
      proof.target='_blank';
      proof.rel='noopener';
      proof.setAttribute('aria-label','Acompanhe nosso Instagram');
      proof.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><span>Acompanhe nosso Instagram!</span>';
      hero.appendChild(proof);
    }

    if(!document.querySelector('.cj-conversion-dock')){
      var dock=document.createElement('div');
      dock.className='cj-conversion-dock';
      dock.setAttribute('role','region');
      dock.setAttribute('aria-label','Iniciar consulta online');
      dock.innerHTML='<div class="cj-conversion-dock__copy"><div class="cj-conversion-dock__title">Médico online agora</div><div class="cj-conversion-dock__sub">Atendimento por chat ou vídeo</div></div><button class="cj-conversion-dock__btn" type="button">Consultar agora</button>';
      document.body.appendChild(dock);
      var btn=dock.querySelector('button');
      btn.addEventListener('click',function(ev){
        if(typeof window.moCliqueAbrir==='function') return window.moCliqueAbrir(ev,'sticky_conversion');
        var cta=document.querySelector('#heroCTA button,#heroCTA a,.hero__cta button,.hero__cta a');
        if(cta) cta.click();
      });
      function syncDock(){
        var y=window.scrollY||document.documentElement.scrollTop||0;
        var max=document.documentElement.scrollHeight-window.innerHeight;
        var nearBottom=max>0 && y>max-520;
        dock.classList.toggle('is-visible',y>420 && !nearBottom);
      }
      syncDock();
      window.addEventListener('scroll',syncDock,{passive:true});
      window.addEventListener('resize',syncDock,{passive:true});
    }
  });
})();