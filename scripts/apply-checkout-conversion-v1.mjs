import fs from 'node:fs';

const path = 'consulta/index.html';
let html = fs.readFileSync(path, 'utf8');

function replaceBetween(start, end, replacement, label) {
  const a = html.indexOf(start);
  if (a < 0) throw new Error(`Start marker not found: ${label}`);
  const b = html.indexOf(end, a + start.length);
  if (b < 0) throw new Error(`End marker not found: ${label}`);
  html = html.slice(0, a) + replacement + '\n\n' + html.slice(b);
}

function replaceOnce(from, to, label) {
  const i = html.indexOf(from);
  if (i < 0) throw new Error(`Marker not found: ${label}`);
  if (html.indexOf(from, i + from.length) >= 0) {
    throw new Error(`Marker is not unique: ${label}`);
  }
  html = html.slice(0, i) + to + html.slice(i + from.length);
}

// Estado compartilhado para preparar o atendimento sem bloquear a ida ao pagamento.
if (!html.includes('var moAtendimentoPreparacaoPromise=null;')) {
  replaceOnce(
    'var moStepAtual=0;\nvar moStepAntesSaida=1,moTentouRecuperarSaida=false;',
    'var moStepAtual=0;\nvar moAtendimentoPreparacaoPromise=null;\nvar moStepAntesSaida=1,moTentouRecuperarSaida=false;',
    'checkout preparation promise'
  );
}

const avancarStep1 = `async function moAvancarStep1(){
  var telEl=document.getElementById('moTel');
  var fb=document.getElementById('moFbTel');
  var tel=telEl.value.replace(/\\D/g,'');
  if(tel.length>11&&tel.startsWith('55')) tel=tel.slice(2);
  if(!tel||tel.length<10){
    telEl.focus();
    telEl.style.borderColor='rgba(255,140,120,.6)';
    if(fb){
      fb.textContent= tel.length===0
        ? 'Digite seu telefone com DDD'
        : 'Número incompleto · faltam '+(10-tel.length)+' dígito'+(10-tel.length===1?'':'s');
      fb.classList.add('show','err');
    }
    return;
  }
  moTelVal=tel;
  if(!moValidarPacienteTerceiro()) return;
  moTrackOnce('tel_valid_'+moGetCheckoutSessionId(), 'telefone_valido', {tipo:moTipoConsulta});

  var btn=document.getElementById('moBtnStep1');
  var autofill=document.getElementById('moAutofill');
  btn.disabled=true;
  btn.textContent='Abrindo pagamento...';

  // Terceiros já precisam dos dados do paciente neste passo. Depois da validação,
  // também seguem imediatamente para o pagamento.
  if(moAtendimentoTerceiro){
    moTrack('patient_lookup_result',{result:'skipped_dependent'});
    fetch(MO_API+'/api/identify',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nome:moNomeVal,tel:moTelVal})
    }).catch(function(){});
    moPostConfiavel('/api/consent',{nome:moNomeVal,tel:moTelVal,versao:'termos-v1.0'});
    moIrPagamento();
    return;
  }

  // FAST PATH: não segura um novo paciente esperando busca cadastral/API.
  // O checkout abre imediatamente; a identificação roda em paralelo e apenas
  // pré-preenche dados se terminar a tempo.
  moTrack('patient_lookup_started_background',{source:'checkout_fast_path'});
  moIrPagamento();

  var ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
  var timeoutId=setTimeout(function(){ if(ctrl) ctrl.abort(); },4000);
  try{
    var res=await fetch(MO_API+'/api/paciente/buscar?tel='+encodeURIComponent(tel),ctrl?{signal:ctrl.signal}:{});
    clearTimeout(timeoutId);
    var data=await res.json();
    if(data.ok&&data.paciente&&data.paciente.nome&&data.paciente.nome.trim().split(/\\s+/).length>=2){
      var p=data.paciente;
      moNomeVal=p.nome;
      moNascVal=p.data_nascimento||'';
      moTrack('patient_lookup_result',{result:'found_background'});
      fetch(MO_API+'/api/identify',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({nome:moNomeVal,tel:moTelVal})
      }).catch(function(){});
      moPostConfiavel('/api/consent',{nome:moNomeVal,tel:moTelVal,versao:'termos-v1.0'});
    }else{
      moTrack('patient_lookup_result',{result:'not_found_background'});
    }
  }catch(e){
    clearTimeout(timeoutId);
    moTrack('patient_lookup_result',{result:'error_background',error_message:moErroSeguro(e.message||'timeout')});
  }
}`;

