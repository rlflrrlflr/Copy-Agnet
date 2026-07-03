/* v31: 크리에이티브/정밀 모드 분리 · Lite/Pro 통합 · 악센트 UI 제거(CTA색 따름) */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v31_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v31');}catch(e){}
   const out={};
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const BG=solid('#3377cc'),LOGO=solid('#ff8800');
   await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[BG]=i;r();};i.src=BG;});
   await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[LOGO]=i;r();};i.src=LOGO;});

   // ===== 0) v31 정체성 =====
   out.title=/v31/.test(document.title);
   out.storeKey=Store.KEY==='soszae_v31';

   // ===== 1) Lite/Pro 통합 =====
   out.noModeSeg=!document.getElementById('mQuick')&&!document.getElementById('mFull');
   const pb=document.getElementById('proBox');
   out.proAlwaysOn=!!pb&&!pb.classList.contains('hidden');
   out.modeNoop=(function(){try{S1.mode('full');return true;}catch(e){return false;}})();

   // ===== 2) 악센트 UI 제거 + CTA색 따름 =====
   out.noAccentInput=!document.getElementById('brandAccent');
   App.brief={target:'2030 올리브영 관심자',offer:'네이처메이드 비타민C 구미 620mg',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['620mg','구미']};
   App.brand.logo=LOGO;App.brand.accent='#e60023';
   App.copies=[{id:'A',key:'입이 즐거운 비타민C',sub:'맛있는 하루 2구미',cta:'혜택 받기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;S3.ensureLogo();
   var ctaL=App.doc.layers.filter(l=>l.type==='cta')[0];ctaL.bg='#123456';
   const fpP=Engine._finalPrompt(App.doc,0,{},true);
   out.accentFromCta=/#123456/.test(fpP)&&!/"accent":"#e60023"/.test(fpP);

   // ===== 3) 모드 seg + setMode =====
   out.modeSeg=!!document.getElementById('s4modeSeg')&&document.querySelectorAll('#s4modeSeg button').length===2;
   S4.setMode('creative',document.querySelectorAll('#s4modeSeg button')[1]);
   out.modeSet=App.final.mode==='creative';
   out.segToggled=document.querySelectorAll('#s4modeSeg button')[1].classList.contains('on');

   // ===== 4) 크리에이티브 프롬프트 — 자유 보장 + 의도/필수요소 고정 =====
   const fpC=Engine._finalPrompt(App.doc,0,{creative:true},false);
   out.cFree=/FULL creative freedom/i.test(fpC)&&/Do NOT feel bound by any previous layout/i.test(fpC);
   out.cIntent=/PLANNING INTENT/.test(fpC)&&/honor the SPIRIT of the plan, not its layout/i.test(fpC)&&/funnel stage=전환/.test(fpC);
   out.cMandatory=/MANDATORY CONTENT/.test(fpC)&&fpC.indexOf('입이 즐거운 비타민C')>=0&&fpC.indexOf('혜택 받기')>=0&&/Do NOT invent any other words/i.test(fpC);
   // 하드룰 미포함(자유를 죽이던 것들)
   out.cNoSpec=!/"el":"headline"/.test(fpC)&&!/Reproduce EXACTLY this layout spec/i.test(fpC);
   out.cNoDecoBan=!/NO DECORATIVE SHAPES/.test(fpC);
   out.cNoTreatment=!/DESIGN TREATMENT/.test(fpC)&&!/LAYOUT RULE/.test(fpC);
   // 자산·세이프존은 유지
   out.cLogoRule=/real logo is composited/i.test(fpC);
   App.doc.ratio='9:16';
   const fpCV=Engine._finalPrompt(App.doc,0,{creative:true},false);
   out.cVertSafe=/VERTICAL MEDIA SAFE ZONE \(STRICT\)/.test(fpCV)&&/between 16% and 80%/.test(fpCV);
   App.doc.ratio='1:1';
   // 옵션별 발산 + 자사 레퍼런스 지시
   out.cOption=/option #1 of 3/i.test(fpC)&&/clearly DIFFERENT creative direction/i.test(fpC);
   const fpCR=Engine._finalPrompt(App.doc,1,{creative:true,chatRefs:[LOGO]},false);
   out.cRefs=/past in-house ads/i.test(fpCR)&&/density, boldness and creative freedom/i.test(fpCR);

   // ===== 5) 배선 — generate/regenBg/가이드 =====
   out.genWired=/creative:_creative,fresh:_creative/.test(S4.generate.toString());
   out.regenWired=/creative:!!v\.creative/.test(S4.regenBg.toString());
   out.guideSkip=/!p\.creative\)\?Engine\._layoutGuide/.test(Engine._geminiImageOnce.toString());
   // 정밀 모드는 기존 그대로(스펙 JSON 포함)
   out.precisionIntact=/"el":"headline"/.test(fpP)&&/NO DECORATIVE SHAPES/.test(fpP);

   // ===== 6) 크리에이티브 실행 스모크(모킹) — 3안 + 이름/플래그 + 보존안 =====
   App.keys.gemini='FAKE';
   const realGen=Engine.gen,realEdge=Engine._imgEdge,realPqc=Engine.productCheck;
   let creativeFlags=[];
   Engine.gen=async(kind,payload)=>{if(payload&&payload.finalDoc)creativeFlags.push(!!payload.creative);return BG;};
   Engine._imgEdge=async()=>1;Engine.productCheck=async()=>({ok:true,issues:[]});
   App.stage=4;App.final={variants:[],pick:0,mode:'creative'};
   await S4.generate();
   out.allCreativeCalls=creativeFlags.length===3&&creativeFlags.every(f=>f===true);
   out.creativeNames=App.final.variants.slice(0,3).every(v=>/크리에이티브/.test(v.name))&&App.final.variants[0].creative===true;
   out.losslessStill=App.final.variants[3]&&App.final.variants[3].lossless===true;
   Engine.gen=realGen;Engine._imgEdge=realEdge;Engine.productCheck=realPqc;

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['title','storeKey','noModeSeg','proAlwaysOn','modeNoop','noAccentInput','accentFromCta','modeSeg','modeSet','segToggled','cFree','cIntent','cMandatory','cNoSpec','cNoDecoBan','cNoTreatment','cLogoRule','cVertSafe','cOption','cRefs','genWired','regenWired','guideSkip','precisionIntact','allCreativeCalls','creativeNames','losslessStill'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
