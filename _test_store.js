const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1200,height:900});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 // sample fill
 const s1=await p.evaluate(()=>{S1.sample();return {t:document.getElementById('inTarget').value.length>10,f:App.brief.funnel};});
 // advance to stage 3 and edit (triggers autosave)
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>{Brand.setAccent('#0a7d4d');S3.addBadge();var bd=Doc.byId(App.sel);bd.text='50%';S3.renderAll();});
 await new Promise(r=>setTimeout(r,600)); // allow debounced save
 const saved=await p.evaluate(()=>{try{return !!localStorage.getItem('soszae_v29');}catch(e){return 'noLS';}});
 // reload → should restore to stage 3
 await p.reload({waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,700));
 const restored=await p.evaluate(()=>({stage:App.stage,hasDoc:!!App.doc,badge:App.doc&&App.doc.layers.some(l=>l.type==='badge'),accent:App.brand.accent,target:document.getElementById('inTarget').value.length>10}));
 console.log('sample:',JSON.stringify(s1),'saved:',saved,'restored:',JSON.stringify(restored));
 console.log('errors:',errs.length?errs.slice(0,4):'none');
 await b.close();
 const ok=s1.t&&s1.f==='전환'&&saved===true&&restored.stage===3&&restored.hasDoc&&restored.badge&&restored.accent==='#0a7d4d'&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
