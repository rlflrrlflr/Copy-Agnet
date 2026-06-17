const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:900,height:900,deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 // render the design at all 3 ratios and capture dims + thumbnails
 const out=await p.evaluate(async()=>{
   App.doc.bgImage=Engine._scene('product-shot',210);
   const v={bg:App.doc.bgImage,arch:'impact'};const res={};
   for(const rt of ['1:1','4:5','16:9']){App.doc.ratio=rt;const c=document.createElement('canvas');Design.render(c,v,App.doc);await new Promise(r=>setTimeout(r,150));Design.render(c,v,App.doc);res[rt]=[c.width,c.height];window.__last=window.__last||{};window.__last[rt]=c.toDataURL('image/png');}
   return res;
 });
 console.log('ratio dims:',JSON.stringify(out));
 const urls=await p.evaluate(()=>window.__last);
 ['1:1','4:5','16:9'].forEach(rt=>fs.writeFileSync('/tmp/v29_ratio_'+rt.replace(':','x')+'.png',Buffer.from(urls[rt].split(',')[1],'base64')));
 console.log('errors:',errs.length?errs.slice(0,4):'none');
 await b.close();
 const ok=out['1:1'][0]===1080&&out['16:9'][1]===607&&out['4:5'][1]===1350&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
