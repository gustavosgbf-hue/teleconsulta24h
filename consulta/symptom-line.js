(function(){
  var section=document.querySelector('.journey-section');
  if(!section)return;
  var fill=section.querySelector('.symptom-line__fill');
  var steps=[].slice.call(section.querySelectorAll('.journey-step'));
  function update(){
    var r=section.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var start=vh*.68;
    var end=Math.max(1,r.height-vh*.40);
    var passed=start-r.top;
    var p=Math.max(0,Math.min(1,passed/end));
    if(fill)fill.style.height=(p*100).toFixed(2)+'%';
    steps.forEach(function(step,i){
      var sr=step.getBoundingClientRect();
      var active=sr.top<vh*.68 && sr.bottom>vh*.18;
      step.classList.toggle('is-active',active);
    });
  }
  var ticking=false;
  function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){update();ticking=false})}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);update();
})();