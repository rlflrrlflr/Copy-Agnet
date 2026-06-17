const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});
 const p=await b.newPage();await p.setViewport({width:1340,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('con:'+m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,250));
 // provider/keys present
 const hdr=await p.evaluate(()=>({prov:!!document.getElementById('provider'),ck:!!document.getElementById('claudeKey'),gk:!!document.getElementById('geminiKey'),cat:!!document.getElementById('catOv'),CAT:typeof window.CAT,catImg:(window.CAT&&CAT.neutral||'').slice(0,15)}));
 console.log('header/cat:',JSON.stringify(hdr));
 // drive to stage 3 (sim mode, no keys)
 await p.evaluate(()=>{document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});
 await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>S2.choose('A'));
 await new Promise(r=>setTimeout(r,500));
 // cat overlay shows during gen? trigger genImage and check class within
 const catShown=await p.evaluate(async()=>{ const pr=S3.genImage(); const on=document.getElementById('catOv').classList.contains('on'); await pr; const off=!document.getElementById('catOv').classList.contains('on'); return {on,off}; });
 console.log('catOverlay during/after image gen:',JSON.stringify(catShown));
 // interactions
 const t=await p.evaluate(()=>{
   const r={}; App.sel=App.doc.layers[0].id; const L=Doc.byId(App.sel);
   // rotation via onMove rot mode
   S3.drag={id:L.id,mode:'rot'}; const cv=document.getElementById('editCanvas');
   const bb=S3.bbox(L); // simulate pointer to the right of center -> ~ +90+? 
   S3.onMove({clientX:0,clientY:0,target:cv}); // uses canvasPoint→ rough; just ensure rot set numeric
   r.rotSet = (typeof L.rot==='number');
   L.rot=30; S3.drag=null;
   // hit-test still finds rotated layer at its center
   const b2=S3.bbox(L); r.hitRot = (S3.hit({x:b2.x+b2.w/2,y:b2.y+b2.h/2})===L.id);
   // align center
   S3.alignLayer('cx'); const W=cv.width; const b3=S3.bbox(L); r.alignCx = Math.abs((b3.x+b3.w/2)-W/2)<2;
   S3.alignLayer('b'); r.alignB = (L.ny>0.5);
   // overlay builds rotate handle
   App.sel=L.id; S3.overlay(); r.rotHandle = !!document.querySelector('#overlay .hdl.rot');
   // Cat.rps swaps image (no throw)
   Cat.rps('rock'); r.rps=true;
   return r;
 });
 console.log('interactions:',JSON.stringify(t));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 await b.close();
 const ok=hdr.prov&&hdr.ck&&hdr.gk&&hdr.cat&&hdr.CAT==='object'&&catShown.on&&catShown.off&&Object.values(t).every(Boolean)&&!errs.length;
 console.log(ok?'ALL PASS':'SOME FAIL'); process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
