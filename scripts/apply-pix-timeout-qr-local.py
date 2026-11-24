#!/usr/bin/env python3
"""Checkout /consulta: PIX sem pedido duplicado no timeout, QR local e causas de erro.

1. moGerarPix
   - trava de "um pedido por vez": clique repetido enquanto o PIX está sendo gerado é ignorado;
   - aos 25 s o botão NÃO volta a funcionar: a tela avisa que continua gerando
     (evento pix_lento só no dataLayer; o backend ainda não aceita esse nome);
   - nova tentativa depois de uma falha reaproveita o pedido já criado para o mesmo
     atendimento e só repete o que faltou (ex.: vincular o pedido);
   - pix_error ganha error_kind / error_substage / elapsed_ms; pix_qr_visible ganha elapsed_ms.
2. QR code gerado no navegador (assets/vendor/qrcode-generator.min.js, MIT), sem api.qrserver.com.
   Se a biblioteca não carregar, o PIX copia e cola continua funcionando.
3. card_error ganha error_kind / error_substage / error_code (error_stage original mantido).
4. moPersistirEventoCheckout passa a gravar error_stage, error_kind, error_substage,
   error_code e elapsed_ms no banco (antes só error_message chegava).

Nomes de eventos existentes, fluxo de etapas, renovação, WhatsApp e atribuição: inalterados.
"""
import sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "consulta" / "index.html"

