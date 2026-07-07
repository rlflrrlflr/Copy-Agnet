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
   out.regenWired=/creative:cr,fresh:cr/.test(S4.regenBg.toString())&&/chatRefs:Refs\.images\(\)/.test(S4.regenBg.toString());
   out.guideSkip=/!p\.creative\)\?Engine\._layoutGuide/.test(Engine._geminiImageOnce.toString());
   // 정밀 모드는 기존 그대로(스펙 JSON 포함)
   out.precisionIntact=/"el":"headline"/.test(fpP)&&/NO DECORATIVE SHAPES/.test(fpP);

   // ===== 5b) 울트라 검증 수정분 — 21건 확정 결함 배선 =====
   const gsrc=S4.generate.toString(),rsrc=S4.refine.toString(),qsrc=S4.qcFix.toString();
   out.fxRetryFlags = /CRITICAL RETRY/.test(gsrc) && /creative:_creative,fresh:_creative,chatRefs:batchRefs,\n/.test(gsrc.replace(/\r/g,'')) || (gsrc.match(/creative:_creative,fresh:_creative/g)||[]).length>=2; // 본호출+재시도 모두
   out.fxGenChatRefs = /chatRefs:batchRefs/.test(gsrc);
   out.fxCreativeOnce = /1회 캡처/.test(gsrc) && !/for\(var i=0;i<n;i\+\+\)\{\s*try\{\s*var _creative/.test(gsrc);
   out.fxFallbackLineage = (gsrc.match(/fallback:true,creative:_creative/g)||[]).length>=2;
   out.fxRefineCreative = /creative:!!v\.creative,fresh:!!v\.creative&&!keep/.test(rsrc);
   out.fxLayoutEditSkip = /v\.full&&keep&&!v\.creative/.test(rsrc);
   out.fxQcCreative = /creative:!!v\.creative/.test(qsrc);
   out.fxModeLock = /생성 중에는 모드를 바꿀 수 없어요/.test(S4.setMode.toString());
   App.final.variants=[{bg:'a'},{bg:'b'}]; // 타게팅은 존재하는 안만 반환하므로 더미 시드
   out.fxMention = S4._variantFromText('크리에이티브 2만 바꿔줘')===1;
   App.final.variants=[];
   out.fxStoreFallback = /soszae_v30/.test(Store.load.toString());
   // CTA 기본색이 브랜드 악센트를 따름
   App.brand.accent='#22aa66';
   var c2=Doc.cta('테스트',{});
   out.fxCtaAccent = c2.bg==='#22aa66';
   // 크리에이티브 프롬프트 강화: 디테일 예약·시드·EDIT·비주얼포맷·JSON안전
   App.doc.layers.push({id:'dt',type:'image',role:'detail',shape:'circle',src:BG,nx:.6,ny:.58,wx:.3,ar:1,hidden:false,z:50});
   const fpD=Engine._finalPrompt(App.doc,0,{creative:true,seed:3},false);
   out.fxDetailReserve = /REAL product detail inset/.test(fpD)&&/60%\/58%/.test(fpD);
   out.fxSeedLine = /Creative seed for THIS option/.test(fpD);
   out.fxVisualFmt = /Visual format: compose as/.test(fpD)&&/brand accent color/.test(fpD);
   const fpE=Engine._finalPrompt(App.doc,0,{creative:true,baseOverride:'X'},false);
   out.fxEditMode = /EDIT MODE: the FIRST attached image is the CURRENT approved creative design/.test(fpE)&&!/option #1 of 3/.test(fpE);
   // JSON 안전: 카피에 큰따옴표 포함돼도 구획 유지
   var keyL2=App.doc.layers.filter(l=>l.role==='key')[0];var oldKey=keyL2.text;keyL2.text='그는 "최고"라 말했다';
   const fpQ=Engine._finalPrompt(App.doc,0,{creative:true},false);
   out.fxJsonSafe = fpQ.indexOf('headline="그는 \\"최고\\"라 말했다"')>=0;
   keyL2.text=oldKey;
   App.doc.layers=App.doc.layers.filter(l=>l.id!=='dt');

   // ===== 5c) 35차 UX 정리 — 중복 힌트 제거·4단계 사용성 =====
   out.uxTopHintClean = !document.querySelector('.statusbar').textContent.includes('미세이동'); // 상단바 중복 힌트 제거(하단 힌트만 유지)
   out.uxToolbarSep = document.querySelectorAll('.s3-tools .tb-sep').length===2; // 요소|배경|출력 그룹 구분선
   out.uxAlignLabel = /글자 정렬/.test(S3.props.toString()); // '정렬' 라벨 모호성 해소
   // mount 부작용(자동 generate) 없이 스테이지 4 표시만 전환해 측정
   App.stage=4;[1,2,3,4].forEach(s=>document.getElementById('stage'+s).classList.toggle('hidden',s!==4));
   var _g=document.getElementById('s4gen'),_gr=_g.getBoundingClientRect(),_pr=_g.parentElement.getBoundingClientRect();
   out.uxGenFullWidth = _gr.width>=250 && Math.abs(_gr.width-_pr.width)<26; // 주 버튼 전폭 — 클리핑 불가
   var _mb=document.querySelectorAll('#s4modeSeg button');
   out.uxModeTwoLine = [..._mb].length===2 && [..._mb].every(function(x){return x.querySelector('b')&&x.querySelector('small');}); // 제목+설명 2줄 구조

   // ===== 5d) 36차 — z순서·컬러컨트롤·QC조용히·s4정리·워치독 =====
   App.stage=3;[1,2,3,4].forEach(s=>document.getElementById('stage'+s).classList.toggle('hidden',s!==3));
   out.zFn = typeof S3.zorder==='function';
   var keyL3=App.doc.layers.filter(l=>l.role==='key')[0];
   App.doc.layers.push({id:'shp1',type:'shape',shape:'rect',nx:.1,ny:.25,wx:.6,hy:.2,fill:'#ffffff',alpha:.9,rad:.18,rot:0,z:Doc._z(),hidden:false,locked:false});
   App.sel=keyL3.id;App.sels=[keyL3.id];
   var shp=App.doc.layers.filter(l=>l.id==='shp1')[0];
   out.zBehindBefore = keyL3.z<shp.z; // 도형이 나중 추가라 글자를 가림(사용자 보고 상황)
   S3.zorder('front');
   out.zFrontWorks = keyL3.z>shp.z;  // 맨 앞으로 → 도형 위에 글자
   S3.zorder('down');
   out.zStepWorks = keyL3.z<shp.z;   // 한 칸 뒤로 → 다시 도형 아래(스왑 동작)
   S3.zorder('front');
   S3.props();
   out.zButtons = /맨 앞/.test($("propBody").textContent)&&/뒤로/.test($("propBody").textContent);
   out.colorCtlFn = typeof S3._colorCtl==='function';
   out.noNativeColor = !document.querySelector('input[type="color"]'); // OS 색 대화상자 전면 제거(스포이드 먹통 방지)
   out.hexInputWorks = (function(){var picked=null;var w=S3._colorCtl('#ffffff',function(v){picked=v;});var hx=w.querySelector('input');hx.value='#123abc';hx.onchange();return picked==='#123abc';})();
   App.doc.layers=App.doc.layers.filter(l=>l.id!=='shp1');
   out.qcQuiet = /S2\.render\(true\)/.test(S2.qcPass.toString()) && /noanim/.test(S2.render.toString());
   out.noStyleSel = !document.getElementById('s4style');
   out.noFreeChk = !document.getElementById('s4free');
   out.tfetchFn = typeof Engine._tfetch==='function';
   out.tfetchWired = /_tfetch/.test(Engine._geminiImageOnce.toString()) && /_tfetch/.test(Engine.productCheck.toString()) && /_tfetch/.test(Engine._geminiText.toString());
   out.genFinally = /finally/.test(S4.generate.toString()) && /응답하지 않아/.test(S4.generate.toString());
   out.s1timer = /s1elapsed/.test(S1.analyze.toString());

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
 const keys=['title','storeKey','noModeSeg','proAlwaysOn','modeNoop','noAccentInput','accentFromCta','modeSeg','modeSet','segToggled','cFree','cIntent','cMandatory','cNoSpec','cNoDecoBan','cNoTreatment','cLogoRule','cVertSafe','cOption','cRefs','genWired','regenWired','guideSkip','precisionIntact','fxRetryFlags','fxGenChatRefs','fxCreativeOnce','fxFallbackLineage','fxRefineCreative','fxLayoutEditSkip','fxQcCreative','fxModeLock','fxMention','fxStoreFallback','fxCtaAccent','fxDetailReserve','fxSeedLine','fxVisualFmt','fxEditMode','fxJsonSafe','uxTopHintClean','uxToolbarSep','uxAlignLabel','uxGenFullWidth','uxModeTwoLine','zFn','zBehindBefore','zFrontWorks','zStepWorks','zButtons','colorCtlFn','noNativeColor','hexInputWorks','qcQuiet','noStyleSel','noFreeChk','tfetchFn','tfetchWired','genFinally','s1timer','allCreativeCalls','creativeNames','losslessStill'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
