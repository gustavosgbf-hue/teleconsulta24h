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
      if(isAppleMobile()) return;
      var priceAnchor=document.getElementById('heroPriceAnchor');
      if(priceAnchor&&!document.querySelector('.cj-play-hero')){
        var heroApp=document.createElement('div');
        heroApp.className='cj-play-hero';
        heroApp.innerHTML='<a class="cj-play-hero__link" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play"><span class="cj-play-hero__new">APP</span><span class="cj-play-hero__copy"><strong>Também disponível no aplicativo</strong><small>Atendimentos e documentos no celular.</small></span><span class="cj-play-hero__arrow">›</span></a>';
        heroApp.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_hero')});
        priceAnchor.parentNode.insertBefore(heroApp,priceAnchor.nextSibling);
      }

      var finalCta=document.querySelector('.cta-final');
      if(finalCta&&!document.querySelector('.cj-app-callout')){
        var appSection=document.createElement('section');
        appSection.className='cj-app-callout reveal visible';
        appSection.setAttribute('aria-labelledby','cjAppCalloutTitle');
        appSection.innerHTML='<div class="cj-app-callout__inner"><div class="cj-app-callout__icon"><img src="/icon-192.png" alt="" loading="lazy"></div><div class="cj-app-callout__copy"><div class="cj-app-callout__eyebrow">CONSULTAJÁ24H NO CELULAR</div><h2 id="cjAppCalloutTitle">Da próxima vez, abra o app.</h2><p>Atendimentos e documentos reunidos em um só lugar.</p></div><a class="cj-app-callout__play" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play">'+playBadge()+'</a></div>';
        appSection.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_section')});
        finalCta.parentNode.insertBefore(appSection,finalCta);
      }
    }

    function syncTrustNumbers(){
      var heroBadge=document.getElementById('heroBadge');
      var heroBadgeText='★★★★★ 4,7 · +4.000 atendimentos';
      if(heroBadge&&heroBadge.textContent!==heroBadgeText) heroBadge.textContent=heroBadgeText;

      var heroProof=document.querySelector('#heroReviewProof span');
      var heroProofHtml='4,7 no Google · <strong>Ver avaliações</strong> · +4.000 atendimentos';
      if(heroProof&&heroProof.innerHTML!==heroProofHtml) heroProof.innerHTML=heroProofHtml;

      var reviewsBadge=document.getElementById('reviewsBadgeTxt');
      if(reviewsBadge){
        var atual=reviewsBadge.innerHTML;
        var proximo=atual.replace(/5,0 no Google/g,'4,7 no Google').replace(/\+2\.000 atendimentos/g,'+4.000 atendimentos');
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

    function setupHowSection(){
      var how=document.querySelector('.how-section');
      var specialty=document.querySelector('.specialty-bridge');
      if(how&&specialty&&specialty.parentNode===how.parentNode){
        specialty.parentNode.insertBefore(how,specialty);
      }

      var title=how&&how.querySelector('.section-title');
      var sub=how&&how.querySelector('.section-sub');
      if(title) title.textContent='Como funciona';
      if(sub) sub.textContent='Consulta, atendimento e documentos sem complicação.';

      var steps=how?how.querySelectorAll('.step'):[];
      if(steps.length>=3){
        var data=[
          {title:'1. Inicie a consulta',copy:'Preencha seus dados e pague uma única vez por PIX ou cartão.',icon:'<path d="M7 3h10v18H7z"/><path d="M10 7h4M10 11h4M10 15h2"/>',mini:'Pagamento seguro',small:'PIX ou cartão'},
          {title:'2. Fale com um médico',copy:'Atendimento por chat ou vídeo, conforme disponibilidade médica.',icon:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',mini:'Médico disponível',small:'Chat ou vídeo'},
          {title:'3. Receba seus documentos',copy:'Quando houver indicação, receitas e documentos ficam disponíveis digitalmente.',icon:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4"/><path d="M9 13h6M9 16h4"/>',mini:'Documento digital',small:'PDF e receita digital'}
        ];
        steps.forEach(function(step,i){
          var h=step.querySelector('h3');
          var p=step.querySelector('p');
          if(h) h.textContent=data[i].title;
          if(p) p.textContent=data[i].copy;
          var old=step.querySelector('.cj-flow-mini');
          if(old) old.remove();
          var mini=document.createElement('div');
          mini.className='cj-flow-mini';
          mini.innerHTML='<span class="cj-flow-mini__icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+data[i].icon+'</svg></span><span class="cj-flow-mini__copy"><strong>'+data[i].mini+'</strong><small>'+data[i].small+'</small></span>';
          step.appendChild(mini);
        });
      }
    }

    function mountVisualPolish(){
      document.body.classList.add('cj-ceo-refined');
      if(document.getElementById('cj-mobile-polish-v4')) return;
      var style=document.createElement('style');
      style.id='cj-mobile-polish-v4';
      style.textContent='\
      body.cj-ceo-refined{background:#07100d}\
      body.cj-ceo-refined .hero{background:#f4f6f1;color:#15382f;border:1px solid #dce7df;box-shadow:0 30px 80px rgba(0,0,0,.18);border-radius:30px;margin-top:18px;margin-bottom:22px;overflow:hidden}\
      body.cj-ceo-refined .hero #heroTitle{color:#173c31!important;text-shadow:none!important}\
      body.cj-ceo-refined .hero #heroTitle em{background:linear-gradient(135deg,#0c9469,#16c783);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}\
      body.cj-ceo-refined .hero #heroSub{color:#5e7169!important}\
      body.cj-ceo-refined .hero__proof-row{color:#52675e!important}\
      body.cj-ceo-refined .hero__proof-row svg{color:#12986d!important;filter:none!important}\
      body.cj-ceo-refined .hero #heroReviewProof{color:#5c6f66!important}\
      body.cj-ceo-refined .hero #heroReviewProof strong{color:#0b8f66!important}\
      body.cj-ceo-refined .hero #heroSecurity{color:#75877f!important}\
      body.cj-ceo-refined .hero .hero__intent-title{color:#41584e!important}\
      body.cj-ceo-refined .hero .hero__intent-btn{background:#fff!important;border-color:#dbe5df!important;color:#27483d!important;box-shadow:0 8px 24px rgba(21,56,47,.06)!important}\
      body.cj-ceo-refined .hero .hero__intent-btn--primary{background:#123f33!important;border-color:#123f33!important;color:#efffe9!important}\
      body.cj-ceo-refined .hero .hero__intent-icon{color:#14976e!important;filter:none!important}\
      body.cj-ceo-refined .hero .hero__intent-btn--primary .hero__intent-icon{color:#9bea45!important}\
      body.cj-ceo-refined .hero .cj-play-hero__link{background:#eaf2ec!important;border-color:#cbdcd0!important;color:#173c31!important}\
      body.cj-ceo-refined .hero .cj-play-hero__copy strong{color:#173c31!important}\
      body.cj-ceo-refined .hero .cj-play-hero__copy small{color:#65776e!important}\
      body.cj-ceo-refined .hero .cj-play-hero__new{background:#173c31!important;color:#baf46f!important}\
      body.cj-ceo-refined .hero .cj-play-hero__arrow{color:#0b8f66!important}\
      body.cj-ceo-refined .how-section{background:#f2f5f0!important;color:#173c31!important;border-top:1px solid #dbe5df!important;border-bottom:1px solid #dbe5df!important}\
      body.cj-ceo-refined .how-section .section-label{color:#0b8f66!important}\
      body.cj-ceo-refined .how-section .section-title{color:#173c31!important}\
      body.cj-ceo-refined .how-section .section-sub{color:#66786f!important}\
      body.cj-ceo-refined .how-section .step{background:#fff!important;border:1px solid #dce6e0!important;box-shadow:0 14px 34px rgba(21,56,47,.06)!important;color:#173c31!important}\
      body.cj-ceo-refined .how-section .step__num{background:#edf6ef!important;border-color:#cbe2d1!important;color:#0b8f66!important}\
      body.cj-ceo-refined .how-section .step h3{color:#173c31!important}\
      body.cj-ceo-refined .how-section .step p{color:#66786f!important}\
      body.cj-ceo-refined .how-section .how-summary{background:#e6f2e8!important;border-color:#c9dfcf!important;color:#335448!important}\
      .cj-flow-mini{margin-top:14px;padding:10px 11px;border-radius:13px;background:#f5f8f5;border:1px solid #e0e8e3;display:flex;align-items:center;gap:9px;min-height:54px}\
      .cj-flow-mini__icon{width:32px;height:32px;border-radius:10px;background:#e4f5e8;color:#0b8f66;display:flex;align-items:center;justify-content:center;flex:0 0 auto}\
      .cj-flow-mini__icon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\
      .cj-flow-mini__copy{min-width:0;text-align:left}.cj-flow-mini__copy strong{display:block;font-size:.75rem;color:#21483b}.cj-flow-mini__copy small{display:block;margin-top:2px;font-size:.65rem;line-height:1.3;color:#74857d}\
      body.cj-ceo-refined .cj-app-callout{background:#f2f5f0;border-color:#dbe5df}\
      body.cj-ceo-refined .cj-app-callout__inner{background:#123f33;border-color:#2c6755;box-shadow:0 18px 50px rgba(0,0,0,.16)}\
      body.cj-ceo-refined .cj-video-section video{aspect-ratio:9/16;object-fit:cover;background:#08120f!important}\
      @media(max-width:720px){\
        body.cj-ceo-refined .nav__in{padding:11px 14px!important}\
        body.cj-ceo-refined .nav__logo{font-size:16px!important}\
        body.cj-ceo-refined .nav__cta-link{min-height:38px!important;padding:9px 11px!important;font-size:11.5px!important;border-radius:11px!important}\
        body.cj-ceo-refined .hero{margin:0!important;border-radius:0 0 26px 26px!important;border:0!important;box-shadow:0 14px 34px rgba(0,0,0,.12)!important;padding:24px 16px 24px!important;align-items:stretch!important;text-align:left!important}\
        body.cj-ceo-refined .hero #heroTitle{font-size:clamp(30px,9vw,38px)!important;line-height:1.03!important;letter-spacing:-.048em!important;margin:0 0 12px!important;text-align:left!important;max-width:95%!important}\
        body.cj-ceo-refined .hero #heroSub{font-size:14.5px!important;line-height:1.47!important;max-width:96%!important;margin:0 0 17px!important;text-align:left!important}\
        body.cj-ceo-refined .hero #heroCTA{width:100%!important;max-width:none!important;min-height:56px!important;border-radius:14px!important;font-size:15.5px!important;margin:0!important}\
        body.cj-ceo-refined .hero #heroReviewProof{font-size:11.5px!important;line-height:1.45!important;margin:10px 0 0!important;text-align:center!important;justify-content:center!important}\
        body.cj-ceo-refined .hero #heroPriceAnchor{margin:10px 0 0!important;align-items:flex-start!important;gap:4px!important}\
        body.cj-ceo-refined .hero__proof-row{font-size:11.5px!important;line-height:1.4!important;justify-content:flex-start!important}\
        body.cj-ceo-refined .hero .cj-play-hero{margin:12px 0 0!important;max-width:none!important}\
        body.cj-ceo-refined .hero .cj-play-hero__link{padding:10px 11px!important;border-radius:13px!important;gap:9px!important}\
        body.cj-ceo-refined .hero .cj-play-hero__new{font-size:8px!important;padding:4px 5px!important}\
        body.cj-ceo-refined .hero .cj-play-hero__copy strong{font-size:12.5px!important}\
        body.cj-ceo-refined .hero .cj-play-hero__copy small{font-size:10.5px!important}\
        body.cj-ceo-refined .hero .hero__intent{margin:18px 0 0!important;max-width:none!important;width:100%!important}\
        body.cj-ceo-refined .hero .hero__intent-title{font-size:12px!important;line-height:1.35!important;margin-bottom:9px!important;text-align:left!important}\
        body.cj-ceo-refined .hero .hero__intent-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}\
        body.cj-ceo-refined .hero .hero__intent-btn{min-height:46px!important;padding:9px 9px!important;font-size:11.5px!important;border-radius:12px!important;gap:7px!important;text-align:left!important;justify-content:flex-start!important}\
        body.cj-ceo-refined .hero .hero__intent-icon{width:17px!important;height:17px!important}\
        body.cj-ceo-refined .hero #heroSecurity{font-size:10.5px!important;line-height:1.4!important;margin:12px 0 0!important;text-align:center!important}\
        body.cj-ceo-refined .section-inner{padding-left:0!important;padding-right:0!important}\
        body.cj-ceo-refined .section-label,body.cj-ceo-refined .section-title,body.cj-ceo-refined .section-sub{text-align:left!important}\
        body.cj-ceo-refined .section-title{font-size:1.72rem!important;line-height:1.08!important}\
        body.cj-ceo-refined .pain-section,body.cj-ceo-refined .price-section,body.cj-ceo-refined .reviews-section,body.cj-ceo-refined .faq-section{padding:38px 16px!important}\
        body.cj-ceo-refined .how-section{padding:38px 0 40px!important;overflow:hidden!important}\
        body.cj-ceo-refined .how-section>.section-inner{padding:0 16px!important}\
        body.cj-ceo-refined .how-section .steps{display:flex!important;grid-template-columns:none!important;gap:10px!important;overflow-x:auto!important;overscroll-behavior-x:contain!important;scroll-snap-type:x mandatory!important;margin:22px -16px 0!important;padding:0 16px 10px!important;scrollbar-width:none!important}\
        body.cj-ceo-refined .how-section .steps::-webkit-scrollbar{display:none!important}\
        body.cj-ceo-refined .how-section .step{display:block!important;flex:0 0 min(82vw,330px)!important;scroll-snap-align:start!important;padding:17px!important;border-radius:18px!important;min-height:220px!important}\
        body.cj-ceo-refined .how-section .step__num{width:38px!important;height:38px!important;margin:0 0 11px!important;border-radius:11px!important}\
        body.cj-ceo-refined .how-section .step h3{font-size:1rem!important;margin:0 0 6px!important}\
        body.cj-ceo-refined .how-section .step p{font-size:.81rem!important;line-height:1.45!important;margin:0!important}\
        body.cj-ceo-refined .how-section .how-summary{margin:12px 16px 0!important;padding:12px 13px!important;font-size:12px!important}\
        body.cj-ceo-refined .cj-video-section{padding-top:38px!important;padding-bottom:42px!important}\
        body.cj-ceo-refined .cj-video-section video{display:block!important;width:min(78vw,300px)!important;max-width:300px!important;height:auto!important;aspect-ratio:9/16!important;margin:18px auto 0!important;border-radius:24px!important;box-shadow:0 18px 45px rgba(0,0,0,.28)!important}\
        body.cj-ceo-refined .doctor-strip,body.cj-ceo-refined .doctor-strip-section{padding-top:34px!important;padding-bottom:34px!important}\
        body.cj-ceo-refined .dstrip-card{border-radius:18px!important}\
        body.cj-ceo-refined .specialty-bridge{padding:30px 14px 38px!important}\
        body.cj-ceo-refined .specialty-bridge__inner{padding:18px 14px!important;border-radius:20px!important}\
        body.cj-ceo-refined .specialty-mini{padding:13px 11px!important;border-radius:14px!important}\
        body.cj-ceo-refined .cj-app-callout{padding:26px 14px!important}\
        body.cj-ceo-refined .cj-app-callout__inner{grid-template-columns:46px 1fr!important;gap:12px!important;padding:18px 15px!important;border-radius:19px!important}\
        body.cj-ceo-refined .cj-app-callout__icon{width:46px!important;height:46px!important;border-radius:12px!important}\
        body.cj-ceo-refined .cj-app-callout__copy h2{font-size:20px!important;margin:4px 0 5px!important}\
        body.cj-ceo-refined .cj-app-callout__copy p{font-size:12.5px!important;line-height:1.45!important}\
        body.cj-ceo-refined .cj-app-callout__eyebrow{font-size:9px!important}\
        body.cj-ceo-refined .cj-app-callout__play{grid-column:1/-1!important;justify-self:stretch!important;margin-top:2px!important;min-height:54px!important;padding:11px 14px!important;border-radius:13px!important}\
        body.cj-ceo-refined .cj-conversion-dock{bottom:calc(7px + env(safe-area-inset-bottom,0px))!important;width:calc(100% - 16px)!important;min-height:54px!important;padding:6px 6px 6px 10px!important;border-radius:14px!important;gap:7px!important}\
        body.cj-ceo-refined .cj-conversion-dock__title{font-size:12px!important}\
        body.cj-ceo-refined .cj-conversion-dock__sub{display:none!important}\
        body.cj-ceo-refined .cj-conversion-dock__btn{min-height:40px!important;padding:0 12px!important;font-size:12px!important;border-radius:10px!important}\
        body.cj-ceo-refined .whatsapp-float.visible{bottom:calc(70px + env(safe-area-inset-bottom,0px))!important;right:12px!important;width:46px!important;height:46px!important}\
      }';
      document.head.appendChild(style);
    }

    function setupVideo(){
      var video=document.querySelector('.cj-video-section video');
      if(video){
        video.setAttribute('poster','/consulta/video-poster-v1.svg');
        video.setAttribute('playsinline','');
        video.preload='metadata';
      }
    }

    function mountDock(){
      if(document.querySelector('.cj-conversion-dock')) return;
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
        var nearBottom=max>0&&y>max-520;
        dock.classList.toggle('is-visible',y>520&&!nearBottom);
      }
      syncDock();
      window.addEventListener('scroll',syncDock,{passive:true});
      window.addEventListener('resize',syncDock,{passive:true});
    }

    syncTrustNumbers();
    fixPixStatusVisibility();
    mountAppPromos();
    setupHowSection();
    mountVisualPolish();
    setupVideo();
    mountDock();

    setTimeout(syncTrustNumbers,800);
    setTimeout(syncTrustNumbers,2200);
    setTimeout(syncTrustNumbers,4500);
    setTimeout(fixPixStatusVisibility,250);
    setTimeout(fixPixStatusVisibility,900);

    var reviewsBadge=document.getElementById('reviewsBadgeTxt');
    if(reviewsBadge&&typeof MutationObserver!=='undefined'){
      new MutationObserver(function(){
        var atual=reviewsBadge.innerHTML;
        if(/5,0 no Google|\+2\.000 atendimentos/.test(atual)) syncTrustNumbers();
      }).observe(reviewsBadge,{childList:true,subtree:true,characterData:true});
    }
  });
})();