NEW_GERAR_PIX = (
    'var moPixEmAndamento=!1,moPixQrTexto="",moPixOrderAtendimento=null,moPixOrderVinculada=!1;'
    'function moErroEtapa(e,o){var t=new Error(e);return t.etapa=o,t}'
    'function moClassificarErroPix(e){var o=e&&e.name||"",t=String(e&&e.message||"").toLowerCase();'
    'return"AbortError"===o?"timeout":"TypeError"===o||/failed to fetch|networkerror|load failed|network/.test(t)?"rede":'
    '/cpf|tax_id|nome|e-?mail|inv[aá]lid/.test(t)?"preenchimento":/ja esta pago|já está pago/.test(t)?"ja_pago":"tecnico"}'
    'function moCarregarQrLib(){return window.qrcode?Promise.resolve(window.qrcode):(window.__moQrLibP||(window.__moQrLibP=new Promise(function(e,o){'
    'var t=document.createElement("script");t.src="/consulta/assets/vendor/qrcode-generator.min.js?v=1.4.4",t.async=!0,'
    't.onload=function(){window.qrcode?e(window.qrcode):o(new Error("qr_lib_ausente"))},t.onerror=function(){window.__moQrLibP=null,o(new Error("qr_lib_falhou"))},'
    'document.head.appendChild(t)})))}'
    'function moRenderQrLocal(e){var o=document.getElementById("moQrImg");if(!o||!e)return;'
    'moCarregarQrLib().then(function(t){var a=t(0,"M");a.addData(e),a.make();var n=a.getModuleCount(),r=Math.max(2,Math.floor(148/(n+8)));'
    'o.onload=function(){o.style.display="block"},o.src=a.createDataURL(r,4*r)}).catch(function(e){'
    'o.style.display="none",moTrack("pix_qr_local_falhou",{error_message:moErroSeguro(e&&e.message)})})}'
    'async function moGerarPix(){if(moPixEmAndamento)return;'
    'var e=document.getElementById("moBtnPagar"),a=document.getElementById("moPixStatus"),i=Date.now(),l="atendimento",c=!1;'
    'moPixEmAndamento=!0,e.disabled=!0,e.textContent="Gerando PIX...",a.style.display="block",a.className="mstatus",a.textContent="Gerando código PIX...";'
    'var o,t=setTimeout(function(){moPixEmAndamento&&(c=!0,e.textContent="Ainda gerando...",'
    'a.textContent="Está levando mais que o normal. Seu pedido continua valendo, não precisa clicar de novo.",a.className="mstatus",'
    'moTrack("pix_lento",{error_stage:"timeout",error_kind:"lentidao",error_substage:l,elapsed_ms:Date.now()-i}))},25e3);'
    'try{if(!validarCPF(moPagadorCPFVal))return(a=document.getElementById("moPixStatus"))&&(a.textContent="⚠️ CPF inválido. Verifique os números e tente novamente.",'
    'a.className="mstatus err",a.style.display="block"),e.disabled=!1,e.textContent="Gerar Pix de "+moValorFormatado(),clearTimeout(t),moPixEmAndamento=!1,'
    'void moTrack("pix_error",{error_stage:"cpf_validation_late",error_kind:"preenchimento",error_message:"cpf_invalido"});'
    'if(await moGarantirAtendimentoAntesDaTriagem(),moRetomadaPagoEmCurso)return clearTimeout(t),void(moPixEmAndamento=!1);'
    'if(!moAtendimentoId)throw moErroEtapa("Não foi possível abrir seu atendimento. Tente novamente.","atendimento_open");'
    'var m=moPixQrTexto,u=!!(moOrderId&&m&&moPixOrderAtendimento===moAtendimentoId);'
    'if(!u){moPostConfiavel("/api/notify",moPayloadAtendimento({atendimentoId:moAtendimentoId})),l="pagbank_order";'
    'var n=await moFetchComTimeout(MO_API+"/api/pagbank/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({atendimentoId:moAtendimentoId,'
    'nome:moPagadorNomeVal||moNomeParaCadastro(),cpf:moPagadorCPFVal,email:moPagadorEmailVal||void 0,paciente_nome:moNomeParaCadastro(),paciente_cpf:moCPFVal||"",'
    'atendimento_para_terceiro:!!moAtendimentoTerceiro,ads:moAdsAttributionPayload()})},23e3),r=await n.json();'
    'if(!r.ok)throw moErroEtapa(r.error||"Erro ao gerar PIX","pagbank_order");'
    'moOrderId=r.order_id,m=r.qr_code_text||"",moPixQrTexto=m,moPixOrderAtendimento=moAtendimentoId,moPixOrderVinculada=!1}'
    'if(moAtendimentoId&&moOrderId&&!moPixOrderVinculada){l="vincular_order";'
    'var p=await moFetchComTimeout(MO_API+"/api/atendimento/vincular-order",{method:"POST",headers:{"Content-Type":"application/json"},'
    'body:JSON.stringify({atendimentoId:moAtendimentoId,orderId:moOrderId})},8e3),d=await p.json();'
    'if(!d.ok)throw moErroEtapa(d.error||"Não foi possível associar o PIX ao atendimento.","vincular_order");moPixOrderVinculada=!0}'
    'moSalvarCheckoutSessao(),m&&(moRenderQrLocal(m),document.getElementById("moPixChave").value=m),'
    'document.getElementById("moQrWrap").classList.add("show"),e.style.display="none",clearTimeout(t),moPixEmAndamento=!1,'
    'a.textContent="Aguardando confirmação do pagamento...",a.className="mstatus",a.style.display="block",'
    'moTrack("pix_qr_visible",{contexto:moPreContexto||"geral",elapsed_ms:Date.now()-i,reused:u?"1":""}),moMostrarPushRecuperacao(),'
    'o="pix_gerado_"+(moOrderId||Date.now()),sessionStorage.getItem(o)||(sessionStorage.setItem(o,"1"),'
    'moTrack("gerou_pix",{value:moValorCentavos()/100,currency:"BRL"}),console.log("[TRACKING] gerou_pix disparado",o)),moIniciarPolling()}'
    'catch(o){clearTimeout(t),moPixEmAndamento=!1,e.disabled=!1,'
    'e.textContent=moOrderId&&moPixOrderAtendimento===moAtendimentoId?"Tentar novamente":"Gerar Pix de "+moValorFormatado(),'
    'a.textContent="Erro ao gerar PIX: "+(o.message||"Tente novamente."),a.className="mstatus err",a.style.display="block",'
    'moTrack("pix_error",{error_stage:"order_create",error_substage:o.etapa||l,error_kind:moClassificarErroPix(o),'
    'error_message:moErroSeguro(o.message),elapsed_ms:Date.now()-i})}}'
)

