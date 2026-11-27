/* Validade do identificador de clique guardado no navegador.
 * O clique de anúncio só acompanha novos pagamentos por até 90 dias (maior janela do Google).
 * A origem histórica fica preservada em cj_ads_origem e não é apagada.
 * A janela real (configurada no Google Ads) é aplicada no servidor. */
(function(){
  var CHAVES=['gclid','gbraid','wbraid','msclkid','fbclid'],MAX=90*864e5,agora=Date.now();
  function ler(st,k){try{return JSON.parse(st.getItem(k)||'null')}catch(e){return null}}
  function gravar(k,v){try{var s=JSON.stringify(v);localStorage.setItem(k,s);sessionStorage.setItem(k,s)}catch(e){}}
  try{
    var url=new URLSearchParams(location.search),novo=CHAVES.some(function(k){return url.get(k)});
    var params=ler(sessionStorage,'cj_ads_params')||ler(localStorage,'cj_ads_params')||{};
    var temClique=CHAVES.some(function(k){return params[k]});
    if(novo){localStorage.setItem('cj_ads_click_at',String(agora));return}
    if(!temClique)return;
    var em=Number(localStorage.getItem('cj_ads_click_at')||0);
    if(!em){localStorage.setItem('cj_ads_click_at',String(agora));return}
    if(agora-em<=MAX)return;
    var origem=ler(localStorage,'cj_ads_origem')||{};
    CHAVES.forEach(function(k){if(params[k]){if(!origem[k])origem[k]=params[k];delete params[k]}});
    if(!origem.click_at)origem.click_at=new Date(em).toISOString();
    gravar('cj_ads_origem',origem);gravar('cj_ads_params',params);
    localStorage.removeItem('cj_ads_click_at');
  }catch(e){}
})();
