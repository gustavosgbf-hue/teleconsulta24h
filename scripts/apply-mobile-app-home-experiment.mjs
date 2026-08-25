import fs from 'node:fs';

const path = 'index.html';
let src = fs.readFileSync(path, 'utf8');

if (src.includes('id="mobileAppHomeExperiment"')) {
  console.log('Mobile home experiment already applied');
  process.exit(0);
}

const heroMatch = src.match(/<section class="hero"[^>]*>/);
if (!heroMatch) throw new Error('Hero section not found');

const block = `
<div class="mobile-app-home" id="mobileAppHomeExperiment">
  <div class="mobile-app-home__status"><span class="mobile-app-home__dot"></span>MÉDICO ONLINE AGORA</div>
  <h1 class="mobile-app-home__title">O que você precisa hoje?</h1>
  <p class="mobile-app-home__lead">Escolha como podemos ajudar.</p>

  <a class="mobile-app-home__primary" href="/consulta">
    <div class="mobile-app-home__primary-top">
      <span class="mobile-app-home__primary-kicker">CONSULTA IMEDIATA</span>
      <span class="mobile-app-home__arrow">›</span>
    </div>
    <strong>Consulta médica agora</strong>
    <span>Por chat, direto pelo celular. Sem precisar agendar.</span>
    <b>Falar com um médico agora</b>
  </a>

  <div class="mobile-app-home__grid">
    <a class="mobile-app-home__service mobile-app-home__service--featured" href="/renovacao-de-receita">
      <span class="mobile-app-home__service-icon">Rx</span>
      <strong>Renovar receita</strong>
      <small>Solicite online</small>
    </a>
    <a class="mobile-app-home__service" href="/especialistas">
      <span class="mobile-app-home__service-icon">+</span>
      <strong>Especialistas</strong>
      <small>Escolha o profissional</small>
    </a>
  </div>

  <a class="mobile-app-home__psych" href="/psicologo-online">
    <span class="mobile-app-home__psych-badge">PSI</span>
    <span><strong>Psicologia</strong><small>Psicoterapia online com horário marcado</small></span>
    <span class="mobile-app-home__arrow">›</span>
  </a>

  <div class="mobile-app-home__proof">
    <strong>★★★★★ 5,0</strong>
    <span>+2.000 atendimentos</span>
    <span>Médicos com CRM ativo</span>
  </div>
</div>`;

src = src.replace(heroMatch[0], heroMatch[0] + block);

const css = `
<style id="mobileAppHomeExperimentStyles">
.mobile-app-home{display:none}
@media(max-width:600px){
  .hero{padding:22px 16px 34px!important;display:block!important;text-align:left!important;overflow:visible!important}
  .hero > *:not(.mobile-app-home):not(script){display:none!important}
  .mobile-app-home{display:block;width:100%;max-width:430px;margin:0 auto}
  .mobile-app-home__status{display:flex;align-items:center;gap:7px;color:#77e6a2;font-size:.66rem;font-weight:800;letter-spacing:.09em;margin:3px 2px 12px}
  .mobile-app-home__dot{width:7px;height:7px;border-radius:50%;background:#43df7e;box-shadow:0 0 0 4px rgba(67,223,126,.11)}
  .mobile-app-home__title{font-family:'Outfit',sans-serif;font-size:2rem;line-height:1.04;letter-spacing:-.045em;color:#f7fbf8;margin:0;font-weight:800}
  .mobile-app-home__lead{color:rgba(255,255,255,.55);font-size:.88rem;margin:8px 0 20px}
  .mobile-app-home a{text-decoration:none}
  .mobile-app-home__primary{display:block;padding:20px;border-radius:24px;background:linear-gradient(145deg,rgba(18,47,37,.98),rgba(7,18,15,.98));border:1px solid rgba(120,242,95,.28);box-shadow:0 18px 50px rgba(0,0,0,.3),0 0 0 1px rgba(255,255,255,.025) inset}
  .mobile-app-home__primary-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}
  .mobile-app-home__primary-kicker{font-size:.58rem;font-weight:900;letter-spacing:.12em;color:#78f25f}
  .mobile-app-home__arrow{font-size:1.55rem;color:rgba(255,255,255,.42);line-height:1}
  .mobile-app-home__primary strong{display:block;color:#fff;font-size:1.28rem;letter-spacing:-.025em;margin-bottom:6px}
  .mobile-app-home__primary span:not(.mobile-app-home__primary-kicker):not(.mobile-app-home__arrow){display:block;color:rgba(255,255,255,.6);font-size:.82rem;line-height:1.45}
  .mobile-app-home__primary b{display:flex;align-items:center;justify-content:center;margin-top:17px;min-height:48px;padding:0 16px;border-radius:16px;background:linear-gradient(145deg,#9bea45,#43df7e);color:#07100f;font-size:.87rem;font-weight:900;box-shadow:0 12px 28px rgba(67,223,126,.2)}
  .mobile-app-home__grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
  .mobile-app-home__service{min-height:116px;padding:15px;border-radius:20px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.095);display:flex;flex-direction:column;justify-content:flex-end}
  .mobile-app-home__service--featured{background:linear-gradient(145deg,rgba(155,234,69,.095),rgba(67,223,126,.04));border-color:rgba(155,234,69,.19)}
  .mobile-app-home__service-icon{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:10px;margin-bottom:auto;background:rgba(120,242,95,.09);border:1px solid rgba(120,242,95,.15);color:#78f25f;font-size:.72rem;font-weight:900}
  .mobile-app-home__service strong{color:#f4f8f6;font-size:.9rem;margin-top:12px}
  .mobile-app-home__service small{display:block;color:rgba(255,255,255,.45);font-size:.68rem;margin-top:4px;line-height:1.3}
  .mobile-app-home__psych{display:flex;align-items:center;gap:12px;margin-top:10px;padding:13px 15px;border-radius:19px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.08)}
  .mobile-app-home__psych-badge{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;background:rgba(120,242,95,.08);border:1px solid rgba(120,242,95,.13);color:#78f25f;font-size:.6rem;font-weight:900;letter-spacing:.05em;flex:0 0 auto}
  .mobile-app-home__psych > span:nth-child(2){display:flex;flex:1;flex-direction:column;min-width:0}
  .mobile-app-home__psych strong{color:#f4f8f6;font-size:.88rem}
  .mobile-app-home__psych small{color:rgba(255,255,255,.45);font-size:.67rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mobile-app-home__proof{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:5px 10px;padding:17px 4px 0;color:rgba(255,255,255,.44);font-size:.61rem;text-align:center}
  .mobile-app-home__proof strong{color:#c8f38a;font-size:.65rem}
  .mobile-app-home__proof span{position:relative}
  .mobile-app-home__proof span+span:before{content:'•';position:absolute;left:-7px;color:rgba(255,255,255,.24)}
}
</style>`;

if (!src.includes('</head>')) throw new Error('Head closing tag not found');
src = src.replace('</head>', css + '\n</head>');

fs.writeFileSync(path, src);
console.log('Mobile app-style home experiment applied to index.html');
