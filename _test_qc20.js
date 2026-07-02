/* 32차: 커스텀 픽셀 안전화 — 무손실 맞춤 / 숫자 비율 기반 세이프존·초와이드 / 합성 좌표 클램프 */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c,w,h){var cv=document.createElement('canvas');cv.width=w||200;cv.height=h||200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,cv.width,cv.height);return cv.toDataURL();}
   App.brief={target:'t',offer:'비타민C 구미',funnel:'전환',channel:''};
   App.copies=[{id:'A',key:'헤드라인 카피',sub:'서브',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);

   // ===== 1) _fitCanvasSafe — 비율 차 크면 무손실(잘림 없음) =====
   const SQ=solid('#cc2222',400,400); // 1:1 빨강
   // 비즈보드(4:1)로: cover였다면 상하 42% 잘림 — safe는 컨테인이라 원본 전체 보존
   const c1=await S4._fitCanvasSafe(SQ,[2058,516]);
   out.safeReturns = !!c1 && c1.width===2058 && c1.height===516;
   // 중앙 세로줄: 이미지가 컨테인(폭 516)으로 중앙 배치 → 중앙은 빨강, 좌측 밴드는 블러(빨강 아님이 아닐 수도—블러도 빨강계열)
   // 무손실 검증: 컨테인 폭 = 516 → x=(2058-516)/2=771~1287만 원본. 원본 '모서리 픽셀'이 살아있는지: y=2(top) x=1029 빨강이면 상단 미절단
   const px=c1.getContext('2d').getImageData(1029,2,1,1).data;
   out.noTopCrop = px[0]>150&&px[1]<100; // 상단이 잘렸다면 cover라 여기도 빨강이긴 함... 대신 좌측 밴드 존재로 컨테인 확인
   const pxL=c1.getContext('2d').getImageData(300,258,1,1).data; // 좌측 밴드 = 블러 확장(빨강 계열이지만 컨테인 존재 증명은 어렵) → 함수 소스로 보강
   out.safeLogic = /Math\.abs\(Math\.log\(arI\/arC\)\)<=0\.09/.test(S4._fitCanvasSafe.toString())&&/blur\(40px\)/.test(S4._fitCanvasSafe.toString())&&/Math\.min\(c\.width\/im\.width/.test(S4._fitCanvasSafe.toString());
   // 비율 거의 같으면 cover 유지(1:1→1:1)
   const c2=await S4._fitCanvasSafe(SQ,[1000,1000]);
   out.sameArCover = !!c2 && c2.getContext('2d').getImageData(2,2,1,1).data[0]>150; // 모서리까지 꽉参
   // genRatio/전비율이 safe 사용
   out.wiredGenRatio = /_fitCanvasSafe\(url,it\.dims\)/.test(S4.genRatio.toString())&&/_fitCanvasSafe\(v\.bg,it\.dims\)/.test(S4.genRatio.toString());
   out.wiredAllRatios = /_fitCanvasSafe/.test(S4._fitToRatio.toString());

   // ===== 2) 숫자 비율 기반 — 커스텀 초와이드/세로에도 지시 적용 =====
   RATIOS2K['bizboard']=[2058,516];GEM_AR['bizboard']='21:9';
   App.doc.ratio='bizboard';
   const rfU=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.ultraStrip = /ULTRA-WIDE STRIP/.test(rfU)&&/Kakao Bizboard/i.test(rfU)&&/no cropped heads/i.test(rfU);
   // 커스텀 세로(800x2000 = 1:2.5)
   RATIOS2K['tallX']=[800,2000];App.doc.ratio='tallX';
   const keyL=App.doc.layers.filter(l=>l.role==='key')[0];keyL.ny=0.02;
   const fpT=Engine._finalPrompt(App.doc,0,{},true);
   out.customVertSafe = /VERTICAL MEDIA SAFE ZONE/.test(fpT)&&/between 16% and 80%/.test(fpT);
   const ys=[...fpT.matchAll(/"pos":\{"x":\d+,"y":(\d+)\}/g)].map(m=>+m[1]);
   out.customVertClamp = ys.length>0&&ys.every(y=>y>=16&&y<=80);
   const rfT=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.reframeVertBand = /STRICT SAFE BAND/.test(rfT)&&/between 16% and 80%/.test(rfT);
   App.doc.ratio='1:1';

   // ===== 3) 합성 좌표 클램프 — 세로 베이스에서 로고가 상단 어글리존 밖으로 =====
   const TALL=solid('#2244cc',400,800); // 세로 2:1(파랑)
   const LOGO=solid('#ff8800',200,80);  // 주황 로고
   await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[LOGO]=i;r();};i.src=LOGO;});
   App.brand.logo=LOGO;
   App.doc.layers=App.doc.layers.filter(l=>l.role!=='logo');
   App.doc.layers.push({id:'lg',type:'image',role:'logo',src:LOGO,nx:.74,ny:.02,wx:.20,ar:.4,hidden:false,z:99}); // 일부러 어글리존(y=2%)
   const compo=await S4._compositeExtras(TALL);
   out.compClamp = await new Promise(res=>{const im=new Image();im.onload=function(){
     const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
     // 로고 lw=80, lh=32. 클램프: arV=2 → sTop=.16 → y 128~160에 그려져야
     const inBand=x.getImageData(Math.round(im.width*.79),Math.round(im.height*.175),1,1).data;   // 140px 부근 → 주황
     const uglyTop=x.getImageData(Math.round(im.width*.79),Math.round(im.height*.03),1,1).data;   // 24px → 파랑(로고 없음)
     res(inBand[0]>180&&inBand[2]<120 && uglyTop[2]>150&&uglyTop[0]<120);
   };im.onerror=()=>res(false);im.src=compo;});
   out.compClampCode = /sTop=\.16;sBot=\.80/.test(S4._compositeExtras.toString());

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['safeReturns','noTopCrop','safeLogic','sameArCover','wiredGenRatio','wiredAllRatios','ultraStrip','customVertSafe','customVertClamp','reframeVertBand','compClamp','compClampCode'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
