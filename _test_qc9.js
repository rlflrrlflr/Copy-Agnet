const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   App.copies=[{id:'A',key:'알아서 실무를 뛰는 스토어 AI 팀',sub:'엔드투엔드 AI',cta:'지금 설치하고 500 크레딧 받기',tone:'직격'}];
   App.brand.accent='#ff6a00';
   Doc.initFromCopy(App.copies[0]);App.stage=4;

   // --- 구매/전환 퍼널: 카피 우선(사람 보조) 구도 ---
   App.brief={target:'t',offer:'o',funnel:'전환',channel:''};
   const fpBuy=Engine._finalPrompt(App.doc,0,{},true);
   out.buyCopyForward=/PURCHASE-INTENT COMPOSITION/i.test(fpBuy)&&/COPY is the hero/i.test(fpBuy)&&/SUPPORTING element/i.test(fpBuy);

   // 인지(브랜딩) 퍼널: 카피우선 구도 미적용(기존 사람-히어로 유지)
   App.brief.funnel='인지';
   const fpAware=Engine._finalPrompt(App.doc,0,{},true);
   out.awarenessNoForce=!/PURCHASE-INTENT COMPOSITION/i.test(fpAware);

   // --- reframe: 늘리기/짜부 금지 + 방향별 재구성 ---
   App.doc.ratio='9:16';App.brief.funnel='전환';
   const rfVert=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.reframeNoSquish=/NEVER stretch, squash, distort/i.test(rfVert)&&/OUTPAINTING the real photographic scene/i.test(rfVert);
   out.vertRecompose=/TALLER vertical canvas/i.test(rfVert)&&/UPPER-CENTER/i.test(rfVert)&&/squeezed square/i.test(rfVert);
   out.reframeBuyIntent=/PURCHASE-INTENT creative/i.test(rfVert);

   App.doc.ratio='16:9';
   const rfWide=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.wideRecompose=/WIDER canvas/i.test(rfWide)&&/keep the person\/product to the RIGHT/i.test(rfWide)&&/do NOT pull the person to dead-center/i.test(rfWide);

   // 1:1 은 방향 지시 없이(왜곡금지·아웃페인팅은 유지)
   App.doc.ratio='1:1';
   const rfSquare=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.squareNeutral=!/TALLER vertical canvas/i.test(rfSquare)&&!/WIDER canvas/i.test(rfSquare)&&/NEVER stretch, squash/i.test(rfSquare);

   // --- 배경 생성(_imagePrompt)도 구매향이면 좌중앙 카피존/사람 우측 ---
   App.brief.funnel='구매';
   const ip=Engine._imagePrompt({layoutType:'persona-scenario'});
   out.imgBuyStaging=/PURCHASE-INTENT creative/i.test(ip)&&/LEFT-CENTER/i.test(ip)&&/toward the RIGHT side/i.test(ip);

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['buyCopyForward','awarenessNoForce','reframeNoSquish','vertRecompose','reframeBuyIntent','wideRecompose','squareNeutral','imgBuyStaging'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