REPLACEMENTS = [
    # 2. step-2 CPF click validation: add kind
    ('moTrack("pix_error",{error_stage:"cpf_validation",error_message:"cpf_invalido"})',
     'moTrack("pix_error",{error_stage:"cpf_validation",error_kind:"preenchimento",error_message:"cpf_invalido"})', 1),
    # 3. Stripe form failed to load
    ('moTrack("card_error",{error_stage:"stripe_init",error_message:moErroSeguro(o.message)})',
     'moTrack("card_error",{error_stage:"stripe_init",error_substage:"stripe_load",error_kind:"tecnico",error_message:moErroSeguro(o.message)})', 1),
    # moPagarCartao: tag each failure with its step
    ('throw new Error(e&&e.textContent||"Não foi possível carregar o cartão.")',
     'throw moErroEtapaCartao(e&&e.textContent||"Não foi possível carregar o cartão.","stripe_load","tecnico")', 1),
    ('throw new Error("Pagamento ainda não está pronto.")',
     'throw moErroEtapaCartao("Pagamento ainda não está pronto.","stripe_load","tecnico")', 1),
    ('throw new Error("Informe um e-mail válido para pagar com cartão.")',
     'throw moErroEtapaCartao("Informe um e-mail válido para pagar com cartão.","email","preenchimento")', 1),
    ('if(a&&"error"===a.type)throw new Error(a.error&&a.error.message||"Cartão não aprovado. Verifique os dados e tente novamente.")',
     'if(a&&"error"===a.type)throw moErroEtapaCartao(a.error&&a.error.message||"Cartão não aprovado. Verifique os dados e tente novamente.","stripe_confirm",moClassificarErroStripe(a.error),a.error&&(a.error.code||a.error.type))', 1),
    ('moTrack("card_error",{error_stage:"stripe_confirm",error_message:moErroSeguro(t.message)})',
     'moTrack("card_error",{error_stage:"stripe_confirm",error_substage:t.etapa||"stripe_confirm",error_kind:t.kind||moClassificarErroPix(t),error_code:t.code||"",error_message:moErroSeguro(t.message)})', 1),
    ('async function moPagarCartao(){',
     'function moErroEtapaCartao(e,o,t,a){var n=new Error(e);return n.etapa=o,n.kind=t,n.code=a?String(a).slice(0,60):"",n}'
     'function moClassificarErroStripe(e){var o=String(e&&(e.code||e.type)||"").toLowerCase(),t=String(e&&e.message||"").toLowerCase();'
     'return/incomplete|invalid|missing|validation/.test(o)||/incomplet|inv[aá]lid/.test(t)?"preenchimento":/declin|insufficient|recus|negad|n[aã]o aprovad|card_error/.test(o+" "+t)?"recusa_cartao":"cartao_nao_aprovado"}'
     'async function moPagarCartao(){', 1),
    # 4. persist the diagnostic fields
    ('["result","status","source","reason","error_message"].forEach(',
     '["error_stage","error_kind","error_substage","error_message","error_code","elapsed_ms","result","status","source","reason"].forEach(', 1),
]


def main():
    t = PAGE.read_text(encoding="utf-8")
    if "moPixEmAndamento" in t:
        print("já aplicado"); return 0
    ini = t.find("async function moGerarPix(){")
    fim = t.find("function moIniciarPolling(){", ini)
    assert ini > 0 and fim > ini, "moGerarPix não encontrado"
    antigo = t[ini:fim]
    assert "api.qrserver.com" in antigo and antigo.count("setTimeout(") == 1, "moGerarPix diferente do esperado"
    t = t[:ini] + NEW_GERAR_PIX + t[fim:]
    for a, b, n in REPLACEMENTS:
        c = t.count(a)
        assert c == n, f"esperado {n}x, achei {c}x: {a[:70]}"
        t = t.replace(a, b)
    assert "api.qrserver.com" not in t
    PAGE.write_text(t, encoding="utf-8")
    print("ok:", PAGE.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
