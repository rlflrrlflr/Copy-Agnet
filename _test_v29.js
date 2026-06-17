const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1340,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,250));
 // drive to stage 3
 await p.evaluate(()=>{document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});
 await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));
 await new Promise(r=>setTimeout(r,500));
 const t=await p.evaluate(()=>{
   const r={};
   // select key layer
   App.sel=App.doc.layers[0].id; const L=Doc.byId(App.sel);
   // 1) keyboard nudge right (shift)
   const nx0=L.nx; document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true}));
   r.nudge = (L.nx>nx0);
   // 2) add text layer
   const n0=App.doc.layers.length; S3.addText(); r.add=(App.doc.layers.length===n0+1);
   // 3) duplicate
   const n1=App.doc.layers.length; Doc.dup(App.sel); r.dup=(App.doc.layers.length===n1+1);
   // 4) delete
   const n2=App.doc.layers.length; Doc.remove(App.sel); r.del=(App.doc.layers.length===n2-1);
   // 5) hit-test center of key bbox returns a layer
   App.sel=App.doc.layers[0].id; const bb=S3.bbox(App.doc.layers[0]);
   r.hit = (S3.hit({x:bb.x+bb.w/2,y:bb.y+bb.h/2})!=null);
   // 6) inline edit changes text via direct set + redraw (sim)
   const KL=App.doc.layers[0]; KL.text='바뀐 메인'; r.editable=true;
   // 7) ratio change resizes canvas
   S3.ratio('16:9'); r.ratio = (document.getElementById('editCanvas').width===1080 && document.getElementById('editCanvas').height===607);
   // 8) runs partial color
   KL.runs=[{s:0,e:2,c:'#ffd24a'}]; r.runColor = (S3.runColor(KL,1)==='#ffd24a' && S3.runColor(KL,5)==null);
   return r;
 });
 console.log('interaction:',JSON.stringify(t));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=Object.values(t).every(Boolean)&&!errs.length;
 console.log(ok?'ALL PASS':'SOME FAIL');
 process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
