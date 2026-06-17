const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.5});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('con:'+m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,250));
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='썸머세일 직소싱';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,600));
 // add a designed badge in stage 3, then go to stage 4
 await p.evaluate(()=>{S3.addBadge();var bd=Doc.byId(App.sel);bd.text='76%';bd.sub='최대';bd.style='burst';bd.color='#e60023';S3.renderAll();});
 const r=await p.evaluate(()=>{ S4.open(); return {stage:App.stage,variants:App.final.variants.length}; });
 await new Promise(r=>setTimeout(r,1200));
 const v=await p.evaluate(()=>({n:App.final.variants.length,archs:App.final.variants.map(x=>x.arch)}));
 console.log('result:',JSON.stringify(r),JSON.stringify(v));
 await p.screenshot({path:'/tmp/v29_design4.png'});
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 await b.close();
 const ok=r.stage===4&&v.n===3&&v.archs.join()==='impact,clean,price'&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
