/* 30차: 무손실 보존안 / 4단계 제품 게이트 / 배경 뱃지 금지 / 결함점검 가시화·라우팅 */
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
   const BG=solid('#3377cc'),PROD=solid('#ffcc00');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.src=BG;});
   S3._img[BG]=window.__b;
   App.brief={target:'t',offer:'비타민C 구미 620mg',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['620mg']};
   App.assets.products=[{id:'p1',name:'prod',url:PROD}];
   App.copies=[{id:'A',key:'입이 즐거운 비타민C',sub:'맛있는 하루 2구미',cta:'자세히 보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;

   // 1) 배경 생성 프롬프트 — 뱃지/판촉물 전면 금지(신규+대화편집 모두)
   const ipFresh=Engine._imagePrompt({layoutType:'product-shot'});
   out.bgBadgeBan = /do NOT draw any badge, sticker, seal, coupon/i.test(ipFresh)&&/promo banner in ANY language/i.test(ipFresh);
   const ipEdit=Engine._imagePrompt({baseEdit:BG,fb:'하늘 더 파랗게'});
   out.bgEditBadgeBan = /do NOT add ANY badge, sticker, seal, coupon/i.test(ipEdit);

   // 2) 4단계 베이스 제품 라벨 락
   const fp=Engine._finalPrompt(App.doc,0,{},true);
   out.productLock = /PRODUCT LOCK \(brand property\)/.test(fp)&&/NEVER re-typeset, redraw, translate/i.test(fp)&&/attached original product photo/i.test(fp);

   // 3) S4.generate — 제품 검증 게이트 + 무손실 보존안 4번째 슬롯 (UI.go(4)는 자동 생성을 트리거하므로 직접 상태만 설정)
   App.stage=4;App.keys.gemini='FAKE';
   const gsrc=S4.generate.toString();
   out.s4pqcWired = /productCheck\(raw\)/.test(gsrc)&&/CRITICAL RETRY: the branded product\/label was ALTERED/.test(gsrc);
   out.losslessCode = /lossless:true/.test(gsrc)&&/보존안/.test(gsrc);
   // 실제 실행(모킹): 3 AI안 + 4번째 무손실
   const realGen=Engine.gen,realEdge=Engine._imgEdge,realPqc=Engine.productCheck;
   Engine.gen=async()=>BG;Engine._imgEdge=async()=>1;Engine.productCheck=async()=>({ok:true,issues:[]});
   App.final={variants:[],pick:0};
   await S4.generate();
   out.fourVariants = App.final.variants.length===4 && App.final.variants[3].lossless===true;
   out.losslessHasBg = !!App.final.variants[3].bg;
   S4.renderVariants();
   out.losslessLabel = /100% 보존|무손실/.test(document.getElementById('variantList').textContent);
   // 제품 왜곡 시 재시도 경로: productCheck가 한 번 fail → gen 추가 호출
   let genCalls=0,pqcCalls=0;
   Engine.gen=async()=>{genCalls++;return BG;};
   Engine.productCheck=async()=>{pqcCalls++;return pqcCalls===1?{ok:false,issues:['라벨 왜곡']}:{ok:true,issues:[]};};
   App.final={variants:[],pick:0};
   await S4.generate();
   out.retryOnAltered = genCalls>3; // 3안 + 최소 1회 재생성
   Engine.gen=realGen;Engine._imgEdge=realEdge;Engine.productCheck=realPqc;

   // 4) 결함점검 가시화 — 채팅 말풍선 사용 + 무손실 안내
   const qsrc=S4.qcFix.toString();
   out.qcLogs = /S4\._log\("ai"/.test(qsrc)&&/결함 발견/.test(qsrc)&&/게재 가능 품질입니다/.test(qsrc);
   out.qcLosslessMsg = /무손실 렌더\)이라 점검 대상이 아니에요/.test(qsrc);
   // 채팅 라우팅: "결함 검사" 언급 시 qcFix 연계
   out.chatRoutesQc = /결함\|점검\|검사\|검수/.test(S4.refine.toString())&&/await S4\.qcFix\(\)/.test(S4.refine.toString());

   // 5) 버튼 설명 캡션
   const cap=[...document.querySelectorAll('.s4-side .tiny.muted')].map(e=>e.textContent).join(' ');
   out.buttonCaption = /결함 점검.*자동 보정/.test(cap)&&/이전 버전/.test(cap)&&/스타일/.test(cap);

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['bgBadgeBan','bgEditBadgeBan','productLock','s4pqcWired','losslessCode','fourVariants','losslessHasBg','losslessLabel','retryOnAltered','qcLogs','qcLosslessMsg','chatRoutesQc','buttonCaption'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
