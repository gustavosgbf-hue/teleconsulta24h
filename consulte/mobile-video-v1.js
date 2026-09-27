(function(){
  var MOBILE_VIDEO='https://pub-93eb63c110d047c681aab7a5b30d2c2b.r2.dev/hero-appp.mp4';

  function apply(){
    if(!window.matchMedia || !window.matchMedia('(max-width:720px)').matches) return;
    var video=document.querySelector('.cj-hero-bg-video');
    if(!video) return;
    if(video.dataset.mobilePortrait==='1') return;
    video.dataset.mobilePortrait='1';
    video.src=MOBILE_VIDEO;
    video.load();
    var p=video.play();
    if(p&&typeof p.catch==='function') p.catch(function(){});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,0)},{once:true});
  else setTimeout(apply,0);
  window.addEventListener('load',apply,{once:true});
})();
