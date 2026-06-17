const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:520,height:1500,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='썸머세일 직소싱';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>{S3.addBadge();var bd=Doc.byId(App.sel);bd.text='76%';bd.sub='최대';bd.style='burst';bd.color='#e60023';S3.renderAll();});
 // render all 3 archetypes into 3 canvases stacked for review
 const dataUrls=await p.evaluate(async()=>{
   S4.open(); await new Promise(r=>setTimeout(r,400));
   const outs=[];
   for(const arch of ['impact','clean','price']){
     const c=document.createElement('canvas');
     Design.render(c,{bg:App.doc.bgImage,arch},App.doc);
     await new Promise(r=>setTimeout(r,150));
     Design.render(c,{bg:App.doc.bgImage,arch},App.doc); // re-render after img cached
     outs.push(c.toDataURL('image/png'));
   }
   return outs;
 });
 const fs=require('fs');
 dataUrls.forEach((u,i)=>fs.writeFileSync('/tmp/v29_arch'+i+'.png',Buffer.from(u.split(',')[1],'base64')));
 console.log('rendered',dataUrls.length,'errors:',errs.length?errs.slice(0,4):'none');
 await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
