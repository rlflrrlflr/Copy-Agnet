const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAHElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAvA0hAAABw3l8KQAAAABJRU5ErkJggg==';

 // ---- A) cat overlay shows during analyze ----
 const catDuring=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   document.getElementById('inTarget').value='테슬라 오너';
   document.getElementById('inOffer').value='트렁크 매트 — 나파가죽';
   App.brief.funnel='전환';App.keys.gemini='';App.provider='gemini';
   // stub a slow gen so we can observe the overlay
   const real=Engine._run;Engine._run=async(kind,pl,isImg,strict)=>{await new Promise(r=>setTimeout(r,500));return real.call(Engine,kind,pl,isImg,strict);};
   const pr=S1.analyze();
   await new Promise(r=>setTimeout(r,200));
   const shown=document.getElementById('catOverlay').classList.contains('show');
   await pr;
   return {shown};
 });

 // ---- build stage 3 with an image layer; test number input + flip ----
 const s3=await p.evaluate(async(PNG)=>{
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   await new Promise(res=>{const im=new Image();im.onload=()=>{S3._img[PNG]=im;res();};im.onerror=res;im.src=PNG;});
   Doc.initFromCopy(App.copies[0]);UI.go(3);
   S3.addImage(PNG);
   const imL=App.doc.layers.filter(l=>l.type==='image'&&l.role!=='logo')[0];
   App.sel=imL.id;App.sels=[imL.id];S3.props();
   // number input: typing into the image size 'num' should NOT rebuild panel (focus retained)
   const nums=document.querySelectorAll('#propBody input[type=number]');
   const numEl=nums[0];
   numEl.focus();numEl.value='150';numEl.dispatchEvent(new Event('input',{bubbles:true}));
   const stillFocused=document.activeElement===numEl;        // panel NOT rebuilt
   const wxChanged=Math.abs(imL.wx-(imL._wx0*1.5))<0.01;     // applied
   // flip button toggles flipH
   const before=!!imL.flipH;
   // find the flip button
   let flipBtn=null;document.querySelectorAll('#propBody button').forEach(b=>{if(/좌우반전/.test(b.textContent))flipBtn=b;});
   if(flipBtn)flipBtn.click();
   const flipped=imL.flipH===true&&before===false;
   const flipBtnExists=!!flipBtn;
   return {stillFocused,wxChanged,flipped,flipBtnExists};
 },PNG);

 await b.close();
 console.log('cat during analyze:',JSON.stringify(catDuring));
 console.log('stage3:',JSON.stringify(s3));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const ok=catDuring.shown&&s3.stillFocused&&s3.wxChanged&&s3.flipped&&s3.flipBtnExists&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
