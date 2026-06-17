const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.4});
 const errs=[]; p.on('pageerror',e=>errs.push(String(e.message)));
 p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,300));
 async function shot(n){await new Promise(r=>setTimeout(r,350));await p.screenshot({path:'/tmp/v29_'+n+'.png'});console.log('shot',n);}
 // Stage 1: fill + analyze
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='알리바바 직소싱';});
 await p.evaluate(()=>{[].forEach.call(document.getElementById('funnelChips').children,(c,i)=>{if(i===3)c.click();});});
 await shot('s1');
 await p.evaluate(()=>S1.analyze());
 await new Promise(r=>setTimeout(r,500));
 await shot('s2');
 // Stage 2: choose A
 await p.evaluate(()=>S2.choose('A'));
 await new Promise(r=>setTimeout(r,600));
 await shot('s3');
 // Stage 3: select sub layer, then go to stage 4
 const layerInfo=await p.evaluate(()=>({stage:App.stage,layers:App.doc?App.doc.layers.map(l=>({role:l.role,nx:+l.nx.toFixed(2),ny:+l.ny.toFixed(2),size:l.size})):null,sel:App.sel}));
 console.log('doc:',JSON.stringify(layerInfo));
 await p.evaluate(()=>S4.open());
 await new Promise(r=>setTimeout(r,900));
 await shot('s4');
 const fin=await p.evaluate(()=>({stage:App.stage,variants:App.final.variants.length}));
 console.log('final:',JSON.stringify(fin));
 console.log('ERRORS:',errs.length?errs.slice(0,6):'none');
 await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
