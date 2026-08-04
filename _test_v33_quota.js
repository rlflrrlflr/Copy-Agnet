/* 50차: 429 할당량 해석(분당/일일) · 자동 재시도 · 메시지 절단 해소 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   const out={};
   const minuteBody=JSON.stringify({error:{code:429,status:'RESOURCE_EXHAUSTED',message:'Quota exceeded',details:[
     {'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaMetric:'generate_requests_per_model',quotaId:'GenerateRequestsPerMinutePerProjectPerModel'}]},
     {'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'8s'}]}});
   const dayBody=JSON.stringify({error:{code:429,status:'RESOURCE_EXHAUSTED',message:'Quota exceeded',details:[
     {'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel'}]}]}});
   // 파서
   const qm=Engine._quota(minuteBody),qd=Engine._quota(dayBody);
   out.parseMinute=qm.per==='minute'&&qm.delay===8;
   out.parseDay=qd.per==='day';
   // 해석기 문구
   out.whyMinute=/분당 요청 제한/.test(Engine._why(minuteBody))&&/8초/.test(Engine._why(minuteBody));
   out.whyDay=/일일 할당량 소진/.test(Engine._why(dayBody));
   out.prefixTolerant=/일일 할당량 소진/.test(Engine._why('Gemini SEARCH 429 '+dayBody)); // 접두어 붙은 실제 에러 문자열도 해석
   // 중앙 백오프: 429 한 번 → 자동 재시도 후 성공 (모든 provider 공통 경로)
   App.keys.gemini='GK';App.brief={target:'t',offer:'o',funnel:'전환',channel:''};
   let n=0;const realOnce=Engine._tfetchOnce;
   Engine._tfetchOnce=async()=>{n++;
     if(n===1)return {ok:false,status:429,text:async()=>JSON.stringify({error:{code:429,details:[
       {'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaId:'PerMinute'}]},
       {'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'2s'}]}})};
     return {ok:true,status:200,json:async()=>({candidates:[{content:{parts:[{text:'리서치 결과'}]}}]}),text:async()=>''};};
   const t0=Date.now();const got=await Engine.research(App.brief);
   out.retried=n===2&&got==='리서치 결과';
   out.waited=(Date.now()-t0)>=1800; // 서버 권장 지연만큼 실제 대기
   // 일일 소진이면 재시도하지 않고 즉시 포기(무의미한 대기 방지) — 카피는 계속 진행
   n=0;Engine._tfetchOnce=async()=>{n++;return {ok:false,status:429,text:async()=>dayBody};};
   const got2=await Engine.research(App.brief);
   out.noRetryOnDay=n===1&&got2==='';
   out.dayReported=/일일 할당량 소진/.test(Engine._why(Engine.lastError));
   // 유료 티어에 '결제하라'고 하지 않음 — 속도 제한으로 안내
   out.paidSafe=/요청 속도 제한/.test(Engine._why(minuteBody.replace('PerMinutePerProjectPerModel','X')))||/분당 요청 제한/.test(Engine._why(minuteBody));
   Engine._tfetchOnce=realOnce;App.keys.gemini='';
   // 토스트 절단 제거
   out.noTrunc=!/slice\(0,30\)/.test(Engine.research.toString())&&/_why/.test(Engine.research.toString());
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['parseMinute','parseDay','whyMinute','whyDay','prefixTolerant','retried','waited','noRetryOnDay','dayReported','paidSafe','noTrunc'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
