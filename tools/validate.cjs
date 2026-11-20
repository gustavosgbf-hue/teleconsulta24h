const fs = require('node:fs');
const vm = require('node:vm');
let count = 0;
for (const file of [
  'index.html', 'consulta/index.html', 'atendimento/index.html', 'paciente.html',
  'psicologo-online/index.html', 'psicologo-online/agendamentos/index.html',
  'especialistas/index.html', 'especialistas/dermatologia/index.html',
  'especialistas/endocrinologia/index.html', 'especialistas/psiquiatria/index.html',
  'especialistas/geriatria/index.html',
]) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=|application\/ld\+json/i.test(match[1]) || !match[2].trim()) continue;
    new vm.Script(match[2], {filename: `${file}:script-${++count}`});
  }
}
for (const file of ['psicologo-online/agenda-slots-client.js', 'consulta/visionary-v1.js', 'patient-chat-ux-v6.js', 'patient-visual-1116.js', 'tools/preview-fixtures.js']) {
  new vm.Script(fs.readFileSync(file, 'utf8'), {filename: file});
  count++;
}
console.log(`${count} JavaScript blocks parsed successfully.`);
