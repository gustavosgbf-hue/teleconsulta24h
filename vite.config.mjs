import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// Dev-only, synthetic patient data. Never injects fixtures in production files.
export default defineConfig({
  server:{host:'0.0.0.0',allowedHosts:['terminal.local']},
  plugins:[{
    name:'consultaja-review-fixtures',
    configureServer(server){
      server.middlewares.use((req,res,next)=>{
        const url=new URL(req.url,'http://preview.local');
        if(url.pathname==='/__qa'){
          res.setHeader('Content-Type','text/html; charset=utf-8');
          res.end(readFileSync(resolve('tools/preview.html'),'utf8'));return;
        }
        if(!url.searchParams.has('__qa_device')||!['/consulta/','/atendimento/'].includes(url.pathname))return next();
        let html=readFileSync(resolve('.'+url.pathname+'index.html'),'utf8');
        // Keep fonts/images; prevent analytics, payment SDKs and external writes.
        res.setHeader('Content-Security-Policy',"connect-src 'self'; script-src 'self' 'unsafe-inline'; frame-src 'self'; form-action 'none'");
        res.setHeader('Content-Type','text/html; charset=utf-8');
        const fixtures=readFileSync(resolve('tools/preview-fixtures.js'),'utf8');
        html=html.replace('<head>','<head><script>'+fixtures+'</script>');
        res.end(html);
      });
    }
  }]
});
