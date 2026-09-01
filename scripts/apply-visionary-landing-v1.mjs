import fs from 'node:fs';

const file='consulta/index.html';
let html=fs.readFileSync(file,'utf8');

const cssTag='<link rel="stylesheet" href="/consulta/visionary-v1.css?v=1" data-cj-visionary-v1="1">';
const jsTag='<script src="/consulta/visionary-v1.js?v=1" defer data-cj-visionary-v1="1"></script>';

if(!html.includes('data-cj-visionary-v1="1"')){
  if(!html.includes('</head>')) throw new Error('Não encontrei </head>');
  html=html.replace('</head>',`${cssTag}\n</head>`);
}
if(!html.includes('/consulta/visionary-v1.js?v=1')){
  if(!html.includes('</body>')) throw new Error('Não encontrei </body>');
  html=html.replace('</body>',`${jsTag}\n</body>`);
}

fs.writeFileSync(file,html);
console.log('Visionary landing V1 aplicada.');
