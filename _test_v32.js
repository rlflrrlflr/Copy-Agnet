/* v32: P0 플러드필 누끼 · P1 융합 패스+재스탬프 · P3 기획안 시트 */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v32_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   // ===== 0) v32 정체성 + 이전 세션 폴백 =====
   out.title=/v32/.test(document.title);
   out.storeKey=Store.KEY==='soszae_v32';
   out.fallbackChain=/soszae_v31/.test(Store.load.toString())&&/soszae_v30/.test(Store.load.toString());

   // ===== P0) 플러드필 누끼 — 외곽 배경 제거 + 라벨 내부 흰색 보존 =====
   function makeCut(){var cv=document.createElement('canvas');cv.width=cv.height=300;var x=cv.getContext('2d');
     x.fillStyle='#ff8800';x.fillRect(0,0,300,300);          // 주황 배경(사용자 스크린샷 상황)
     x.fillStyle='#f4b400';x.fillRect(80,40,140,220);        // 병
     x.fillStyle='#ffffff';x.fillRect(100,120,100,80);       // 흰 라벨(배경과 다른 색이지만 '흰색 보존' 핵심 검증)
     return cv;}
   const cutCv=makeCut();
   const cutImg=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=cutCv.toDataURL();});
   const ko=Assets.floodKnockout(cutImg);
   out.koReturns=typeof ko==='string'&&ko.indexOf('data:image')===0;
   if(ko){
     const kim=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=ko;});
     const c2=document.createElement('canvas');c2.width=c2.height=300;const x2=c2.getContext('2d');x2.drawImage(kim,0,0);
     const corner=x2.getImageData(5,5,1,1).data;       // 외곽 배경 → 투명해야
     const label=x2.getImageData(150,160,1,1).data;    // 라벨 내부 흰색 → 불투명 유지
     const body=x2.getImageData(150,60,1,1).data;      // 병 몸체 → 불투명 유지
     out.koCornerTransparent=corner[3]<40;
     out.koLabelKept=label[3]>200&&label[0]>240&&label[1]>240;
     out.koBodyKept=body[3]>200;
   }
   // 이미 누끼(투명 모서리)면 건드리지 않음
   const tCv=document.createElement('canvas');tCv.width=tCv.height=100;tCv.getContext('2d').fillRect(30,30,40,40);
   const tImg=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=tCv.toDataURL();});
   out.koSkipsTransparent=Assets.floodKnockout(tImg)===null;
   // 사진 배경(모서리 색 불일치)이면 포기
   const pCv=document.createElement('canvas');pCv.width=pCv.height=100;const px2=pCv.getContext('2d');
   px2.fillStyle='#ff0000';px2.fillRect(0,0,50,100);px2.fillStyle='#0000ff';px2.fillRect(50,0,50,100);
   const pImg=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=pCv.toDataURL();});
   out.koSkipsPhoto=Assets.floodKnockout(pImg)===null;

   // ===== P0 배선) 제품 레이어 생성 시 자동 누끼 =====
   out.koWired=/floodKnockout/.test(S3._ensureProductLayer.toString())&&/knock\(/.test(S3._ensureProductLayer.toString());

   // ===== P1) 융합 프롬프트 + 배선 =====
   const fp=Engine._imagePrompt({fuse:true});
   out.fusePrompt=/HARMONIZE PASS/.test(fp)&&/pixel-identical/.test(fp)&&/contact shadow/.test(fp)&&/No new objects/.test(fp);
   out.fuseS4Wired=/fuse:true/.test(S4.generate.toString())&&/_compositeExtras\(fused\)/.test(S4.generate.toString());
   out.fuseS3Fn=typeof S3.fuseProduct==='function';
   out.fuseRestamp=/재스탬프|그 위에/.test(S3.fuseProduct.toString()); // 레이어가 위에 그려져 재스탬프 성립(설계 주석)

   // ===== P1 모킹) 3단계 융합 — 배경 교체 + 제품 레이어 유지 =====
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const BG=solid('#3377cc'),FUSED=solid('#224466');
   await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[BG]=i;r();};i.src=BG;});
   await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[FUSED]=i;r();};i.src=FUSED;});
   App.brief={target:'t',offer:'o',funnel:'전환',channel:''};
   App.copies=[{id:'A',key:'테스트 카피',sub:'서브',cta:'CTA',tone:'직격'}];
   App.assets={products:[{id:'p1',url:BG,name:'p'}],refs:[]};
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;
   App.stage=3;UI.go(3);S3._ensureProductLayer();await new Promise(r=>setTimeout(r,120));
   App.keys.gemini='FAKE';
   const realGen=Engine.gen,realEdge=Engine._imgEdge;
   let fuseCalled=false;
   Engine.gen=async(kind,payload)=>{if(payload&&payload.fuse){fuseCalled=true;return FUSED;}return BG;};
   Engine._imgEdge=async()=>1;
   await S3.fuseProduct();
   out.fuseCalled=fuseCalled;
   out.fuseBgSwapped=App.doc.bgImage===FUSED;
   out.fuseProductKept=(App.doc.layers||[]).some(l=>l.role==='product'&&!l.hidden); // 레이어(원본)가 위에 남아 재스탬프
   Engine.gen=realGen;Engine._imgEdge=realEdge;App.keys.gemini='';

   // ===== P3) 기획안 시트 =====
   out.planFn=typeof S3.exportPlan==='function';
   out.planBtn=[...document.querySelectorAll('.s3-tools button')].some(b=>/기획안 시트/.test(b.textContent));
   let dlName=null;const realDl=S4._dl;S4._dl=(url,name)=>{dlName=name;out.planPng=typeof url==='string'&&url.indexOf('data:image/png')===0;};
   await S3.exportPlan();
   out.planDl=/기획안시트/.test(dlName||'');
   S4._dl=realDl;

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['title','storeKey','fallbackChain','koReturns','koCornerTransparent','koLabelKept','koBodyKept','koSkipsTransparent','koSkipsPhoto','koWired','fusePrompt','fuseS4Wired','fuseS3Fn','fuseRestamp','fuseCalled','fuseBgSwapped','fuseProductKept','planFn','planBtn','planPng','planDl'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
