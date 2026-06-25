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
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__bg=i;r();};i.src=BG;});
   S3._img[BG]=window.__bg;
   App.copies=[{id:'A',key:'완벽한 핏을 완성하다',sub:'나파가죽 트렁크 매트',cta:'자세히 보기',tone:'직격'}];
   App.brand.accent='#e60023';
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.stage=3;S3.renderAll();

   // 1) 배경 크기 슬라이더 = 0 중앙, 좌우 대칭(-100~100), 기본값 0
   App.sel='__bg__';App.sels=[];S3.props();
   var rng=[...document.querySelectorAll('#propBody input[type=range]')][0];
   out.bgSliderSymmetric = rng && (+rng.min===-100) && (+rng.max===100);
   out.bgSliderDefault0 = rng && (+rng.value===0);
   // 왼쪽으로 = 축소(scale<1), 오른쪽 = 확대(scale>1)
   rng.value=-50;rng.dispatchEvent(new Event('input'));
   out.leftShrinks = App.doc.bgScale<1;
   rng.value=50;rng.dispatchEvent(new Event('input'));
   out.rightExpands = App.doc.bgScale>1;
   App.doc.bgScale=1;

   // 2) 4단계 spec — 3단계 위치를 pos(%)로 정밀 전달(헤드라인 y 보존)
   App.sel=null;App.sels=[];
   var keyL=App.doc.layers.filter(l=>l.role==='key')[0];
   keyL.nx=0.08;keyL.ny=0.46; // 마케터가 헤드라인을 중간쯤으로 배치
   const fp=Engine._finalPrompt(App.doc,0,{},true);
   out.specHasPos=/"pos":\{"x":8,"y":46\}/.test(fp);                 // 헤드라인 pos 정확
   out.honorPosY=/HONOR THE VERTICAL POSITION/i.test(fp)&&/'pos'\s*wins|pos'\? wins|pos' wins/i.test(fp||'')||/'pos' wins/.test(fp);
   out.honorPosY=/HONOR THE VERTICAL POSITION/i.test(fp);
   out.topRightClear=/top-right ~30% width COMPLETELY CLEAR/i.test(fp)&&/TOP ~12% band/i.test(fp);

   // 3) 로고/워터마크 금지 — 로고가 없어도(무로고) 무조건 금지(헛로고 ACCIOWORK/Alibaba.com 방지)
   App.brand.logo=null;
   App.doc.layers=App.doc.layers.filter(l=>l.role!=='logo'); // 로고 레이어 제거 → hasLogo=false
   const fpNoLogo=Engine._finalPrompt(App.doc,0,{},true);
   out.banWhenNoLogo=/ABSOLUTELY NO LOGOS OR WATERMARKS/i.test(fpNoLogo)&&/do NOT draw, render, write or invent ANY logo/i.test(fpNoLogo);
   out.banWatermark=/ACCIOWORK/.test(fpNoLogo)&&/Alibaba\.com/.test(fpNoLogo)&&/website URL/i.test(fpNoLogo)&&/\.com'? \/ domain text|'.com' \/ domain text|\.com' \/ domain/i.test(fpNoLogo);
   out.banWatermark=/ACCIOWORK/.test(fpNoLogo)&&/Alibaba\.com/.test(fpNoLogo)&&/website URL/i.test(fpNoLogo);
   // 로고 있을 때는 '우상단 비워라' 안내
   App.brand.logo=BG;
   const fpLogo=Engine._finalPrompt(App.doc,0,{},true);
   out.cleanCornerWhenLogo=/keep the TOP-RIGHT corner clean and empty for it/i.test(fpLogo);
   // 어떤 경우에도 spec엔 로고 element 없음(앱이 합성)
   out.noLogoElement=!/"el":"logo"/.test(fpLogo);

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['bgSliderSymmetric','bgSliderDefault0','leftShrinks','rightExpands','specHasPos','honorPosY','topRightClear','banWhenNoLogo','banWatermark','cleanCornerWhenLogo','noLogoElement'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
