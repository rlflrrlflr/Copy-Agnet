/* 47차: Gemini 연결 진단 · 원인 해석기 · 에러 절단 해소 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   // 원인 해석기 매핑
   out.whyKey=/키가 유효하지 않음/.test(Engine._why('{"error":{"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}'));
   out.whyRef=/사이트 제한/.test(Engine._why('Requests from referer <empty> are blocked.'));
   out.whyBill=/결제/.test(Engine._why('{"error":{"status":"FAILED_PRECONDITION","message":"billed users only"}}'));
   out.whyQuota=/할당량/.test(Engine._why('RESOURCE_EXHAUSTED quota exceeded'));
   out.why404=/못 씀/.test(Engine._why('models/x is not found for API version v1beta'));
   out.whyNet=/네트워크 차단/.test(Engine._why('Failed to fetch'));
   // 에러 전문 보존(40자 절단 제거) + lastError 저장
   out.noTrunc=!/slice\(0,40\)/.test(Engine._run.toString())&&/Engine\.lastError=/.test(Engine._run.toString());
   // 워치독: flash 모델도 180초
   out.flashTimeout=/geminiImageFlash/.test(Engine._tfetch.toString());
   // 진단 버튼 + 함수
   out.diagFn=typeof Engine.diagnose==='function';
   out.diagBtn=[...document.querySelectorAll('header button')].some(b=>/진단/.test(b.textContent));
   // 키 없을 때 안내
   let alerted='';window.alert=m=>alerted=m;
   App.keys.gemini='';await Engine.diagnose();
   out.noKeyGuide=/키가 비어/.test(alerted);
   // 모킹 진단: 키 유효+모델 목록에 이미지 모델 없음 + 이미지 호출 결제오류 → 정확히 짚는지
   App.keys.gemini='FAKE';App.geminiImgModel=MODELS.geminiImage;
   const realT=Engine._tfetch;
   Engine._tfetch=async(url)=>{
     if(/\/models\?key=/.test(url))return {ok:true,status:200,text:async()=>JSON.stringify({models:[{name:'models/'+MODELS.geminiText},{name:'models/gemini-3.1-flash-image'}]})};
     if(url.indexOf(MODELS.geminiText)>=0)return {ok:true,status:200,text:async()=>'{"candidates":[]}'};
     return {ok:false,status:429,text:async()=>'{"error":{"status":"FAILED_PRECONDITION","message":"This model is only accessible to billed users"}}'};
   };
   alerted='';await Engine.diagnose();Engine._tfetch=realT;App.keys.gemini='';
   out.diagAuthOk=/① 키 인증: ✅/.test(alerted);
   out.diagModelMissing=/❌ 이 키로 접근 불가/.test(alerted);  // Pro가 목록에 없음
   out.diagTextOk=/③ 카피 생성 테스트: ✅/.test(alerted);
   out.diagImgBilling=/④ 이미지 생성 테스트/.test(alerted)&&/결제/.test(alerted);
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['whyKey','whyRef','whyBill','whyQuota','why404','whyNet','noTrunc','flashTimeout','diagFn','diagBtn','noKeyGuide','diagAuthOk','diagModelMissing','diagTextOk','diagImgBilling'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
