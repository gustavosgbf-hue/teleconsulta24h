(function(){
  var track=document.getElementById('reviewsMiniTrack'), viewport=document.querySelector('.reviews-mini__viewport');
  var cards=track?[].slice.call(track.children):[], pips=[].slice.call(document.querySelectorAll('.reviews-mini__pips button'));
  var idx=0;
  function go(i){if(!viewport||!cards.length)return;idx=(i+cards.length)%cards.length;var c=cards[idx];viewport.scrollTo({left:c.offsetLeft-Math.max(0,(viewport.clientWidth-c.clientWidth)/2),behavior:'smooth'});pips.forEach(function(p,n){p.classList.toggle('is-on',n===idx)})}
  var prev=document.getElementById('reviewsMiniPrev'),next=document.getElementById('reviewsMiniNext');
  if(prev)prev.addEventListener('click',function(){go(idx-1)});if(next)next.addEventListener('click',function(){go(idx+1)});pips.forEach(function(p,i){p.addEventListener('click',function(){go(i)})});
  var video=document.getElementById('journeyDemoVideo'),sound=document.getElementById('journeyDemoSound');
  if(video&&sound){video.muted=true;sound.addEventListener('click',function(){var on=video.muted;video.muted=!on;if(on){video.volume=1;video.play().catch(function(){})}sound.classList.toggle('is-on',on);sound.setAttribute('aria-pressed',String(on));sound.setAttribute('aria-label',on?'Desativar áudio':'Ativar áudio');var t=sound.querySelector('span');if(t)t.textContent=on?'Som ligado':'Ouvir'})}
})();