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

    function mountAppPromo(){
      var priceAnchor=document.getElementById('heroPriceAnchor');
      if(!priceAnchor||document.querySelector('.cj-play-hero')) return;
      var wrap=document.createElement('div');
      wrap.className='cj-play-hero';
      wrap.innerHTML='<a class="cj-play-hero__link" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener"><img class="cj-play-hero__appicon" src="/icon-192.png" alt="" width="40" height="40"><span class="cj-play-hero__copy"><strong>Prefere usar pelo app?</strong><small>Baixe na Google Play. No navegador, você continua normalmente.</small></span></a>';
      var a=wrap.querySelector('a');
      a.addEventListener('click',function(){track('app_download_click',{source:'consulta_hero'})});
      priceAnchor.parentNode.insertBefore(wrap,priceAnchor.nextSibling);
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

    function polishMobile(){
      if(!window.matchMedia||!window.matchMedia('(max-width:720px)').matches) return;
      var sub=document.getElementById('heroSub');
      if(sub) sub.textContent='Atendimento por chat ou vídeo, com pagamento único. Sem mensalidade.';
      var intentTitle=document.querySelector('.hero__intent-title');
      if(intentTitle) intentTitle.textContent='O que você precisa hoje?';
      var security=document.getElementById('heroSecurity');
      if(security) security.textContent='Médicos com CRM ativo · documentos após avaliação médica.';
    }

    mountHeroVideo();
    setupHowSection();
    syncTrustNumbers();
    fixPixStatusVisibility();
    mountAppPromo();
    mountStickyCTA();
    polishMobile();

    setTimeout(fixPixStatusVisibility,800);
    setTimeout(fixPixStatusVisibility,1800);
  });
})();
