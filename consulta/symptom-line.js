(function(){
  var section=document.querySelector('.journey-section');
  if(!section)return;
  var track=section.querySelector('.journey-steps');
  var fill=section.querySelector('.symptom-line__fill');
  var steps=[].slice.call(section.querySelectorAll('.journey-step'));
  if(!track||!fill||!steps.length)return;

  function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
  function update(){
    var tr=track.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var viewportMarker=vh*.58;
    var usable=Math.max(1,tr.height-76);
    var passed=viewportMarker-(tr.top+38);
    var p=clamp(passed/usable,0,1);
    fill.style.height=(p*100).toFixed(2)+'%';

    steps.forEach(function(step){
      var sr=step.getBoundingClientRect();
      var center=sr.top+sr.height*.38;
      var active=center<vh*.70 && sr.bottom>vh*.18;
      step.classList.toggle('is-active',active);
    });
  }

  var ticking=false;
  function onScroll(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(function(){update();ticking=false});
  }

  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  update();
})();