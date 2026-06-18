const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1200,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const r=await p.evaluate(async()=>{
   const out={};try{localStorage.removeItem('soszae_v29');}catch(e){}
   // add a competitor URL (auto-classify), a research URL, a text
   document.getElementById('ctxUrl').value='https://www.coupang.com/vp/products/123'; Ctx.addUrl(); // → competitor
   document.getElementById('ctxUrl').value='brunch.co.kr/@trend/report'; Ctx.addUrl();           // → research, https prefixed
   document.getElementById('ctxText').value='경쟁사 대비 가격 30% 저렴, 후기 4.8점, 재구매율 높음.'; Ctx.addText();
   out.count=App.ctx.length;
   out.roles=App.ctx.map(c=>c.role);
   out.httpsfix=App.ctx[1].value.startsWith('https://');
   out.listRendered=document.getElementById('ctxList').children.length;
   // reclassify item 0 → brief
   Ctx.setRole(App.ctx[0].id,'brief'); out.reclass=App.ctx[0].role;
   // prompt injection
   const pr=Engine._prompt('copies',{target:'t',offer:'o',pains:[],tones:[]});
   out.inPrompt=/맥락 자료/.test(pr.user)&&/coupang|재구매율/.test(pr.user);
   return out;
 });
 console.log('ctx:',JSON.stringify(r));
 await new Promise(r=>setTimeout(r,700));
 // reload → persistence
 await p.reload({waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,500));
 const persist=await p.evaluate(()=>({n:App.ctx.length,list:document.getElementById('ctxList').children.length}));
 console.log('persist:',JSON.stringify(persist));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=r.count===3&&r.roles[0]==='competitor'&&r.roles[1]==='research'&&r.httpsfix&&r.listRendered===3&&r.reclass==='brief'&&r.inPrompt&&persist.n===3&&persist.list===3&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
