/* 49차: Sonnet 5 thinking 기본ON 사고 / 본문없음 표면화 / 시뮬배너 오판 / 3사 진단 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   App.keys.claude='CK';App.keys.gemini='';App.provider='auto';UI.onKey&&0;
   // ── 요청 바디: thinking 명시 OFF · max_tokens 상향 · temperature 제거 ──
   let sent=null;const realT=Engine._tfetch;
   Engine._tfetch=async(url,opt)=>{sent={url,body:JSON.parse(opt.body)};
     return {ok:true,status:200,json:async()=>({content:[{type:'text',text:'{"copies":[]}'}],stop_reason:'end_turn'}),text:async()=>''};};
   try{await Engine._claude('copies',{});}catch(e){}
   out.thinkingOff=sent&&sent.body.thinking&&sent.body.thinking.type==='disabled';
   out.noTemp=sent&&!('temperature' in sent.body);
   out.maxTokUp=sent&&sent.body.max_tokens>=8000;
   out.modelSonnet5=sent&&sent.body.model==='claude-sonnet-5';
   // ── 재현: thinking이 예산을 다 써 text 블록이 없는 응답 → 조용히 넘어가지 않고 에러로 표면화 ──
   Engine._tfetch=async()=>({ok:true,status:200,json:async()=>({content:[{type:'thinking',thinking:''}],stop_reason:'max_tokens'}),text:async()=>''});
   let msg='';try{await Engine._claude('copies',{});}catch(e){msg=e.message;}
   out.emptyClaudeSurfaced=/본문이 없음/.test(msg)&&/max_tokens/.test(msg);
   // ── Gemini도 동일 방어(finishReason 표면화) ──
   App.keys.gemini='GK';
   Engine._tfetch=async()=>({ok:true,status:200,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{thought:true,text:'x'}]}}]}),text:async()=>''});
   let gmsg='';try{await Engine._geminiText('copies',{});}catch(e){gmsg=e.message;}
   out.emptyGeminiSurfaced=/본문이 없음/.test(gmsg)&&/MAX_TOKENS/.test(gmsg);
   Engine._tfetch=realT;
   // ── 시뮬 배너: 카피가 시뮬이면, 이후 '수정' 성공에도 배너가 유지돼야 함 ──
   const rc=Engine._claude,rg=Engine._geminiText;
   Engine._claude=async()=>{throw new Error('down');};Engine._geminiText=async()=>{throw new Error('down');};
   await Engine.gen('copies',{});                 // 실패 → 시뮬 카피
   out.simFlagged=App.simMode===true;
   Engine._claude=async()=>({key:'x'});           // 이후 '수정'만 성공
   await Engine.gen('refine',{});
   out.simBannerKept=App.simMode===true;          // 카피는 여전히 시뮬 → 배너 유지되어야 함
   await Engine.gen('copies',{});                 // 카피를 실제로 다시 받으면
   out.simCleared=App.simMode===false;            // 그때만 해제
   Engine._claude=rc;Engine._geminiText=rg;
   // ── 진단: 3사 전부 + 현재 배정 표시 ──
   const d=Engine.diagnose.toString();
   out.diagClaude=/api\.anthropic\.com/.test(d)&&/⑤ Claude/.test(d);
   out.diagOpenAI=/api\.openai\.com/.test(d)&&/⑥ OpenAI/.test(d);
   out.diagAssign=/현재 배정/.test(d);
   let alerted='';window.alert=m=>alerted=m;
   App.keys.gemini='';App.keys.claude='';App.keys.openai='';
   await Engine.diagnose();
   out.diagNoKeys=/키가 하나도 없습니다/.test(alerted);
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['thinkingOff','noTemp','maxTokUp','modelSonnet5','emptyClaudeSurfaced','emptyGeminiSurfaced','simFlagged','simBannerKept','simCleared','diagClaude','diagOpenAI','diagAssign','diagNoKeys'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
