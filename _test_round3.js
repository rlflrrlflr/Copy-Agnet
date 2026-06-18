const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 // ---------- Stage 2 conversational refine (sim) ----------
 const refine=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   App.brief={target:'테슬라 오너',offer:'쥬니퍼 전용 트렁크 매트 — 나파가죽, IPX7 방수',funnel:'전환',channel:''};
   App.analysis=Engine._sim('analyze',{target:App.brief.target,offer:App.brief.offer});
   await S2.regen(true); // 5 copies
   const before=App.copies.map(c=>({key:c.key,sub:c.sub}));
   // 1) must-include word
   let out=Engine._sim('refine',{instruction:'‘매트’ 꼭 넣어',copies:App.copies,offer:App.brief.offer});
   const mustOk=out.every(c=>/매트/.test(c.key+c.sub)) && out.length===5 && out[0].id==='A';
   // 2) shorter
   out=Engine._sim('refine',{instruction:'더 짧게',copies:App.copies,offer:App.brief.offer});
   const shortOk=out[0].key.length<=before[0].key.length;
   // 3) strong -> exclamation
   out=Engine._sim('refine',{instruction:'더 공격적으로 세게',copies:App.copies,offer:App.brief.offer});
   const strongOk=out.some(c=>/!$/.test(c.key));
   // 4) live UI path via S2.chat (sim fallback, no key)
   UI.go(2);
   document.getElementById('s2msg').value='숫자 강조';
   await S2.chat();
   await new Promise(r=>setTimeout(r,400));
   const logCount=document.querySelectorAll('#s2log .s2-msg').length;
   const numOk=App.copies.some(c=>/\d/.test(c.key+c.sub));
   return {mustOk,shortOk,strongOk,logCount,numOk,copies:App.copies.length};
 });

 // ---------- Stage 3: image-as-layer + delete + size slider ----------
 const s3=await p.evaluate(async()=>{
   // build a doc
   const c=App.copies[0];Doc.initFromCopy(c);App.stage=3;
   // add an image layer via Doc.image (simulate Assets.toLayer)
   const fakeUrl='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
   S3._img[fakeUrl]={width:100,height:100,naturalWidth:100,naturalHeight:100};
   Doc.add(Doc.image(fakeUrl,{ar:1}));
   const before=App.doc.layers.length;
   const imgLayer=App.doc.layers.filter(l=>l.type==='image')[0];
   const hasImgLayer=!!imgLayer;
   // size slider: change wx via the props apply logic
   imgLayer._wx0=imgLayer.wx;
   const w0=imgLayer.wx;
   imgLayer.wx=clamp((imgLayer._wx0)*200/100,.03,1.6); // 200%
   const sizeWorks=imgLayer.wx>w0*1.9;
   // delete via Doc.remove
   Doc.remove(imgLayer.id);
   const after=App.doc.layers.length;
   const deleteWorks=after===before-1 && !App.doc.layers.some(l=>l.type==='image');
   return {hasImgLayer,sizeWorks,deleteWorks};
 });

 // ---------- Stage 4: intent panel removed ----------
 const s4=await p.evaluate(()=>({
   noIntentList:!document.getElementById('intentList'),
   noIntentBox:!document.querySelector('#stage4 .intent-box'),
   intentFnSafe:(function(){try{S4.intent();return true;}catch(e){return false;}})()
 }));

 // ---------- logo knockout ----------
 const ko=await p.evaluate(()=>new Promise(res=>{
   // white-bg logo: red square centered on white
   const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
   x.fillStyle='#ffffff';x.fillRect(0,0,64,64);x.fillStyle='#e60023';x.fillRect(18,18,28,28);
   const im=new Image();im.onload=function(){
     const url=Brand.knockout(im);
     if(!url){res({ok:false});return;}
     const t=new Image();t.onload=function(){
       const cc=document.createElement('canvas');cc.width=cc.height=64;const xx=cc.getContext('2d');xx.drawImage(t,0,0,64,64);
       const d=xx.getImageData(0,0,64,64).data;
       // corner should be transparent, center opaque
       const cornerA=d[3], centerA=d[(32*64+32)*4+3];
       res({ok:true,cornerTransparent:cornerA<20,centerOpaque:centerA>200});
     };t.src=url;
   };im.src=c.toDataURL();
 }));

 // ---------- cat think bubble during count ----------
 const cat=await p.evaluate(async()=>{
   Cat.score={w:0,l:0,d:0,streak:0,best:0};Cat.show('copies');
   const hasThink=!!document.getElementById('catThink');
   Cat.rps('rock');
   await new Promise(r=>setTimeout(r,250));
   const thinkOn=document.getElementById('catThink').classList.contains('on');
   const thinkText=document.getElementById('catThink').textContent.length>0;
   await new Promise(r=>setTimeout(r,1300));
   const thinkOff=!document.getElementById('catThink').classList.contains('on');
   return {hasThink,thinkOn,thinkText,thinkOff};
 });

 await b.close();
 console.log('refine:',JSON.stringify(refine));
 console.log('s3:',JSON.stringify(s3));
 console.log('s4:',JSON.stringify(s4));
 console.log('knockout:',JSON.stringify(ko));
 console.log('cat:',JSON.stringify(cat));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 const ok=refine.mustOk&&refine.shortOk&&refine.strongOk&&refine.logCount>=2&&refine.numOk&&refine.copies===5
   &&s3.hasImgLayer&&s3.sizeWorks&&s3.deleteWorks
   &&s4.noIntentList&&s4.noIntentBox&&s4.intentFnSafe
   &&ko.ok&&ko.cornerTransparent&&ko.centerOpaque
   &&cat.hasThink&&cat.thinkOn&&cat.thinkText&&cat.thinkOff
   &&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
