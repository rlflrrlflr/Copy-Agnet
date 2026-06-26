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
   App.copies=[{id:'A',key:'이커머스 실무 전담 AI 에이전트',sub:'엔드투엔드 집행 완료',cta:'지금 설치하고 500 크레딧 받기',tone:'직격'}];
   App.brand.accent='#ff6a00';
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.stage=4;
   App.brief={target:'t',offer:'o',funnel:'전환',channel:''};

   // 1) 고양이 무대 height 키움(>=200px)
   out.catStageTaller=(function(){var s=[...document.styleSheets].some(function(ss){try{return[...ss.cssRules].some(function(r){return r.selectorText==='.cat-stage'&&parseInt(r.style.height)>=200;});}catch(e){return false;}});return s;})();

   // 2) 16:9 카피 좌측(정중앙 금지) — reframe + 일반 모두
   App.doc.ratio='16:9';
   const rf16=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.wideLeft=/anchor the COPY block to the LEFT/i.test(rf16)&&/clearly left of center/i.test(rf16)&&/NOT centered/i.test(rf16);
   const fp16=Engine._finalPrompt(App.doc,0,{},true);
   out.buyLeft=/anchored to the LEFT/i.test(fp16)&&/clearly LEFT of center/i.test(fp16);

   // 3) 세로형(9:16/4:5) 세이프존 — 스펙 좌표를 안전대 안으로 클램프
   const keyL=App.doc.layers.filter(l=>l.role==='key')[0];
   const ctaL=App.doc.layers.filter(l=>l.type==='cta')[0];
   keyL.ny=0.02; if(ctaL)ctaL.ny=0.97; // 일부러 세이프존 밖
   App.doc.ratio='9:16';
   const fp916=Engine._finalPrompt(App.doc,0,{},true);
   const ys=[...fp916.matchAll(/"pos":\{"x":\d+,"y":(\d+)\}/g)].map(m=>+m[1]);
   out.vertClamped = ys.length>0 && ys.every(y=>y>=16&&y<=80);
   out.vertStrictRule=/VERTICAL MEDIA SAFE ZONE.*STRICT/i.test(fp916)&&/COMPLETELY free of text/i.test(fp916);
   App.doc.ratio='1:1';

   // 4) 말로 고치기 — 위치/크기 의도 파싱
   out.parseDown=(function(){var o=S4._layoutEdit('텍스트를 조금 더 아래로 내려줘');return o&&o.dy>0;})();
   out.parseUp=(function(){var o=S4._layoutEdit('헤드라인 위로 올려줘');return o&&o.dy<0;})();
   out.parseLeft=(function(){var o=S4._layoutEdit('카피를 왼쪽으로');return o&&o.dx<0;})();
   out.parseBigger=(function(){var o=S4._layoutEdit('글씨 더 크게');return o&&o.ds>0;})();
   out.parseStyleNull=(S4._layoutEdit('더 고급스럽게')===null); // 스타일 수정은 좌표이동 아님

   // 5) 위치수정 적용 → 실제 레이어 ny 가 아래로 이동 + 클램프
   const before=keyL.ny=0.30;
   const moved=S4._applyLayoutEdit(S4._layoutEdit('텍스트 아래로'));
   out.applyMovesLayer = moved===true && keyL.ny>before;

   // 6) refine: 위치수정이면 '글자없는 배경'을 베이스로 다시 생성(기존 합성본 베끼지 않음)
   App.keys.gemini='FAKE';
   App._effBg='EFFBG_CLEAN';                 // 글자 없는 베이크 배경
   App.final={variants:[{bg:'COMPOSITED',bgClean:'CLEAN_W_TEXT',full:true,dir:0,name:'완성안 1',ratio:'1:1'}],pick:0};
   let cap=null;const realGen=Engine.gen,realCE=S4._compositeExtras;
   Engine.gen=async(kind,payload)=>{cap=payload;return BG;};
   S4._compositeExtras=async(u)=>u;
   const s4fb=document.getElementById('s4fb');s4fb.value='텍스트를 조금 더 아래로 내려줘';
   await S4.refine();
   out.refineUsesCleanBg = cap && cap.baseOverride==='EFFBG_CLEAN'; // 합성본(CLEAN_W_TEXT)이 아니라 글자없는 배경
   // 스타일 수정은 기존 승인본(bgClean) 베이스 유지
   App.final.variants[0].bgClean='CLEAN_STYLE';s4fb.value='더 고급스럽게';
   await S4.refine();
   out.styleUsesApproved = cap && cap.baseOverride==='CLEAN_STYLE';
   Engine.gen=realGen;S4._compositeExtras=realCE;

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['catStageTaller','wideLeft','buyLeft','vertClamped','vertStrictRule','parseDown','parseUp','parseLeft','parseBigger','parseStyleNull','applyMovesLayer','refineUsesCleanBg','styleUsesApproved'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
