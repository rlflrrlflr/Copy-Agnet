const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const r=await p.evaluate(async()=>{
   const out={};try{localStorage.removeItem('soszae_v29');}catch(e){}
   // build a doc directly from a copy with a multi-word, newline-containing headline
   App.brief={offer:'에어프라이어',target:'1인 가구',funnel:'전환',visual:''};
   Doc.initFromCopy({key:'지금 바로\n특가 시작',sub:'오늘만 이 가격',cta:'구매하기',tone:'확신'});
   UI.go(3);
   const key=App.doc.layers[0]; // text 'key'
   // ---- 1) srcIdx mapping: line 0 = '지금 바로', line 1 = '특가 시작' ----
   const cv=document.getElementById('editCanvas');const x=cv.getContext('2d');const W=cv.width;
   const m=S3.measure(x,key,W);
   out.lines=m.lines;
   out.srcIdx=m.srcIdx;
   // source string '지금 바로\n특가 시작' indices: 지0 금1 ' '2 바3 로4 \n5 특6 가7 ' '8 시9 작10
   // line0 chars map to [0,1,2,3,4]; line1 chars map to [6,7,8,9,10]
   out.map0=JSON.stringify(m.srcIdx[0]);
   out.map1=JSON.stringify(m.srcIdx[1]);
   // ---- 2) apply a partial color run on '특가' (source idx 6..8) ----
   S3.applyRun(key,6,8,'#e60023');
   out.runs=JSON.parse(JSON.stringify(key.runs));
   out.colAt6=S3.runColor(key,6); // red
   out.colAt8=S3.runColor(key,8); // null (시)
   out.colAt0=S3.runColor(key,0); // null
   // ---- 3) overlap split: apply blue on 0..8 then red stays carved? apply 7..10 ----
   S3.applyRun(key,7,10,'#1f6feb');
   out.runsAfter=JSON.parse(JSON.stringify(key.runs));
   out.colAt7=S3.runColor(key,7); // blue now
   out.colAt6b=S3.runColor(key,6); // still red
   // ---- 4) clearRun on 9..10 ----
   S3.clearRun(key,9,10);
   out.colAt9=S3.runColor(key,9); // null
   out.colAt7b=S3.runColor(key,7); // still blue (7..9)
   // restore a clean run for the pixel test: color '특' (idx6) red
   key.runs=[]; S3.applyRun(key,6,7,'#e60023');
   // ---- 5) draw renders without error & inlineEdit palette mounts ----
   S3.draw();
   S3.inlineEdit(key);
   out.palette=!!document.querySelector('.inline-pal');
   out.paletteSwatches=document.querySelectorAll('.inline-pal .swatch').length;
   // draw() paints inside an async bg-image callback → wait for paint before sampling
   await new Promise(r=>setTimeout(r,300));
   const img=x.getImageData(0,0,W,cv.height).data;let red=0;
   for(let i=0;i<img.length;i+=4){if(img[i]>180&&img[i+1]<80&&img[i+2]<80)red++;}
   out.redPixels=red;
   return out;
 });
 console.log('lines:',JSON.stringify(r.lines));
 console.log('map line0:',r.map0,' line1:',r.map1);
 console.log('runs(특가 red):',JSON.stringify(r.runs),' colAt6=',r.colAt6,' colAt8=',r.colAt8,' colAt0=',r.colAt0);
 console.log('runsAfter overlap:',JSON.stringify(r.runsAfter),' colAt7=',r.colAt7,' colAt6=',r.colAt6b);
 console.log('afterClear colAt9=',r.colAt9,' colAt7=',r.colAt7b);
 console.log('palette mounted=',r.palette,' swatches=',r.paletteSwatches,' redPixels=',r.redPixels);
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok = r.lines.length===2 && r.map0==='[0,1,2,3,4]' && r.map1==='[6,7,8,9,10]'
   && r.colAt6==='#e60023' && r.colAt8===null && r.colAt0===null
   && r.colAt7==='#1f6feb' && r.colAt6b==='#e60023'
   && r.colAt9===null && r.colAt7b==='#1f6feb'
   && r.palette && r.paletteSwatches===8 && r.redPixels>20 && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
