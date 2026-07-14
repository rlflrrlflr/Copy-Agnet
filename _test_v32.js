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

   // ===== 40차) 융합 제거 + 기본 경로 복귀 =====
   out.fuseRemoved=!/fuse:true/.test(S4.generate.toString())&&/제거됐어요/.test(S3.fuseProduct.toString());
   out.legacyDefault=!/_ensureProductLayer\(\); \/\/ 제품은 레이어로/.test(S3.genImage.toString()); // 자동 레이어 생성 없음
   out.optInBtn=[...document.querySelectorAll('button')].some(b=>/제품을 레이어로/.test(b.textContent));

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
   // 기본 생성 경로: 자동 제품 레이어가 생기지 않음(사용자가 버튼 눌러야만)
   App.doc.layers=App.doc.layers.filter(l=>l.role!=='product');App.doc._prodLayerDeleted=false;
   App.keys.gemini='FAKE';
   const realGen=Engine.gen,realEdge=Engine._imgEdge,realPqc=Engine.productCheck;
   let sceneOnlySent=null;Engine.gen=async(kind,payload)=>{if(kind==='image')sceneOnlySent=!!payload.sceneOnly;return BG;};
   Engine._imgEdge=async()=>1;Engine.productCheck=async()=>({ok:true,issues:[]});
   await S3.genImage();
   out.legacyInScene=sceneOnlySent===false&&!(App.doc.layers||[]).some(l=>l.role==='product'); // 씬에 그림(기존)·레이어 자동생성 없음
   Engine.gen=realGen;Engine._imgEdge=realEdge;Engine.productCheck=realPqc;App.keys.gemini='';

   // ===== P3) 기획안 시트 =====
   out.planFn=typeof S3.exportPlan==='function';
   out.planBtn=[...document.querySelectorAll('.s3-tools button')].some(b=>/기획안 시트/.test(b.textContent));
   // PPTX: zip 시그니처(PK) + 슬라이드 XML에 편집 가능 텍스트 포함
   const zres=S3._zip([['t.xml','<a>hi</a>']]);
   out.planZipPK=zres[0]===0x50&&zres[1]===0x4b;
   out.planPptx=/pptx/.test(S3.exportPlan.toString())&&/slide1\.xml/.test(S3.exportPlan.toString())&&/<a:t>/.test(S3.exportPlan.toString());

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['title','storeKey','fallbackChain','koReturns','koCornerTransparent','koLabelKept','koBodyKept','koSkipsTransparent','koSkipsPhoto','koWired','fuseRemoved','legacyDefault','optInBtn','legacyInScene','planFn','planBtn','planZipPK','planPptx'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
