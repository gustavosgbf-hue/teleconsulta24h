(function(){
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }
  ready(function(){
    var hero=document.querySelector('.hero');
    if(hero && !document.querySelector('.cj-social-proof')){
      var proof=document.createElement('a');
      proof.className='cj-social-proof';
      proof.href='https://www.instagram.com/consultaja24h';
      proof.target='_blank';
      proof.rel='noopener';
      proof.setAttribute('aria-label','Ver prova social da ConsultaJá24h no Instagram');
      proof.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><span>Avaliações, bastidores e prova social no Instagram</span>';
      hero.appendChild(proof);
    }

    if(!document.querySelector('.cj-conversion-dock')){
      var dock=document.createElement('div');
      dock.className='cj-conversion-dock';
      dock.setAttribute('role','region');
      dock.setAttribute('aria-label','Iniciar consulta online');
      dock.innerHTML='<div class="cj-conversion-dock__copy"><div class="cj-conversion-dock__title">Médico online agora</div><div class="cj-conversion-dock__sub">Atendimento sem app e sem burocracia</div></div><button class="cj-conversion-dock__btn" type="button">Consultar agora</button>';
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
