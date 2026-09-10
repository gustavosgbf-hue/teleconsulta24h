(function(){
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  ready(function(){
    var PLAY_STORE_URL='https://play.google.com/store/apps/details?id=com.consultaja24h.app';

    function trackAppDownload(source){
      try{
        window.dataLayer=window.dataLayer||[];
        window.dataLayer.push({event:'app_download_click',app_store:'google_play',source:source||'landing'});
      }catch(e){}
    }

    function googlePlayMark(className){
      return '<svg class="'+(className||'')+'" viewBox="0 0 32 36" aria-hidden="true"><path fill="#00d7fe" d="M2 2.6v30.8c0 1.8 2 2.8 3.4 1.7L22.8 18 5.4.9C4-.2 2 .8 2 2.6z"/><path fill="#00f076" d="M5.4.9 22.8 18l4.6-4.5L8.8.6C7.7-.2 6.4-.1 5.4.9z"/><path fill="#ffd900" d="m22.8 18-17.4 17.1c1 1 2.4 1.1 3.5.4l18.6-12.9-4.7-4.6z"/><path fill="#ff3a44" d="M29.6 16.1 27.4 14l-4.6 4 4.7 4.6 2.1-1.5c1.9-1.3 1.9-3.7 0-5z"/></svg>';
    }

    function playBadge(){
      return googlePlayMark('cj-google-play-mark')+'<span class="cj-play-badge-copy"><small>DISPONÍVEL NO</small><strong>Google Play</strong></span>';
    }

    function mountAppPromos(){
      var priceAnchor=document.getElementById('heroPriceAnchor');
      if(priceAnchor&&!document.querySelector('.cj-play-hero')){
        var heroApp=document.createElement('div');
        heroApp.className='cj-play-hero';
        heroApp.innerHTML='<a class="cj-play-hero__link" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play"><img class="cj-play-hero__appicon" src="/icon-192.png" alt="" width="42" height="42"><span class="cj-play-hero__copy"><strong>Prefere usar o aplicativo?</strong><small>Consultas e documentos no celular</small></span><span class="cj-play-hero__badge">'+playBadge()+'</span></a>';
        heroApp.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_hero')});
        priceAnchor.parentNode.insertBefore(heroApp,priceAnchor.nextSibling);
      }

      var finalCta=document.querySelector('.cta-final');
      if(finalCta&&!document.querySelector('.cj-app-callout')){
        var appSection=document.createElement('section');
        appSection.className='cj-app-callout reveal visible';
        appSection.setAttribute('aria-labelledby','cjAppCalloutTitle');
        appSection.innerHTML='<div class="cj-app-callout__inner"><div class="cj-app-callout__icon"><img src="/icon-192.png" alt="" loading="lazy"></div><div class="cj-app-callout__copy"><div class="cj-app-callout__eyebrow">APP CONSULTAJÁ24H</div><h2 id="cjAppCalloutTitle">Sua consulta continua com você.</h2><p>Acesse seus atendimentos e documentos pelo celular.</p></div><a class="cj-app-callout__play" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play">'+playBadge()+'</a></div>';
        appSection.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_section')});
        finalCta.parentNode.insertBefore(appSection,finalCta);
      }
    }

    function syncTrustNumbers(){
      var heroBadge=document.getElementById('heroBadge');
      if(heroBadge) heroBadge.textContent='★★★★★ 4,7 · +4.000 atendimentos';
      var heroProof=document.querySelector('#heroReviewProof span');
      if(heroProof) heroProof.innerHTML='4,7 no Google · <strong>Ver avaliações</strong> · +4.000 atendimentos';
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
      if(how&&specialty&&specialty.parentNode===how.parentNode){specialty.parentNode.insertBefore(how,specialty)}
      if(!how)return;
      var label=how.querySelector('.section-label');
      var title=how.querySelector('.section-title');
      var sub=how.querySelector('.section-sub');
      if(label)label.textContent='SIMPLES, SEGURO E SEM BUROCRACIA';
      if(title)title.textContent='Como funciona';
      if(sub)sub.textContent='Três passos e você já sabe o que esperar.';
      var steps=how.querySelectorAll('.step');
      var data=[
        {title:'1. Inicie a consulta',copy:'Cadastro e pagamento por PIX ou cartão.'},
        {title:'2. Fale com um médico',copy:'Atendimento por chat ou vídeo.'},
        {title:'3. Receba seus documentos',copy:'PDF no chat e receita digital quando indicada.'}
      ];
      steps.forEach(function(step,i){
        if(!data[i])return;
        var h=step.querySelector('h3');var p=step.querySelector('p');
        if(h)h.textContent=data[i].title;if(p)p.textContent=data[i].copy;
        var mini=step.querySelector('.cj-flow-mini');if(mini)mini.remove();
      });
    }

    function simplifyMobileIntents(){
      var grid=document.querySelector('.hero__intent-grid');
      if(!grid||document.querySelector('.cj-intent-more'))return;
      var buttons=Array.prototype.slice.call(grid.querySelectorAll('.hero__intent-btn'));
      if(buttons.length<=3)return;
      buttons.slice(3).forEach(function(btn){btn.classList.add('cj-intent-extra')});
      var more=document.createElement('button');more.type='button';more.className='cj-intent-more';more.textContent='Ver outros atendimentos';
      more.addEventListener('click',function(){var open=grid.classList.toggle('is-expanded');more.textContent=open?'Ver menos':'Ver outros atendimentos'});
      grid.parentNode.insertBefore(more,grid.nextSibling);
    }

    function mountVisualPolish(){
      document.body.classList.add('cj-ceo-refined');
      if(document.getElementById('cj-dark-premium-v6'))return;
      var style=document.createElement('style');style.id='cj-dark-premium-v6';
      style.textContent=`
        body.cj-ceo-refined{background:#030907!important;color:#f4f8f5!important}
        body.cj-ceo-refined .bg-glow{opacity:.48!important}
        body.cj-ceo-refined .hero{position:relative!important;background:radial-gradient(circle at 82% 22%,rgba(67,223,126,.17),transparent 33rem),linear-gradient(145deg,#0b1712 0%,#06100c 58%,#040b08 100%)!important;color:#f7fbf8!important;border:1px solid rgba(120,230,165,.11)!important;box-shadow:0 32px 90px rgba(0,0,0,.34)!important;border-radius:28px!important;margin:18px auto 26px!important;overflow:hidden!important}
        body.cj-ceo-refined .hero #heroTitle{color:#f7fbf8!important;text-shadow:none!important}
        body.cj-ceo-refined .hero #heroTitle em{background:linear-gradient(135deg,#a3f04b,#43df7e)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}
        body.cj-ceo-refined .hero #heroSub{color:#b5c4bc!important}
        body.cj-ceo-refined .hero__proof-row{color:#b8c7bf!important}
        body.cj-ceo-refined .hero__proof-row svg{color:#62e39a!important;filter:none!important}
        body.cj-ceo-refined .hero #heroReviewProof{color:#aab9b1!important}
        body.cj-ceo-refined .hero #heroReviewProof strong{color:#c9f791!important}
        body.cj-ceo-refined .hero #heroSecurity{color:#7f9188!important}
        body.cj-ceo-refined .hero .hero__intent-title{color:#d9e3dd!important}
        body.cj-ceo-refined .hero .hero__intent-btn{background:rgba(255,255,255,.025)!important;border-color:rgba(120,230,165,.12)!important;color:#e7f0eb!important;box-shadow:none!important}
        body.cj-ceo-refined .hero .hero__intent-btn--primary{background:rgba(155,234,69,.09)!important;border-color:rgba(155,234,69,.32)!important;color:#efffda!important}
        body.cj-ceo-refined .hero .hero__intent-icon{color:#57dfa0!important;filter:none!important}
        body.cj-ceo-refined .hero .hero__intent-btn--primary .hero__intent-icon{color:#a8f04a!important}
        .cj-play-hero{width:100%;max-width:640px;margin:13px auto 0!important}
        .cj-play-hero__link{display:flex;align-items:center;gap:11px;width:100%;padding:11px 12px;border-radius:15px;background:rgba(2,8,5,.72)!important;border:1px solid rgba(120,230,165,.18)!important;color:#fff!important;text-decoration:none;backdrop-filter:blur(12px)}
        .cj-play-hero__appicon{width:40px;height:40px;border-radius:10px;object-fit:cover;flex:0 0 auto}
        .cj-play-hero__copy{display:flex;flex-direction:column;min-width:0;gap:2px;text-align:left;flex:1}
        .cj-play-hero__copy strong{font-size:13px!important;line-height:1.2;color:#fff!important}
        .cj-play-hero__copy small{font-size:10.5px!important;color:#96aaa0!important}
        .cj-play-hero__badge{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:10px;background:#020503;border:1px solid rgba(255,255,255,.14);flex:0 0 auto}
        .cj-google-play-mark{display:block;width:24px!important;height:27px!important;flex:0 0 auto}
        .cj-play-badge-copy{display:flex;flex-direction:column;align-items:flex-start}
        .cj-play-badge-copy small{font-size:7px!important;letter-spacing:.08em;line-height:1;color:#c8d0cc!important}
        .cj-play-badge-copy strong{font-size:14px!important;line-height:1.05;color:#fff!important}
        body.cj-ceo-refined .how-section{background:linear-gradient(180deg,#07110d,#050c09)!important;color:#f5f8f6!important;border-top:1px solid rgba(255,255,255,.055)!important;border-bottom:1px solid rgba(255,255,255,.055)!important}
        body.cj-ceo-refined .how-section .section-label{color:#8ee05e!important}
        body.cj-ceo-refined .how-section .section-title{color:#f4f7f5!important}
        body.cj-ceo-refined .how-section .section-sub{color:#8fa197!important}
        body.cj-ceo-refined .how-section .steps{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        body.cj-ceo-refined .how-section .step{background:#0b1712!important;border:1px solid rgba(120,230,165,.12)!important;box-shadow:none!important;color:#f4f7f5!important}
        body.cj-ceo-refined .how-section .step__num{background:#11271b!important;border-color:rgba(155,234,69,.24)!important;color:#a8f04a!important}
        body.cj-ceo-refined .how-section .step h3{color:#f3f7f4!important}
        body.cj-ceo-refined .how-section .step p{color:#91a39a!important}
        body.cj-ceo-refined .how-section .how-summary{background:rgba(155,234,69,.045)!important;border-color:rgba(155,234,69,.12)!important;color:#aebfb6!important}
        body.cj-ceo-refined .cj-app-callout{background:#050c09!important;border-color:rgba(255,255,255,.05)!important}
        body.cj-ceo-refined .cj-app-callout__inner{background:#0c1c14!important;border-color:rgba(120,230,165,.18)!important;box-shadow:none!important}
        body.cj-ceo-refined .cj-app-callout__play{background:#030604!important;color:#fff!important;border:1px solid rgba(255,255,255,.14)!important}
        .cj-intent-more{display:none}
        @media(min-width:900px){
          body.cj-ceo-refined .hero{min-height:0!important;padding:58px 64px 50px!important;align-items:center!important;text-align:center!important}
          body.cj-ceo-refined .hero #heroTitle,body.cj-ceo-refined .hero #heroSub,body.cj-ceo-refined .hero #heroCTA,body.cj-ceo-refined .hero #heroPriceAnchor,body.cj-ceo-refined .hero .hero__intent,body.cj-ceo-refined .hero #heroReviewProof,body.cj-ceo-refined .hero #heroSecurity,body.cj-ceo-refined .hero .cj-play-hero{width:100%!important;margin-left:auto!important;margin-right:auto!important}
          body.cj-ceo-refined .hero #heroTitle{max-width:820px!important;font-size:clamp(48px,4.2vw,64px)!important;line-height:.98!important;letter-spacing:-.055em!important}
          body.cj-ceo-refined .hero #heroSub{max-width:680px!important;font-size:16px!important;line-height:1.5!important}
          body.cj-ceo-refined .hero #heroCTA,body.cj-ceo-refined .hero #heroPriceAnchor{max-width:640px!important}
          body.cj-ceo-refined .hero .hero__intent{max-width:780px!important}
          body.cj-ceo-refined .hero #heroReviewProof,body.cj-ceo-refined .hero #heroSecurity{max-width:700px!important;justify-content:center!important;text-align:center!important}
          body.cj-ceo-refined .hero .cj-play-hero{max-width:700px!important}
        }
        @media(max-width:720px){
          body.cj-ceo-refined .nav__in{padding:10px 13px!important}
          body.cj-ceo-refined .nav__logo{font-size:15px!important}
          body.cj-ceo-refined .nav__cta-link{min-height:38px!important;padding:9px 12px!important;font-size:11.5px!important;border-radius:11px!important}
          body.cj-ceo-refined .hero{margin:0!important;border-radius:0 0 22px 22px!important;border:0!important;box-shadow:0 14px 34px rgba(0,0,0,.22)!important;padding:24px 15px 22px!important;align-items:stretch!important;text-align:left!important}
          body.cj-ceo-refined .hero #heroTitle{font-size:clamp(31px,9.2vw,39px)!important;line-height:1.01!important;letter-spacing:-.052em!important;margin:0 0 11px!important;text-align:left!important;max-width:96%!important}
          body.cj-ceo-refined .hero #heroSub{font-size:14px!important;line-height:1.45!important;max-width:96%!important;margin:0 0 16px!important;text-align:left!important}
          body.cj-ceo-refined .hero #heroCTA{width:100%!important;max-width:none!important;min-height:55px!important;border-radius:14px!important;font-size:15.5px!important;margin:0!important}
          body.cj-ceo-refined .hero #heroReviewProof{font-size:11px!important;line-height:1.4!important;margin:9px 0 0!important;text-align:left!important;justify-content:flex-start!important}
          body.cj-ceo-refined .hero #heroPriceAnchor{margin:8px 0 0!important;gap:3px!important}
          body.cj-ceo-refined .hero__proof-row{font-size:10.8px!important;line-height:1.35!important;justify-content:flex-start!important}
          body.cj-ceo-refined .hero #heroSecurity{font-size:10px!important;line-height:1.35!important;margin:10px 0 0!important;text-align:left!important}
          body.cj-ceo-refined .hero .cj-play-hero{margin:12px 0 0!important;max-width:none!important}
          body.cj-ceo-refined .hero .cj-play-hero__link{padding:10px!important;border-radius:13px!important;gap:9px!important}
          body.cj-ceo-refined .hero .cj-play-hero__appicon{width:36px;height:36px;border-radius:9px}
          body.cj-ceo-refined .hero .cj-play-hero__copy strong{font-size:12px!important}
          body.cj-ceo-refined .hero .cj-play-hero__copy small{font-size:9.5px!important}
          body.cj-ceo-refined .hero .cj-play-hero__badge{padding:6px 8px}
          body.cj-ceo-refined .hero .cj-google-play-mark{width:21px!important;height:24px!important}
          body.cj-ceo-refined .hero .cj-play-badge-copy small{font-size:6px!important}
          body.cj-ceo-refined .hero .cj-play-badge-copy strong{font-size:12px!important}
          body.cj-ceo-refined .hero .hero__intent{margin:17px 0 0!important;width:100%!important;max-width:none!important}
          body.cj-ceo-refined .hero .hero__intent-title{font-size:11px!important;margin-bottom:8px!important;text-align:left!important}
          body.cj-ceo-refined .hero .hero__intent-grid{grid-template-columns:1fr!important;gap:7px!important}
          body.cj-ceo-refined .hero .hero__intent-btn{min-height:45px!important;padding:9px 11px!important;font-size:12px!important;border-radius:12px!important;justify-content:flex-start!important}
          body.cj-ceo-refined .hero .hero__intent-grid .cj-intent-extra{display:none!important}
          body.cj-ceo-refined .hero .hero__intent-grid.is-expanded .cj-intent-extra{display:flex!important}
          .cj-intent-more{display:inline-flex;align-items:center;justify-content:center;margin:8px 0 0;padding:7px 0;border:0;background:transparent;color:#91a99c;font:600 11px 'Outfit',sans-serif;text-decoration:underline;text-underline-offset:3px}
          body.cj-ceo-refined .how-section{padding:38px 15px!important}
          body.cj-ceo-refined .how-section>.section-inner{padding:0!important}
          body.cj-ceo-refined .how-section .section-title{font-size:1.75rem!important;text-align:left!important}
          body.cj-ceo-refined .how-section .section-label,body.cj-ceo-refined .how-section .section-sub{text-align:left!important}
          body.cj-ceo-refined .how-section .steps{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin:20px 0 0!important;padding:0!important;overflow:visible!important}
          body.cj-ceo-refined .how-section .step{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;column-gap:12px!important;row-gap:2px!important;min-height:auto!important;padding:13px 14px!important;border-radius:15px!important}
          body.cj-ceo-refined .how-section .step__num{grid-row:1 / span 2!important;width:36px!important;height:36px!important;margin:0!important;border-radius:10px!important}
          body.cj-ceo-refined .how-section .step h3{font-size:.95rem!important;margin:1px 0 2px!important}
          body.cj-ceo-refined .how-section .step p{font-size:.78rem!important;line-height:1.4!important;margin:0!important}
          body.cj-ceo-refined .how-section .how-summary{margin:11px 0 0!important;padding:11px 12px!important;font-size:11px!important}
          body.cj-ceo-refined .cj-video-section{display:none!important}
          body.cj-ceo-refined .doctor-strip,body.cj-ceo-refined .doctor-strip-section{padding-top:30px!important;padding-bottom:30px!important}
          body.cj-ceo-refined .specialty-bridge{padding:26px 13px 34px!important}
          body.cj-ceo-refined .specialty-bridge__inner{padding:16px 12px!important;border-radius:18px!important}
          body.cj-ceo-refined .specialty-mini{padding:12px 10px!important;border-radius:13px!important}
          body.cj-ceo-refined .pain-section,body.cj-ceo-refined .price-section,body.cj-ceo-refined .reviews-section,body.cj-ceo-refined .faq-section{padding:36px 15px!important}
          body.cj-ceo-refined .cj-app-callout{padding:24px 13px!important}
          body.cj-ceo-refined .cj-app-callout__inner{grid-template-columns:44px minmax(0,1fr)!important;gap:11px!important;padding:16px 14px!important;border-radius:18px!important}
          body.cj-ceo-refined .cj-app-callout__icon{width:44px!important;height:44px!important;border-radius:11px!important}
          body.cj-ceo-refined .cj-app-callout__copy h2{font-size:19px!important;margin:4px 0 4px!important}
          body.cj-ceo-refined .cj-app-callout__copy p{font-size:12px!important;line-height:1.4!important}
          body.cj-ceo-refined .cj-app-callout__eyebrow{font-size:8.5px!important}
          body.cj-ceo-refined .cj-app-callout__play{grid-column:1/-1!important;justify-self:flex-start!important;display:inline-flex!important;gap:8px!important;padding:8px 12px!important;min-height:51px!important;border-radius:11px!important}
          body.cj-ceo-refined .cj-conversion-dock{bottom:calc(6px + env(safe-area-inset-bottom,0px))!important;width:calc(100% - 14px)!important;min-height:52px!important;padding:5px 5px 5px 9px!important;border-radius:13px!important}
          body.cj-ceo-refined .cj-conversion-dock__title{font-size:11.5px!important}
          body.cj-ceo-refined .cj-conversion-dock__sub{display:none!important}
          body.cj-ceo-refined .cj-conversion-dock__btn{min-height:39px!important;padding:0 11px!important;font-size:11.5px!important;border-radius:9px!important}
          body.cj-ceo-refined .whatsapp-float.visible{bottom:calc(66px + env(safe-area-inset-bottom,0px))!important;right:11px!important;width:44px!important;height:44px!important}
        }
      `;
      document.head.appendChild(style);
    }

    function setupVideo(){
      var video=document.querySelector('.cj-video-section video');
      if(video){video.setAttribute('poster','/consulta/video-poster-v1.svg');video.setAttribute('playsinline','');video.preload='metadata'}
    }

    function mountDock(){
      if(document.querySelector('.cj-conversion-dock'))return;
      var dock=document.createElement('div');dock.className='cj-conversion-dock';dock.setAttribute('role','region');dock.setAttribute('aria-label','Iniciar consulta online');
      dock.innerHTML='<div class="cj-conversion-dock__copy"><div class="cj-conversion-dock__title">Médico online agora</div><div class="cj-conversion-dock__sub">Atendimento por chat ou vídeo</div></div><button class="cj-conversion-dock__btn" type="button">Consultar agora</button>';
      document.body.appendChild(dock);
      var btn=dock.querySelector('button');btn.addEventListener('click',function(ev){if(typeof window.moCliqueAbrir==='function')return window.moCliqueAbrir(ev,'sticky_conversion');var cta=document.querySelector('#heroCTA button,#heroCTA a,.hero__cta button,.hero__cta a');if(cta)cta.click()});
      function syncDock(){var y=window.scrollY||document.documentElement.scrollTop||0;var max=document.documentElement.scrollHeight-window.innerHeight;var nearBottom=max>0&&y>max-520;dock.classList.toggle('is-visible',y>700&&!nearBottom)}
      syncDock();window.addEventListener('scroll',syncDock,{passive:true});window.addEventListener('resize',syncDock,{passive:true});
    }

    syncTrustNumbers();fixPixStatusVisibility();mountAppPromos();setupHowSection();simplifyMobileIntents();mountVisualPolish();setupVideo();mountDock();
    setTimeout(syncTrustNumbers,800);setTimeout(syncTrustNumbers,2200);setTimeout(syncTrustNumbers,4500);setTimeout(fixPixStatusVisibility,250);setTimeout(fixPixStatusVisibility,900);
    var reviewsBadge=document.getElementById('reviewsBadgeTxt');
    if(reviewsBadge&&typeof MutationObserver!=='undefined'){new MutationObserver(function(){var atual=reviewsBadge.innerHTML;if(/5,0 no Google|\+2\.000 atendimentos/.test(atual))syncTrustNumbers()}).observe(reviewsBadge,{childList:true,subtree:true,characterData:true})}
  });
})();