replaceBetween(
  'async function moAvancarStep1(){',
  'function moConfirmarComNome(){',
  avancarStep1,
  'moAvancarStep1'
);

const irPagamento = `function moPrepararAtendimentoBackground(){
  if(moAtendimentoId) return Promise.resolve(moAtendimentoId);
  if(moAtendimentoPreparacaoPromise) return moAtendimentoPreparacaoPromise;

  moAtendimentoPreparacaoPromise=moFetchComTimeout(MO_API+'/api/notify',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(moPayloadAtendimento())
  },6500)
  .then(function(res){ return res.json(); })
  .then(function(data){
    if(data&&data.ok&&data.atendimentoId){
      moAtendimentoId=data.atendimentoId;
      if(moRetomarAtendimentoPago(data,'preparo_background')) return moAtendimentoId;
      moSalvarCheckoutSessao();
    }
    return moAtendimentoId;
  })
  .catch(function(e){
    console.warn('[MO] preparo background falhou, pagamento fará retry:',e.message);
    return null;
  })
  .finally(function(){ moAtendimentoPreparacaoPromise=null; });

  return moAtendimentoPreparacaoPromise;
}

async function moIrPagamento(){
  var btn=document.getElementById('moBtnStep1');
  btn.disabled=false;
  btn.textContent='Continuar atendimento →';
  btn.onclick=moAvancarStep1;

  // Mostra o pagamento primeiro. Criação do atendimento + elegibilidade rodam em
  // paralelo; os endpoints de cobrança continuam sendo a barreira final de segurança.
  moTrack('lead_pre_pagamento',{
    tipo:moTipoConsulta,
    contexto:moPreContexto||'geral',
    atendimento_id:moAtendimentoId||'',
    fast_path:true
  });
  moMetodo('pix');
  moIrStep(2);

  moPrepararAtendimentoBackground().then(async function(id){
    if(!id||moPagamentoConfirmado) return;
    try{
      var elegibilidadeRes=await moFetchComTimeout(MO_API+'/api/pagamento/elegibilidade/'+id,{},6500);
      var elegibilidade=await elegibilidadeRes.json();
      if(elegibilidadeRes.status===429&&elegibilidade.code==='limite_atendimentos_recentes'){
        var statusEl=document.getElementById('moPixStatus');
        var payBtn=document.getElementById('moBtnPagar');
        var mensagem=elegibilidade.error||'Não foi possível liberar um novo pagamento. Fale com nosso suporte.';
        if(statusEl){
          statusEl.textContent=mensagem;
          statusEl.className='mstatus err';
          statusEl.style.display='block';
        }
        if(payBtn){ payBtn.disabled=true; payBtn.textContent='Pagamento indisponível'; }
        moTrack('payment_eligibility_blocked',{code:elegibilidade.code||'indisponivel',async_check:true});
      }
    }catch(e){
      console.warn('[MO] elegibilidade em background indisponível; backend validará no pagamento');
    }
  });
}`;

replaceBetween(
  'async function moIrPagamento(){',
  'function moMetodo(m){',
  irPagamento,
  'moIrPagamento'
);

// Se o paciente clicar no pagamento antes do preparo em background acabar,
// reutiliza a mesma promessa para evitar criar dois atendimentos.
replaceOnce(
  'async function moGarantirAtendimentoAntesDaTriagem(){\n  if(!moAtendimentoId){',
  `async function moGarantirAtendimentoAntesDaTriagem(){\n  if(!moAtendimentoId&&moAtendimentoPreparacaoPromise){\n    try{ await moAtendimentoPreparacaoPromise; }catch(e){}\n  }\n  if(!moAtendimentoId){`,
  'moGarantirAtendimento background await'
);

// Recomeçar volta para o telefone (chat continua default), sem recolocar o passo
// redundante de escolher chat/vídeo.
replaceOnce(
  "  moAtualizarProdutoCheckout();\n  moIrStep(0);\n}\n\ndocument.addEventListener('DOMContentLoaded'",
  "  moAtualizarProdutoCheckout();\n  moIrStep(1);\n  setTimeout(function(){ var el=document.getElementById('moTel'); if(el) el.focus(); },180);\n}\n\ndocument.addEventListener('DOMContentLoaded'",
  'restart goes to phone'
);

fs.writeFileSync(path, html);
console.log('Checkout conversion v1 applied:', path);
