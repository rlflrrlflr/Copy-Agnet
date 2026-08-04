/* 48차: 자동 모델 배정(우선순위) · Sonnet 5 · imgEngine 저장 복원 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   out.sonnet=MODELS.claude==='claude-sonnet-5';
   out.autoDefault=document.getElementById('provider').value==='auto'&&App.provider==='auto';
   const set=(g,c)=>{document.getElementById('geminiKey').value=g;document.getElementById('claudeKey').value=c;UI.onKey();};
   // 자동: 제미나이만 → 전부 제미나이
   set('G','');
   out.autoGeminiOnly=Engine.textProvider()==='gemini'&&/Gemini 3\.1 Pro/.test(document.getElementById('modeBadge').textContent);
   // 자동: 클로드 추가 → 겹치는 영역은 클로드 우선
   set('G','C');
   out.autoClaudeWins=Engine.textProvider()==='claude'&&/Claude Sonnet 5/.test(document.getElementById('modeBadge').textContent);
   // 자동: 클로드만 → 클로드
   set('','C');
   out.autoClaudeOnly=Engine.textProvider()==='claude';
   // 키 없음 → 시뮬
   set('','');
   out.noKeySim=Engine.textProvider()===''&&!App.live&&/시뮬레이터/.test(document.getElementById('modeBadge').textContent);
   // 고정 override: Gemini 고정이면 클로드 키 있어도 제미나이
   set('G','C');document.getElementById('provider').value='gemini';UI.onKey();
   out.forceGemini=Engine.textProvider()==='gemini';
   // 고정인데 키 없으면 있는 쪽으로 폴백
   set('','C');
   out.forceFallback=Engine.textProvider()==='claude';
   document.getElementById('provider').value='auto';set('G','C');
   // 실제 라우팅: 자동+클로드키 → _claude 호출
   let called='';const rc=Engine._claude,rg=Engine._geminiText;
   Engine._claude=async()=>{called='claude';return {copies:[]};};
   Engine._geminiText=async()=>{called='gemini';return {copies:[]};};
   await Engine.gen('copies',{});
   out.routesClaude=called==='claude';
   set('G','');called='';await Engine.gen('copies',{});
   out.routesGemini=called==='gemini';
   Engine._claude=rc;Engine._geminiText=rg;
   // 이미지는 항상 제미나이 계열(겹침 없음)
   out.imageStaysGemini=/_geminiImage|_openaiImage/.test(Engine._run.toString())&&!/textProvider\(\)[\s\S]{0,40}_geminiImage/.test(Engine._run.toString());
   // 46차 저장 버그: gemini-flash 선택이 그대로 저장·복원되는지
   set('G','C');document.getElementById('imgEngine').value='gemini-flash';UI.onKey();
   const saved=JSON.parse(localStorage.getItem('soszae_keys')||'{}');
   out.imgEngineSaved=saved.imgEngine==='gemini-flash'&&App.geminiImgModel==='gemini-3.1-flash-image';
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['sonnet','autoDefault','autoGeminiOnly','autoClaudeWins','autoClaudeOnly','noKeySim','forceGemini','forceFallback','routesClaude','routesGemini','imageStaysGemini','imgEngineSaved'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
