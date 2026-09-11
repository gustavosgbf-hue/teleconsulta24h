(function(){
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  ready(function(){
    var PLAY_STORE_URL='https://play.google.com/store/apps/details?id=com.consultaja24h.app';
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
      if(reduce){
        video.autoplay=false;
        video.pause();
      }else{
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
      var steps=how.querySelectorAll('.step');
      var data=[
        {title:'1. Inicie a consulta',copy:'Cadastro e pagamento por PIX ou cartão.'},
        {title:'2. Fale com um médico',copy:'Atendimento por chat ou vídeo.'},
        {title:'3. Receba seus documentos',copy:'PDF no chat e receita digital quando indicada.'}
      ];
      steps.forEach(function(step,i){
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
        reviewsBadge.innerHTML=reviewsBadge.innerHTML.replace(/5,0 no Google/g,'4,7 no Google').replace(/\+2\.000 atendimentos/g,'+4.000 atendimentos');
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
      dock.innerHTML='<div class="cj-conversion-dock__copy"><div class="cj-conversion-dock__title">Consulta médica online por R$49,90</div><div class="cj-conversion-dock__sub">Sem mensalidade · chat ou vídeo</div></div><button class="cj-conversion-dock__btn" type="button">Iniciar consulta</button>';
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
        dock.classList.toggle('is-visible',!visible&&window.scrollY>180);
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
      if(document.getElementById('cj-mobile-conversion-v13')) return;
      var style=document.createElement('style');
      style.id='cj-mobile-conversion-v13';
      style.textContent='@media(max-width:720px){'+
        'html body .nav__in{padding:9px 12px!important}'+
        'html body .nav__logo{font-size:.9rem!important}'+
        'html body .nav__cta-link{min-height:38px!important;padding:8px 12px!important;font-size:.72rem!important}'+
        'html body .hero{min-height:auto!important;padding:32px 14px 28px!important;text-align:left!important;align-items:stretch!important}'+
        'html body .cj-hero-bg-video{object-position:61% center!important;filter:brightness(.54) saturate(.5) contrast(1.04)!important}'+
        'html body .hero::before{background:linear-gradient(180deg,rgba(5,12,10,.43) 0%,rgba(5,12,10,.77) 42%,rgba(5,12,10,.96) 100%)!important}'+
        'html body #heroBadge{display:none!important}'+
        'html body .hero h1,html body .hero__title{margin-left:0!important;margin-right:0!important;max-width:355px!important;font-size:clamp(2.02rem,9.5vw,2.72rem)!important;line-height:.99!important;letter-spacing:-.05em!important;text-align:left!important}'+
        'html body .hero__sub{margin-left:0!important;margin-right:0!important;max-width:350px!important;font-size:.91rem!important;line-height:1.47!important;text-align:left!important;color:rgba(244,249,246,.78)!important}'+
        'html body #heroCTA,html body .hero__cta{max-width:none!important;width:100%!important}'+
        'html body .hero__cta-btn,html body .hero__cta button,html body .hero__cta a{width:100%!important;min-height:56px!important;border-radius:14px!important;font-size:.96rem!important;box-shadow:0 15px 34px rgba(0,0,0,.25)!important}'+
        'html body .hero__intent{margin-top:13px!important;width:100%!important}'+
        'html body .hero__intent-title{text-align:left!important;font-size:.69rem!important;margin-bottom:8px!important}'+
        'html body .hero__intent-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}'+
        'html body .hero__intent-btn{min-height:42px!important;padding:8px 7px!important;border-radius:12px!important;font-size:.66rem!important}'+
        'html body .hero__intent-btn--primary::after{display:none!important}'+
        'html body #heroUrgency{display:none!important}'+
        'html body #heroPriceAnchor{margin-top:11px!important}'+
        'html body #heroReviewProof{margin-top:9px!important;font-size:.69rem!important;justify-content:flex-start!important;text-align:left!important}'+
        'html body #heroSecurity{margin-top:8px!important;font-size:.64rem!important;text-align:left!important}'+
        'html body .hero__proof-list{margin-top:9px!important;gap:6px!important}'+
        'html body .hero__proof-row{justify-content:flex-start!important;font-size:.7rem!important}'+
        'html body .doc-card{display:none!important}'+
        'html body .cj-play-hero{display:none!important}'+
        'html body .pain-section,html body .how-section,html body .price-section,html body .reviews-section,html body .faq-section{padding:46px 15px!important}'+
        'html body .section-title{font-size:1.72rem!important;line-height:1.06!important}'+
        'html body .section-sub{font-size:.86rem!important}'+
        'html body .steps{grid-template-columns:1fr!important;gap:9px!important}'+
        'html body .step{grid-template-columns:44px 1fr!important;padding:15px 14px!important;border-radius:16px!important}'+
        'html body .step__num{width:40px!important;height:40px!important;border-radius:12px!important;font-size:.95rem!important}'+
        'html body .step h3{font-size:.9rem!important}'+
        'html body .step p{font-size:.76rem!important}'+
        'html body .cj-conversion-dock{bottom:9px!important;width:calc(100% - 16px)!important;border-radius:15px!important;padding:8px!important}'+
        'html body .cj-conversion-dock__btn{min-height:44px!important;border-radius:11px!important;font-size:.76rem!important}'+
      '}@media(max-width:430px){html body .hero__intent-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
      document.head.appendChild(style);
    }

    mountHeroVideo();
    setupHowSection();
    syncTrustNumbers();
    fixPixStatusVisibility();
    mountMobileConversionPolish();
    mountStickyCTA();
    polishMobileContent();

    setTimeout(fixPixStatusVisibility,800);
    setTimeout(fixPixStatusVisibility,1800);
  });
})();