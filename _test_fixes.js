const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.4});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const r=await p.evaluate(async()=>{
   const out={};
   out.provider=App.provider; out.headerDefault=document.getElementById('provider').value;
   out.noFeedback=!document.getElementById('s4fb');
   document.getElementById('inTarget').value='모델Y 쥬니퍼 오너';document.getElementById('inOffer').value='나파가죽 트렁크 매트';App.brief.funnel='전환';
   await S1.analyze();await new Promise(r=>setTimeout(r,300));S2.choose('A');await new Promise(r=>setTimeout(r,500));
   const key=App.doc.layers.filter(l=>l.role==='key')[0]; out.keyFont=key.font;
   // selection overlay alignment: select CTA, compare selbox left to expected
   const cta=App.doc.layers.filter(l=>l.role==='cta')[0]; App.sel=cta.id; S3.overlay();
   const box=document.querySelector('#overlay .selbox'); const cv=document.getElementById('editCanvas');
   const cr=cv.getBoundingClientRect(), orr=document.getElementById('overlay').getBoundingClientRect();
   const sc=cr.width/cv.width, bb=S3.bbox(cta);
   const expLeft=(cr.left-orr.left)+bb.x*sc;
   out.boxLeft=Math.round(parseFloat(box.style.left)); out.expLeft=Math.round(expLeft); out.aligned=Math.abs(parseFloat(box.style.left)-expLeft)<2;
   // design auto-fit: long headline shouldn't overflow maxW
   App.doc.layers.filter(l=>l.role==='key')[0].text='엄청나게 긴 헤드라인 카피 한 줄로 절대 안 들어가는 길이 테스트 문장';
   const v={bg:Engine._scene('product-shot',210),arch:'impact'};
   const L=Design.layout(App.doc, ARCH.impact, Design.content(App.doc), 1080,1080,1080*0.072, '#e60023');
   const M=1080*0.072, maxW=1080-M*2;
   const keyTexts=L.ops.filter(o=>o.t==='text'&&o.shadow); // headline lines have shadow
   // measure longest headline line width using a canvas
   const mc=document.createElement('canvas').getContext('2d');
   let longest=0,keySize=0;keyTexts.forEach(o=>{mc.font=o.weight+' '+o.size+"px "+o.family;longest=Math.max(longest,mc.measureText(o.text).width);keySize=o.size;});
   out.headlineFits=longest<=maxW+2; out.keySizeShrunk=keySize<1080*0.128; // shrank below default
   return out;
 });
 console.log('fixes:',JSON.stringify(r));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=r.provider==='gemini'&&r.headerDefault==='gemini'&&r.noFeedback&&r.keyFont==='Pretendard'&&r.aligned&&r.headlineFits&&r.keySizeShrunk&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
