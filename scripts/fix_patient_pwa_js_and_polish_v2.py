from pathlib import Path

p = Path('atendimento/index.html')
s = p.read_text(encoding='utf-8')

# Corrige apenas o bloco PWA/push adicionado anteriormente, que ficou com \\n literais.
marker = '\\n// CJ24H-PWA-PUSH-V1\\n'
if marker in s:
    start = s.index(marker)
    end = s.index('</script>', start)
    body = s[start:end].replace('\\n', '\n')
    s = s[:start] + body + s[end:]

# Limpeza textual de feedbacks mais visíveis, sem alterar lógica nem condições.
repls = {
    "'⏳ Aguardando confirmação do pagamento…'": "'Aguardando confirmação do pagamento…'",
    "'⏳ Verificando pagamento...'": "'Verificando pagamento...'",
    "'✅ Pagamento confirmado!'": "'Pagamento confirmado'",
    "'⚠️ Erro ao verificar. Tente novamente.'": "'Não foi possível verificar. Tente novamente.'",
    "'✓ Já paguei, verificar novamente'": "'Já paguei, verificar novamente'",
    "'✓ Copiado!'": "'Copiado'",
}
for a, b in repls.items():
    s = s.replace(a, b)

if 'CJ24H-PATIENT-SMOOTH-V2' not in s:
    css = r'''
/* CJ24H-PATIENT-SMOOTH-V2 */
.cj-continuity.show{animation:cjPatientSoftIn .28s cubic-bezier(.2,.78,.28,1) both}
.chat-consulta,.meet-wrap,.enc-content{animation:cjPatientSoftIn .26s cubic-bezier(.2,.78,.28,1) both}
.chat-msgs>div:not(.typing-indicator){animation:cjMsgIn .18s ease-out both}
.cj-mini-btn,.chat-send,.chat-clip-btn,.cta,.cta-ghost{transition:transform .16s ease,opacity .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease}
.cj-mini-btn:active,.chat-send:active,.chat-clip-btn:active,.cta:active,.cta-ghost:active{transform:scale(.985)}
@keyframes cjPatientSoftIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@keyframes cjMsgIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.cj-chat-skeleton{display:flex;flex-direction:column;gap:9px;padding:14px 12px;opacity:.7}
.cj-chat-skeleton span{height:34px;border-radius:12px;background:rgba(255,255,255,.045);position:relative;overflow:hidden}.cj-chat-skeleton span:nth-child(2){width:72%;align-self:flex-end}.cj-chat-skeleton span:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.055),transparent);animation:cjPatientShimmer 1.1s infinite}
@keyframes cjPatientShimmer{to{transform:translateX(100%)}}
@media(prefers-reduced-motion:reduce){.cj-continuity.show,.chat-consulta,.meet-wrap,.enc-content,.chat-msgs>div,.cj-chat-skeleton span:after{animation:none!important}.cj-mini-btn,.chat-send,.chat-clip-btn,.cta,.cta-ghost{transition:none!important}}
'''
    s = s.replace('</style>', css + '\n</style>', 1)

# Skeleton curtíssimo ao entrar no chat, removido automaticamente. Não interfere no polling nem nas mensagens.
if 'CJ24H-PATIENT-SKELETON-V2' not in s:
    js = r'''
<script>
// CJ24H-PATIENT-SKELETON-V2
(function(){
  function show(){
    var box=document.getElementById('chatMsgs');
    if(!box||document.getElementById('cjChatSkeleton'))return;
    var sk=document.createElement('div');sk.id='cjChatSkeleton';sk.className='cj-chat-skeleton';sk.innerHTML='<span></span><span></span><span></span>';box.insertBefore(sk,box.firstChild);
    setTimeout(function(){sk.style.transition='opacity .18s ease';sk.style.opacity='0';setTimeout(function(){sk.remove()},190)},430);
  }
  var tries=0,t=setInterval(function(){tries++;var chat=document.getElementById('chatConsulta');if(chat&&getComputedStyle(chat).display!=='none'){show();clearInterval(t)}else if(tries>24)clearInterval(t)},250);
})();
</script>
'''
    s = s.replace('</body>', js + '\n</body>', 1)

p.write_text(s, encoding='utf-8')
print('patient pwa js fixed and polished')
