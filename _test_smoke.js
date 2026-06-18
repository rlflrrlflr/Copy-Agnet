const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out={};

 // STAGE 1 → sample + context + analyze (sim, no keys)
 await p.evaluate(()=>{try{localStorage.removeItem('soszae_v29');}catch(e){}});
 await p.evaluate(()=>{S1.sample();document.getElementById('ctxUrl').value='https://coupang.com/x';Ctx.addUrl();});
 await p.evaluate(()=>S1.analyze());
 await wait(400);
 out.s1=await p.evaluate(()=>({stage:App.stage,copies:App.copies.length,ctx:App.ctx.length}));

 // STAGE 2 → choose first copy → builds doc → stage 3
 await p.evaluate(()=>S2.choose(App.copies[0].id));
 await wait(500);
 out.s2=await p.evaluate(()=>({stage:App.stage,hasDoc:!!App.doc,layers:App.doc?App.doc.layers.length:0,
   keyFont:App.doc?App.doc.layers[0].font:null, bg:!!App.doc.bgImage}));

 // STAGE 3 checks: default font Pretendard, partial color, multi-select, badge font
 out.s3=await p.evaluate(async()=>{
   const o={};const key=App.doc.layers[0];
   o.font=key.font;
   // partial color
   S3.applyRun(key,0,2,'#e60023');o.run=key.runs.length===1;
   // add a badge → check default number font is Pretendard (not Black Han Sans)
   Doc.add(Doc.badge({text:'50%'}));
   // multi-select all
   App.sels=App.doc.layers.map(l=>l.id);App.sel=App.sels[App.sels.length-1];
   S3.overlay();
   o.boxes=document.querySelectorAll('#overlay .selbox').length;
   o.handles=document.querySelectorAll('#overlay .hdl').length; // only primary
   S3.draw();await new Promise(r=>setTimeout(r,250));
   return o;
 });

 // STAGE 4 → generate variants (sim) → no feedback panel (s4fb removed)
 await p.evaluate(()=>UI.go(4));
 await wait(600);
 out.s4=await p.evaluate(()=>({stage:App.stage,variants:App.final.variants.length,
   hasFeedbackPanel:!!document.getElementById('s4fb')}));

 // provider default = gemini
 out.provider=await p.evaluate(()=>({app:App.provider, sel:document.getElementById('provider').value}));

 await b.close();
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 const ok = out.s1.stage===2 && out.s1.copies>=3 && out.s1.ctx===1
   && out.s2.stage===3 && out.s2.hasDoc && out.s2.layers>=3 && out.s2.keyFont==='Pretendard' && out.s2.bg
   && out.s3.font==='Pretendard' && out.s3.run && out.s3.boxes>=4 && out.s3.handles===3
   && out.s4.stage===4 && out.s4.variants>=1 && out.s4.hasFeedbackPanel===false
   && out.provider.app==='gemini' && out.provider.sel==='gemini'
   && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
