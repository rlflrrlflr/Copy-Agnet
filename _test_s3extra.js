const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   App.brief={target:'t',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   App.analysis=Engine._sim('analyze',App.brief);await S2.regen(true);
   // stage2 stagger
   UI.go(2);S2.render();
   const card2=document.querySelectorAll('#copyGrid .copy-card')[2];
   const delay=card2&&card2.style.animationDelay;
   const guide=document.querySelector('.s2chat-h').textContent.indexOf('대화로 카피를 다듬어요')>=0;
   // go to stage 3
   Doc.initFromCopy(App.copies[0]);UI.go(3);S3.renderAll();
   const scrimDefault=App.doc.scrim;
   // scrim control present + works
   const hasScrim=!!document.getElementById('scrimRange');
   S3.setScrim(70);
   const scrimSet=Math.abs(App.doc.scrim-0.7)<0.001 && document.getElementById('scrimNum').value==='70';
   S3.setScrim(0); const scrimOff=App.doc.scrim===0;
   // CTA bar toggle surfaced in main props (not fold)
   const cta=App.doc.layers.filter(l=>l.type==='cta')[0];
   App.sel=cta.id;App.sels=[cta.id];S3.props();
   const propsHost=document.getElementById('propBody')||document.getElementById('props')||document;
   // find a button labeled 하단바 in props, and it should be outside <details>
   let barBtn=null,inFold=false;
   document.querySelectorAll('#stage3 button').forEach(b=>{if(/하단바/.test(b.textContent)){barBtn=b;if(b.closest('details'))inFold=true;}});
   const barVisible=!!barBtn && !inFold;
   if(barBtn){barBtn.click();}
   const shapeBar=cta.shape==='bar';
   return {delay,guide,scrimDefault,hasScrim,scrimSet,scrimOff,barVisible,shapeBar};
 });
 await b.close();
 console.log(JSON.stringify(out));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 const ok=out.delay==='0.15s'&&out.guide&&out.scrimDefault===0.45&&out.hasScrim&&out.scrimSet&&out.scrimOff&&out.barVisible&&out.shapeBar&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
