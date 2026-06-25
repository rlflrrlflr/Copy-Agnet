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
   // 19차: 전역 배경음영 슬라이더는 삭제됨(레이어별 '글자 음영'으로 대체). 슬라이더가 없어야 한다.
   const scrimSliderGone=document.getElementById('scrimRange')===null && document.getElementById('scrimNum')===null;
   // 레이어별 음영(글자 음영) — key 레이어에 scrim override 가 먹는다
   const keyL=App.doc.layers.filter(l=>l.role==='key')[0];
   keyL.scrim=0.7;keyL.scrimColor='#ff0000';
   const perLayerScrim=Math.abs(keyL.scrim-0.7)<0.001 && S3._hexRgb(keyL.scrimColor)==='255,0,0';
   const drawsOk=(function(){try{S3.draw();return true;}catch(e){return false;}})();
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
   return {delay,guide,scrimDefault,scrimSliderGone,perLayerScrim,drawsOk,barVisible,shapeBar};
 });
 await b.close();
 console.log(JSON.stringify(out));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 const ok=out.delay==='0.15s'&&out.guide&&out.scrimDefault===0.45&&out.scrimSliderGone&&out.perLayerScrim&&out.drawsOk&&out.barVisible&&out.shapeBar&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
