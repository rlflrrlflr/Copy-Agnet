const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   // ---- prompt building ----
   App.brief={target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽',funnel:'전환'};
   App.analysis={pains:['p'],tones:['t'],usps:['나파가죽']};
   Doc.initFromCopy({id:'A',key:'미니멀 순정핏 가죽 트렁크 매트',sub:'짐 쏠림 제로',cta:'프리미엄 매트 확인',tone:'t'});
   Doc.add(Doc.badge({text:'50%',sub:'최대'}));
   App.brand.accent='#e60023';
   const prompt=Engine._finalPrompt(App.doc,1,{fb:'배경 어둡게'});
   App.doc.layers.filter(l=>l.type==='cta')[0].shape='bar';
   const promptBar=Engine._finalPrompt(App.doc,2,{},true);
   const promptOk=/미니멀 순정핏 가죽 트렁크 매트/.test(prompt)&&/프리미엄 매트 확인/.test(prompt)&&/최대 50%/.test(prompt)&&/#e60023/.test(prompt)&&/배경 어둡게/.test(prompt)&&/완성안|headline/.test(prompt)&&/full-width solid bar/i.test(promptBar)&&/render ONLY the elements/i.test(promptBar);
   // ---- mocked live generate: 3 full variants ----
   let calls=0;const origGen=Engine.gen;
   Engine.gen=async(kind,pl)=>{calls++;return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';};Engine._imgEdge=async()=>1;
   App.keys.gemini='FAKE';App.final={variants:[],pick:0};
   await S4.generate();
   const liveVariants=App.final.variants.length;
   const allFull=App.final.variants.slice(0,3).every(v=>v.full===true)&&App.final.variants[3]&&App.final.variants[3].lossless===true; // 무손실 보존안 포함
   const names=App.final.variants.map(v=>v.name).join(',');
   // paintFinal draws image (full) — finalCanvas sized to ratio
   S4.paintFinal();
   const fc=document.getElementById('finalCanvas');
   const paintedRatio=fc.width===RATIOS[App.doc.ratio][0];
   // refine path
   const callsAfterGen=calls;
   await S4.refine.call(S4); // no fb -> should toast and not crash
   document.getElementById('s4fb').value='더 고급스럽게';
   await S4.refine();
   const refineCalled=calls>callsAfterGen; // refine이 gen을 추가 호출
   // ---- no-key path -> preview variants (Design overlay) ----
   App.keys.gemini='';App.final={variants:[],pick:0};
   await S4.generate();
   const previewFull=App.final.variants.some(v=>v.full);
   Engine.gen=origGen;
   return {promptOk,liveVariants,allFull,names,paintedRatio,refineCalled,previewVariants:App.final.variants.length,previewFull};
 });
 await b.close();
 console.log(JSON.stringify(out));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 const ok=out.promptOk&&out.liveVariants===4&&out.allFull&&/완성안 1/.test(out.names)&&out.paintedRatio&&out.refineCalled&&out.previewVariants===1&&!out.previewFull&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
