(function(){
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }
  ready(function(){
    var PLAY_STORE_URL='https://play.google.com/store/apps/details?id=com.consultaja24h.app';
    function isAndroid(){return /android/i.test(navigator.userAgent||'')}
    function trackAppDownload(source){
      try{
        window.dataLayer=window.dataLayer||[];
        window.dataLayer.push({event:'app_download_click',app_store:'google_play',source:source||'landing'});
      }catch(e){}
    }
    function playBadge(){
      return '<img src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png" alt="Disponível no Google Play" loading="lazy">';
    }
    function mountAndroidAppPromos(){
      if(!isAndroid())return;
      var priceAnchor=document.getElementById('heroPriceAnchor');
      if(priceAnchor&&!document.querySelector('.cj-play-hero')){
        var heroApp=document.createElement('div');
        heroApp.className='cj-play-hero';
        heroApp.innerHTML='<a class="cj-play-hero__link" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play"><span class="cj-play-hero__new">NOVO</span><span class="cj-play-hero__copy"><strong>Prefere usar o aplicativo?</strong><small>Baixe na Google Play e tenha acesso mais rápido.</small></span><span class="cj-play-hero__arrow">›</span></a>';
        heroApp.querySelector('a').addEventListener('click',function(){trackAppDownload('landing_hero')});
        priceAnchor.parentNode.insertBefore(heroApp,priceAnchor.nextSibling);
      }
      var finalCta=document.querySelector('.cta-final');
      if(finalCta&&!document.querySelector('.cj-app-callout')){
        var appSection=document.createElement('section');
        appSection.className='cj-app-callout reveal visible';
        appSection.setAttribute('aria-labelledby','cjAppCalloutTitle');
        appSection.innerHTML='<div class="cj-app-callout__inner"><div class="cj-app-callout__icon"><img src="/icon-192.png" alt="" loading="lazy"></div><div class="cj-app-callout__copy"><div class="cj-app-callout__eyebrow">NOVO · APLICATIVO PARA ANDROID</div><h2 id="cjAppCalloutTitle">Leve a ConsultaJá24h com você.</h2><p>Acompanhe atendimentos, acesse seus documentos e volte mais rápido quando precisar.</p></div><a class="cj-app-callout__play" href="'+PLAY_STORE_URL+'" target="_blank" rel="noopener" aria-label="Baixar ConsultaJá24h na Google Play">'+playBadge()+'</a></div>';
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

    syncTrustNumbers();
    fixPixStatusVisibility();
    mountAndroidAppPromos();
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
