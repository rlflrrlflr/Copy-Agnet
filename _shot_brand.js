const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.5});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='썸머세일';App.brief.funnel='전환';Brand.setAccent('#1f6feb');});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>{S3.addBadge();var bd=Doc.byId(App.sel);bd.text='76%';bd.sub='최대';bd.style='burst';bd.color='#1f6feb';S3.renderAll();});
 await p.evaluate(()=>S4.open());await new Promise(r=>setTimeout(r,1700));
 const n=await p.evaluate(()=>App.final.variants.length);
 console.log('variants:',n);
 await p.screenshot({path:'/tmp/v29_brand4.png'});
 await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
