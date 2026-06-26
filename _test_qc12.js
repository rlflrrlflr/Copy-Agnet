const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const BG=solid('#3377cc');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.src=BG;});
   S3._img[BG]=window.__b;
   App.copies=[{id:'A',key:'1인 셀러의 시간 AI가 대신 뜁니다',sub:'워크플로우 70% 자율 실행',cta:'지금 설치하고 500 크레딧 받기',tone:'직격'}];
   App.brand.accent='#ff6a00';
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.stage=3;UI.go(3);S3.renderAll();
   // 헤드라인을 3단계에서 중간쯤(잘 읽히게) 배치
   var keyL=App.doc.layers.filter(l=>l.role==='key')[0];keyL.nx=0.07;keyL.ny=0.30;

   // 1) 레이아웃 가이드 — 텍스트 레이어 있으면 평평한 회색 위에 위치 렌더, dataURL 반환
   const g=Engine._layoutGuide();
   out.guideRenders = typeof g==='string' && g.indexOf('data:image')===0;
   // 가이드가 비어있지 않은(텍스트가 그려진) 픽셀을 포함 — 평평한 회색만이 아님
   out.guideHasContent = await new Promise(res=>{const im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=im.width;c.height=im.height;var x=c.getContext('2d');x.drawImage(im,0,0);var d=x.getImageData(0,0,c.width,c.height).data;var nonGray=0;for(var i=0;i<d.length;i+=4){if(Math.abs(d[i]-154)>40||Math.abs(d[i+1]-154)>40)nonGray++;}res(nonGray>500);};im.onerror=()=>res(false);im.src=g;});
   // 편집 캔버스 크기가 보존됨(가이드 렌더가 망가뜨리지 않음)
   out.canvasPreserved = $('editCanvas').width===RATIOS[App.doc.ratio][0];

   // 2) _imgParts 가 guide 를 별도 파트로 추가
   const partsWith=Engine._imgParts('x',null,false,null,BG);
   const partsWithout=Engine._imgParts('x',null,false,null,null);
   out.guideInParts = partsWith.filter(pt=>pt.inlineData).length===partsWithout.filter(pt=>pt.inlineData).length+1;

   // 3) final 프롬프트 경로 — 포즈 락 + 선명도 지시(베이스 있을 때)
   const fp=Engine._finalPrompt(App.doc,0,{},true);
   out.poseLock = /IDENTITY LOCK/.test(fp)&&/EXACT SAME pose/i.test(fp)&&/do NOT re-pose/i.test(fp);
   out.sharpKeep = /keep the photographic scene SHARP/i.test(fp)&&/do NOT soften, blur/i.test(fp);

   // 4) 고양이 오버레이 z-index가 모달(140)보다 위
   out.catAboveModal = parseInt(getComputedStyle(document.getElementById('catOverlay')).zIndex,10) >= 150;

   // 5) regenBg 가 로딩 스피너 표시(생성 중 v.loading=true)
   out.regenSpinner = /v\.loading=true;S4\.renderVariants\(\)/.test(S4.regenBg.toString());
   // 6) genRatio 가 _busyR 로 칸 스피너 표시 + renderExport가 스피너 렌더
   out.genRatioSpinner = /v\._busyR=it\.k;S4\.renderExport\(\)/.test(S4.genRatio.toString());
   out.exportCellSpinner = /v\._busyR===it\.k/.test(S4.renderExport.toString())&&/vspin/.test(S4.renderExport.toString());

   // 7) 가이드는 reframe(비율 내보내기)엔 안 붙음(디자인 변경 없이 비율만)
   out.noGuideOnReframe = /isFinal&&!p\.reframe\)\?Engine\._layoutGuide/.test(Engine._geminiImageOnce.toString());

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['guideRenders','guideHasContent','canvasPreserved','guideInParts','poseLock','sharpKeep','catAboveModal','regenSpinner','genRatioSpinner','exportCellSpinner','noGuideOnReframe'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
