/* v33(41차): GPT-Image 2 provider 분기 + 기본 셋팅(Gemini medium effort / GPT low quality) 배선 검증 */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   // ===== 0) v33 정체성 + 이전 세션 폴백 체인 =====
   out.title=/v33/.test(document.title);
   out.storeKey=Store.KEY==='soszae_v33';
   out.fallbackChain=/soszae_v32/.test(Store.load.toString())&&/soszae_v31/.test(Store.load.toString())&&/soszae_v30/.test(Store.load.toString());

   // ===== 1) 모델·기본 셋팅 상수 =====
   out.modelOai=MODELS.openaiImage==='gpt-image-2';
   out.modelGemKeep=MODELS.geminiText==='gemini-3.1-pro-preview'&&MODELS.geminiImage==='gemini-3-pro-image-preview';
   out.effortDefaults=(typeof GEM_EFFORT!=='undefined'&&GEM_EFFORT==='medium')&&(typeof OAI_QUALITY!=='undefined'&&OAI_QUALITY==='low');
   out.oaiSizes=OAI_SIZE['1:1']==='1024x1024'&&OAI_SIZE['4:5']==='1024x1280'&&OAI_SIZE['16:9']==='1536x864'&&OAI_SIZE['9:16']==='864x1536';
   out.gemEffortWired=/thinkingLevel:GEM_EFFORT/.test(Engine._geminiText.toString())&&/thinkingLevel:GEM_EFFORT/.test(Engine._geminiResearch.toString());

   // ===== 2) 헤더 UI — 이미지 엔진 셀렉트 + OpenAI 키 입력 =====
   out.uiImgEngine=!!document.getElementById('imgEngine')&&document.getElementById('imgEngine').value==='gemini';
   out.uiOaiKey=!!document.getElementById('openaiKey')&&document.getElementById('openaiKey').type==='password';
   // onKey가 imgProvider·openai 키를 읽는지 + 배지 라벨
   document.getElementById('openaiKey').value='sk-test';
   document.getElementById('geminiKey').value='g-test';
   document.getElementById('imgEngine').value='openai';
   UI.onKey();
   out.stateWired=App.imgProvider==='openai'&&App.keys.openai==='sk-test';
   out.badgeOai=/GPT-Image 2 이미지/.test(document.getElementById('modeBadge').textContent);
   document.getElementById('imgEngine').value='gemini';UI.onKey();
   out.badgeGem=/Nano Banana Pro 이미지/.test(document.getElementById('modeBadge').textContent);

   // ===== 3) Engine 분기 — _run이 imgProvider로 라우팅 =====
   const runSrc=Engine._run.toString();
   out.runBranch=/imgProvider==="openai"/.test(runSrc)&&/_openaiImage\(/.test(runSrc)&&/_geminiImage\(/.test(runSrc);

   // ===== 4) 공용 잡 빌더 — Gemini/OpenAI 동일 조립 =====
   out.jobShared=typeof Engine._imgJob==='function'&&/_imgJob\(/.test(Engine._geminiImageOnce.toString())&&/_imgJob\(/.test(Engine._openaiImageOnce.toString());
   // _imgJob이 base/guide/prompt 규칙(v32와 동일)을 유지하는지
   const jobSrc=Engine._imgJob.toString();
   out.jobRules=/baseOverride/.test(jobSrc)&&/baseEdit/.test(jobSrc)&&/_layoutGuide/.test(jobSrc)&&/LAYOUT GUIDE/.test(jobSrc)&&/creative/.test(jobSrc);

   // ===== 5) 게이트 공용화 — 두 provider 모두 엣지 게이트+재시도 경유 =====
   out.gateShared=typeof Engine._imageGate==='function'&&/_imageGate\(Engine\._geminiImageOnce/.test(Engine._geminiImage.toString())&&/_imageGate\(Engine\._openaiImageOnce/.test(Engine._openaiImage.toString());
   out.gateLogic=/_imgEdge/.test(Engine._imageGate.toString())&&/CRITICAL RETRY/.test(Engine._imageGate.toString());

   // ===== 6) OpenAI 어댑터 형태 — edits(멀티 image[])/generations 분기 + 사이즈/퀄리티 + 에러/무응답 방어 =====
   const oa=Engine._openaiImageOnce.toString();
   out.oaEndpoints=/images\/edits/.test(oa)&&/images\/generations/.test(oa);
   out.oaMultiRef=/image\[\]/.test(oa)&&/FormData/.test(oa);
   out.oaAttachOrder=oa.indexOf('job.base')<oa.indexOf('products')&&oa.indexOf('products')<oa.indexOf('refs')&&oa.indexOf('chatRefs')<oa.indexOf('job.guide');
   out.oaQuality=/OAI_QUALITY/.test(oa)&&/OAI_SIZE/.test(oa);
   out.oaGuards=/GPT IMG/.test(oa)&&/이미지 응답 없음/.test(oa);
   // dataURL→Blob 변환 실동작
   const blob=Engine._dataURLBlob('data:image/png;base64,'+btoa('abc'));
   out.oaBlob=blob instanceof Blob&&blob.size===3&&blob.type==='image/png';

   // ===== 7) 워치독 — OpenAI 이미지도 180초 =====
   out.watchdog=/\/images\//.test(Engine._tfetchOnce.toString())&&/429/.test(Engine._tfetch.toString()); // 50차: 워치독은 _tfetchOnce, _tfetch는 429 백오프 래퍼

   // ===== 42차) 융합 부활 — 마스크 인페인팅 =====
   const fu=S3.fuseProduct.toString();
   out.fuseReal=!/제거됐어요/.test(fu)&&/images\/edits/.test(fu)&&/"mask"/.test(fu.replace(/'/g,'"'));
   out.fusePolarity=/dd\[i\]>10/.test(fu)&&/255/.test(fu); // 제품 알파=불투명 보존, 나머지 투명=편집
   out.fuseVerify=/보존 검증/.test(fu)&&/avg>30/.test(fu);
   out.fuseRestamp=/재스탬프/.test(fu)&&/vx\.drawImage\(pim/.test(fu)&&fu.indexOf('vx.drawImage(pim')>fu.indexOf('avg>30'); // AI 결과 위에 원본 재스탬프(게이트 이후)
   out.fuseDedup=/hidden=true/.test(fu)&&/_prodLayerDeleted=true/.test(fu); // 융합 후 레이어 숨김(중복 방지)
   out.fuseGuards=/OpenAI 키가 필요/.test(fu)&&/배경 이미지를 먼저/.test(fu);
   out.fuseBtn=[...document.querySelectorAll('button')].some(b=>/제품 융합/.test(b.textContent));

   // ===== 42차) 키 저장·복원(HTML 단독) + 로컬 서버 자동 주입 =====
   out.keysSaved=(function(){try{var k=JSON.parse(localStorage.getItem('soszae_keys'));return k&&typeof k.openai==='string';}catch(e){return false;}})();
   localStorage.setItem('soszae_keys',JSON.stringify({gemini:'g-persist',claude:'',openai:'o-persist',provider:'gemini',imgEngine:'openai'}));
   document.getElementById('geminiKey').value='';document.getElementById('openaiKey').value='';
   UI.restoreKeys();
   out.keysRestored=document.getElementById('geminiKey').value==='g-persist'&&document.getElementById('openaiKey').value==='o-persist'&&document.getElementById('imgEngine').value==='openai';
   out.serverAutofill=typeof UI.fetchLocalKeys==='function'&&/\/keys/.test(UI.fetchLocalKeys.toString())&&/file:/.test(UI.fetchLocalKeys.toString());
   // 복원 후 원상복구(아래 회귀는 무키 시뮬 경로)
   localStorage.removeItem('soszae_keys');
   document.getElementById('imgEngine').value='gemini';

   // ===== 43차) 생성 출처 표기 + 에코 가드 =====
   out.provSet=/lastProv=\(_gm===MODELS\.geminiImageFlash\?"🍌 Nano Banana 2/.test(Engine._geminiImageOnce.toString())&&/lastProv="🧠 GPT-Image 2/.test(Engine._openaiImageOnce.toString());
   out.provCard=/v\.prov\|\|"모델 미기록"/.test(S4.renderVariants.toString().replace(/\s/g,'').replace(/\|\|/g,'||'))||/모델 미기록/.test(S4.renderVariants.toString());
   out.provGen=/prov:Engine\.lastProv/.test(S4.generate.toString());
   out.provRegen=(document.documentElement.outerHTML.match(/v\.prov=Engine\.lastProv/g)||[]).length>=3; // 다른 버전·결함 보정·말로 고치기 경로도 갱신
   out.provHint=/배경 생성 완료 · /.test(S3.genImage.toString())&&/Engine\.lastProv/.test(S3.chat.toString());
   const oa2=Engine._openaiImageOnce.toString();
   out.echoGuard=/REFERENCE ONLY/.test(oa2)&&/!job\.base/.test(oa2); // 베이스 없을 때만 '새 구성' 강제(베이스 편집은 유지)

   // ===== 8) 회귀 — 시뮬 폴백/카피 흐름 무손상 스모크 =====
   document.getElementById('openaiKey').value='';document.getElementById('geminiKey').value='';UI.onKey();
   document.getElementById('inTarget').value='테스트 타겟';document.getElementById('inOffer').value='나파가죽 트렁크매트';
   App.brief.funnel='전환';
   await S1.analyze();
   out.simFlow=(App.copies||[]).length===5;
   return out;
 });

 await b.close();
 let pass=0,fail=0;
 for(const k of Object.keys(R)){const ok=!!R[k];console.log((ok?'PASS':'FAIL')+' '+k);ok?pass++:fail++;}
 if(errs.length){console.log('PAGE ERRORS:',errs.slice(0,5));}
 console.log(`${pass} pass / ${fail} fail / pageErrors ${errs.length}`);
 process.exit(fail||errs.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
