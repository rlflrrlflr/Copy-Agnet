const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   // 1) combined analyze (sim) returns copies
   const a=Engine._sim('analyze',{target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''});
   const analyzeCombined=Array.isArray(a.copies)&&a.copies.length===5&&!!a.copies[0].key&&a.copies[0].id==='A';
   // S1.analyze uses combined (sim path, no key)
   document.getElementById('inTarget').value='테슬라 오너';document.getElementById('inOffer').value='트렁크 매트 — 나파가죽';
   App.brief.funnel='전환';[].forEach.call(document.getElementById('funnelChips').children,c=>c.classList.toggle('on',c.textContent==='전환'));
   await S1.analyze();
   const s1Copies=App.copies.length===5 && App.stage===2;
   // 2) build doc, CTA bottom bar
   Doc.initFromCopy(App.copies[0]);UI.go(3);S3.draw();
   const cv=document.getElementById('editCanvas');const W=cv.width,H=cv.height;
   const cta=App.doc.layers.filter(l=>l.type==='cta')[0];
   cta.shape='bar';
   const bb=S3.bbox(cta);
   const barFullWidthBottom=bb.x===0&&Math.abs(bb.w-W)<1&&(bb.y+bb.h>=H-1);
   // 3) localized scrim cluster
   const x=cv.getContext('2d');const cluster=S3._textCluster(x,W,H);
   const scrimLocal=!!cluster&&cluster.y1>cluster.y0&&cluster.x1>cluster.x0&&cluster.y1<=H;
   // 4) image layer click selects it
   const url='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
   S3._img[url]={width:100,height:100,naturalWidth:100,naturalHeight:100};
   Doc.add(Doc.image(url,{ar:1}));
   const imL=App.doc.layers.filter(l=>l.type==='image')[0];
   imL.nx=0.4;imL.ny=0.4;imL.wx=0.2;
   const ib=S3.bbox(imL);
   const hitId=S3.hit({x:ib.x+ib.w/2,y:ib.y+ib.h/2});
   const imgClick=hitId===imL.id;
   // 5) stage4 UI: fold removed, new elements present
   const foldRemoved=!document.getElementById('s4arch');
   const chatUI=!!document.getElementById('s4fb')&&!!document.getElementById('s4free')&&!!document.querySelector('.s4-flow');
   // 6) setFree
   S4.setFree(true);const freeSet=App.final.free===true;
   // 7) _finalPrompt base branch keeps composition
   App.brand.accent='#e60023';
   const pBase=Engine._finalPrompt(App.doc,0,{},true);
   const pFresh=Engine._finalPrompt(App.doc,0,{},false);
   const baseKeepsComp=/KEEP its composition/i.test(pBase)&&!/KEEP its composition/i.test(pFresh);
   const freePhrase=/HIGH creative freedom/i.test(Engine._finalPrompt(App.doc,0,{free:true},true));
   return {analyzeCombined,s1Copies,barFullWidthBottom,scrimLocal,imgClick,foldRemoved,chatUI,freeSet,baseKeepsComp,freePhrase};
 });
 await b.close();
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 const ok=Object.values(out).every(v=>v===true)&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
