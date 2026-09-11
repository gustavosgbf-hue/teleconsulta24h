(function(){
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  ready(function(){
    var HERO_VIDEO_URL='https://pub-93eb63c110d047c681aab7a5b30d2c2b.r2.dev/hero-app.mp4';

    function track(name,data){
      try{
        window.dataLayer=window.dataLayer||[];
        window.dataLayer.push(Object.assign({event:name},data||{}));
      }catch(e){}
    }

    function mountHeroVideo(){
      var hero=document.querySelector('.hero');
      if(!hero||hero.querySelector('.cj-hero-bg-video')) return;
      var video=document.createElement('video');
      video.className='cj-hero-bg-video';
      video.autoplay=true;
      video.muted=true;
      video.loop=true;
      video.playsInline=true;
      video.preload='metadata';
      video.setAttribute('aria-hidden','true');
      video.setAttribute('tabindex','-1');
      video.src=HERO_VIDEO_URL;
      hero.insertBefore(video,hero.firstChild);
      var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduce){ video.autoplay=false; video.pause(); }
      else {
        var p=video.play();
        if(p&&typeof p.catch==='function') p.catch(function(){});
      }
    }

    function setupHowSection(){
      var how=document.querySelector('.how-section');
      if(!how) return;
      var label=how.querySelector('.section-label');
      var title=how.querySelector('.section-title');
      var sub=how.querySelector('.section-sub');
      if(label) label.textContent='SIMPLES, SEGURO E SEM BUROCRACIA';
      if(title) title.textContent='Como funciona';
      if(sub) sub.textContent='Chat ou vídeo. R$49,90 por consulta. Sem mensalidade.';
      var data=[
        {title:'1. Inicie a consulta',copy:'Cadastro e pagamento por PIX ou cartão.'},
        {title:'2. Fale com um médico',copy:'Atendimento por chat ou vídeo.'},
        {title:'3. Receba seus documentos',copy:'PDF no chat e receita digital quando indicada.'}
      ];
      how.querySelectorAll('.step').forEach(function(step,i){
        if(!data[i]) return;
        var h=step.querySelector('h3');
        var p=step.querySelector('p');
        if(h) h.textContent=data[i].title;
        if(p) p.textContent=data[i].copy;
      });
    }

    function syncTrustNumbers(){
      var heroBadge=document.getElementById('heroBadge');
      if(heroBadge) heroBadge.textContent='★★★★★ 4,7 · +4.000 atendimentos';
      var heroProof=document.querySelector('#heroReviewProof span');
      if(heroProof) heroProof.innerHTML='4,7 no Google · <strong>Ver avaliações</strong> · +4.000 atendimentos';
      var reviewsBadge=document.getElementById('reviewsBadgeTxt');
      if(reviewsBadge){
        reviewsBadge.innerHTML=reviewsBadge.innerHTML
          .replace(/5,0 no Google/g,'4,7 no Google')
          .replace(/\+2\.000 atendimentos/g,'+4.000 atendimentos');
      }
    }

    function observeTrustNumbers(){
      syncTrustNumbers();
      setTimeout(syncTrustNumbers,600);
      setTimeout(syncTrustNumbers,1600);
      setTimeout(syncTrustNumbers,3500);
      var badge=document.getElementById('reviewsBadgeTxt');
      if(badge&&typeof MutationObserver!=='undefined'){
        new MutationObserver(syncTrustNumbers).observe(badge,{childList:true,subtree:true,characterData:true});
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

    function mountStickyCTA(){
      if(document.querySelector('.cj-conversion-dock')) return;
      var heroCTA=document.getElementById('heroCTA');
      if(!heroCTA) return;
      var dock=document.createElement('div');
      dock.className='cj-conversion-dock';
      dock.innerHTML='<div class="cj-conversion-dock__copy"><div class="cj-conversion-dock__title">Consulta online · R$49,90</div><div class="cj-conversion-dock__sub">Sem mensalidade</div></div><button class="cj-conversion-dock__btn" type="button">Iniciar consulta</button>';
      document.body.appendChild(dock);
      dock.querySelector('button').addEventListener('click',function(){
        track('sticky_consulta_click',{source:'consulta_sticky'});
        if(typeof window.moCliqueAbrir==='function') window.moCliqueAbrir(null,'sticky');
        else if(typeof window.moAbrir==='function') window.moAbrir('sticky');
        else heroCTA.scrollIntoView({behavior:'smooth',block:'center'});
      });
      function sync(){
        var r=heroCTA.getBoundingClientRect();
        var visible=r.bottom>0&&r.top<window.innerHeight;
        dock.classList.toggle('is-visible',!visible&&window.scrollY>260);
      }
      sync();
      window.addEventListener('scroll',sync,{passive:true});
      window.addEventListener('resize',sync,{passive:true});
    }

    function polishMobileContent(){
      if(!window.matchMedia||!window.matchMedia('(max-width:720px)').matches) return;
      var sub=document.getElementById('heroSub');
      if(sub) sub.textContent='Atendimento por chat ou vídeo, com pagamento único. Sem mensalidade.';
      var intentTitle=document.querySelector('.hero__intent-title');
      if(intentTitle) intentTitle.textContent='O que você precisa hoje?';
      var security=document.getElementById('heroSecurity');
      if(security) security.textContent='Médicos com CRM ativo · documentos após avaliação médica.';
    }

    function mountMobileConversionPolish(){
      if(document.getElementById('cj-mobile-conversion-v14')) return;
      var style=document.createElement('style');
      style.id='cj-mobile-conversion-v14';
      style.textContent='@media(max-width:720px){'+
        'html body .nav{min-height:auto!important}'+
        'html body .nav__in{min-height:62px!important;padding:9px 14px!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important}'+
        'html body .nav__brand{min-width:0!important}'+
        'html body .nav__logo{font-size:.88rem!important}'+
        'html body .nav__actions{margin-left:auto!important}'+
        'html body .nav__cta-link{min-height:40px!important;padding:9px 13px!important;border-radius:12px!important;font-size:.72rem!important;background:#f6f8f7!important;color:#10231a!important;box-shadow:none!important}'+
        'html body .hero{min-height:auto!important;padding:30px 18px 30px!important;text-align:left!important;align-items:stretch!important}'+
        'html body .cj-hero-bg-video{object-position:59% center!important;filter:brightness(.50) saturate(.48) contrast(1.04)!important}'+
        'html body .hero::before{background:linear-gradient(180deg,rgba(4,10,8,.40) 0%,rgba(4,10,8,.76) 42%,rgba(4,10,8,.96) 100%)!important}'+
        'html body #heroBadge{display:none!important}'+
        'html body .hero h1,html body .hero__title{margin:0!important;max-width:360px!important;font-size:clamp(2rem,9.2vw,2.62rem)!important;line-height:.99!important;letter-spacing:-.048em!important;text-align:left!important}'+
        'html body .hero__sub{margin-left:0!important;margin-right:0!important;max-width:355px!important;font-size:.9rem!important;line-height:1.48!important;text-align:left!important;color:rgba(244,249,246,.78)!important}'+
        'html body #heroCTA,html body .hero__cta{max-width:none!important;width:100%!important}'+
        'html body #heroCTA,html body .hero__cta-btn,html body .hero__cta button,html body .hero__cta a{width:100%!important;min-height:56px!important;border-radius:15px!important;background:#f5f8f6!important;color:#10231a!important;border:1px solid rgba(255,255,255,.55)!important;box-shadow:0 14px 32px rgba(0,0,0,.24)!important;font-size:.96rem!important;font-weight:850!important}'+
        'html body #heroCTA svg,html body .hero__cta svg{color:#176b4f!important;stroke:#176b4f!important}'+
        'html body .hero__intent{margin-top:14px!important;width:100%!important}'+
        'html body .hero__intent-title{text-align:left!important;font-size:.69rem!important;margin-bottom:8px!important;color:rgba(248,251,249,.68)!important}'+
        'html body .hero__intent-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}'+
        'html body .hero__intent-btn{min-height:43px!important;padding:8px 7px!important;border-radius:12px!important;font-size:.66rem!important;background:rgba(5,14,11,.46)!important;border-color:rgba(255,255,255,.12)!important;color:#eaf1ed!important}'+
        'html body .hero__intent-btn--primary{background:rgba(143,213,181,.10)!important;border-color:rgba(143,213,181,.22)!important;color:#eef7f2!important}'+
        'html body .hero__intent-btn--primary::after{display:none!important}'+
        'html body #heroUrgency{display:none!important}'+
        'html body #heroPriceAnchor{margin-top:10px!important}'+
        'html body #heroReviewProof{margin-top:10px!important;font-size:.68rem!important;justify-content:flex-start!important;text-align:left!important;color:rgba(242,248,245,.7)!important}'+
        'html body #heroSecurity{margin-top:7px!important;font-size:.62rem!important;line-height:1.35!important;text-align:left!important;color:rgba(238,246,242,.52)!important}'+
        'html body .hero__proof-list{margin-top:9px!important;gap:6px!important}'+
        'html body .hero__proof-row{justify-content:flex-start!important;font-size:.68rem!important}'+
        'html body .doc-card,html body .cj-play-hero{display:none!important}'+
        'html body .reviews-section{padding:42px 0 36px!important;background:#f3f6f4!important}'+
        'html body .reviews-section .section-label{color:#176b4f!important}'+
        'html body .reviews-section .section-title{font-size:1.8rem!important;line-height:1.04!important;padding:0 16px!important}'+
        'html body #reviewsBadge{background:#e7f0eb!important;border-color:#c6ddd2!important;color:#176b4f!important;margin-top:10px!important}'+
        'html body #reviewsBadgeTxt{color:#176b4f!important;font-size:.7rem!important}'+
        'html body .reviews-section .car-outer{margin-top:18px!important}'+
        'html body .reviews-section .car-vp{overflow-x:auto!important;scroll-snap-type:x mandatory!important;padding:0 16px 4px!important;margin:0!important;scrollbar-width:none!important}'+
        'html body .reviews-section .car-vp::-webkit-scrollbar{display:none!important}'+
        'html body .reviews-section .car-tk{display:flex!important;gap:10px!important;width:max-content!important;transform:none!important}'+
        'html body .reviews-section .rcard{flex:0 0 min(82vw,304px)!important;min-height:0!important;padding:17px 16px!important;border-radius:18px!important;background:#fff!important;border:1px solid rgba(21,33,29,.08)!important;box-shadow:0 10px 24px rgba(22,45,36,.06)!important;scroll-snap-align:start!important}'+
        'html body .reviews-section .rcard__name{color:#15211d!important}'+
        'html body .reviews-section .rcard__quote{color:#596961!important;font-size:.78rem!important;line-height:1.5!important}'+
        'html body .reviews-section .rcard p[style*="rgba(255,255,255,.22)"]{color:#89958f!important}'+
        'html body .doctor-strip{padding:26px 0 18px!important;background:#f7f9f7!important;border-top:1px solid rgba(21,33,29,.08)!important}'+
        'html body .doctor-strip__header{padding:0 16px!important;text-align:left!important}'+
        'html body .doctor-strip__eyebrow{color:#176b4f!important}'+
        'html body .doctor-strip__sub{color:#6a7771!important}'+
        'html body .doctor-strip__track{padding:4px 16px 12px!important;gap:10px!important;overflow-x:auto!important;flex-wrap:nowrap!important;justify-content:flex-start!important;scroll-snap-type:x proximity!important}'+
        'html body .doctor-strip__track .dstrip-card{width:136px!important;min-height:178px!important;padding:14px 10px 12px!important;border-radius:16px!important;background:#fff!important;border:1px solid rgba(21,33,29,.09)!important;box-shadow:0 10px 24px rgba(22,45,36,.06)!important;scroll-snap-align:start!important}'+
        'html body .doctor-strip__track .dstrip-card div[style*="color:rgba(255,255,255,.9)"]{color:#15211d!important}'+
        'html body .doctor-strip__track .dstrip-card div[style*="color:rgba(255,255,255,.4)"]{color:#7b8982!important}'+
        'html body .doctor-strip__track .dstrip-card div[style*="color:rgba(180,224,90,.65)"]{color:#176b4f!important}'+
        'html body .doctor-strip__track .dstrip-av.has-photo{box-shadow:0 8px 18px rgba(22,45,36,.16),0 0 0 3px rgba(23,107,79,.22),0 0 0 7px rgba(23,107,79,.05)!important}'+
        'html body .doctor-strip__more-link{margin-left:16px!important;color:#176b4f!important}'+
        'html body .pain-section,html body .how-section,html body .price-section,html body .faq-section{padding:46px 15px!important}'+
        'html body .section-title{font-size:1.72rem!important;line-height:1.06!important}'+
        'html body .section-sub{font-size:.86rem!important}'+
        'html body .steps{grid-template-columns:1fr!important;gap:9px!important}'+
        'html body .step{grid-template-columns:44px 1fr!important;padding:15px 14px!important;border-radius:16px!important}'+
        'html body .step__num{width:40px!important;height:40px!important;border-radius:12px!important;background:#176b4f!important;color:#fff!important;font-size:.95rem!important}'+
        'html body .step h3{font-size:.9rem!important}'+
        'html body .step p{font-size:.76rem!important}'+
        'html body .cj-conversion-dock{bottom:8px!important;width:calc(100% - 16px)!important;min-height:58px!important;border-radius:16px!important;padding:7px 7px 7px 11px!important;background:rgba(247,250,248,.97)!important;border:1px solid rgba(21,33,29,.10)!important;box-shadow:0 12px 32px rgba(0,0,0,.18)!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:center!important}'+
        'html body .cj-conversion-dock__title{font-size:.72rem!important;color:#15211d!important}'+
        'html body .cj-conversion-dock__sub{font-size:.61rem!important;color:#728078!important}'+
        'html body .cj-conversion-dock__btn{min-height:43px!important;padding:0 13px!important;border-radius:11px!important;background:#176b4f!important;color:#fff!important;font-size:.72rem!important;box-shadow:none!important}'+
        'html body .whatsapp-float.visible{bottom:78px!important}'+
      '}@media(max-width:430px){html body .hero__intent-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
      document.head.appendChild(style);
    }

    mountHeroVideo();
    setupHowSection();
    observeTrustNumbers();
    fixPixStatusVisibility();
    mountMobileConversionPolish();
    mountStickyCTA();
    polishMobileContent();

    setTimeout(fixPixStatusVisibility,800);
    setTimeout(fixPixStatusVisibility,1800);
  });
})();
