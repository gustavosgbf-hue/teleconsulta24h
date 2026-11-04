/* Served only by Vite middleware when explicitly opening a local QA profile. */
(function(){
  var params=new URLSearchParams(location.search),profile=params.get('__qa_device'),scene=params.get('__qa_case');
  var agents={android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',iphone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'};
  if(agents[profile])Object.defineProperty(navigator,'userAgent',{get:function(){return agents[profile]}});
  var fixture={id:'preview-care-001',status:'encerrado',pagamento_status:scene==='pending'?'pendente':scene==='canceled'?'cancelado':'confirmado',mostrar_avaliacao_google:scene==='rated',tipo:'chat',nome:'Paciente de demonstração'};
  var messages=[{autor:'paciente',texto:'Obrigada pelo atendimento.',criado_em:'2026-09-10T15:30:00Z'},{autor:'medico',texto:'Sua receita está disponível abaixo. Você pode acessar os documentos e o histórico sempre que precisar.',criado_em:'2026-09-10T15:31:00Z'},{autor:'medico',arquivo_tipo:'pdf',arquivo_url:'/tools/documento-demonstracao.pdf',arquivo_nome:'Receita médica.pdf',criado_em:'2026-09-10T15:31:00Z'}];
  var nativeFetch=window.fetch;
  window.fetch=function(input,options){
    var url=String(input&&input.url||input);
    if(!/^https?:/.test(url)&&!url.startsWith('/api/'))return nativeFetch.apply(this,arguments);
    var data={ok:false};
    if(url.includes('/api/atendimento/status/'))data={ok:true,atendimento:fixture};
    else if(url.includes('/api/chat/'))data={ok:true,mensagens:messages};
    else if(url.includes('/api/medicos/online'))data={ok:true,medicos:[]};
    return Promise.resolve(new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}}));
  };
  // These UI controls exercise the real rendering functions, without production calls.
  window.addEventListener('load',function(){
    if(scene==='canceled')mostrarPagamentoCancelado();
    var bar=document.createElement('div');bar.id='qa-state-controls';bar.style.cssText='position:fixed;left:4px;bottom:4px;z-index:99999;font:12px system-ui';
    bar.innerHTML='<button id="qa-cancel">Simular cancelamento</button><button id="qa-revoke">Remover autorização</button>';
    if(location.pathname==='/atendimento/'){
      document.body.appendChild(bar);
      document.getElementById('qa-cancel').onclick=function(){mostrarPagamentoCancelado()};
      document.getElementById('qa-revoke').onclick=function(){mostrarTelaEncerrado(Object.assign({},fixture,{mostrar_avaliacao_google:false}))};
    }
    var printStyle=document.createElement('style');printStyle.textContent='#qa-state-controls{opacity:0}#qa-state-controls:focus-within,#qa-state-controls:hover{opacity:1}';document.head.appendChild(printStyle);
  });
})();
