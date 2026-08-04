/* 52차: 실제 사용 키 지문·출처 표기 · 스테일 키 초기화 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   const out={};
   // 지문: 전체 키를 노출하지 않고 끝 5자만
   out.fp=UI._fp('AIzaSyOLDFREEKEYwnVk')==='…YwnVk (20자)'; // 끝 5자 + 길이(전체 키는 노출 안 함)
   out.fpEmpty=UI._fp('')==='(없음)';
   // 저장소에 예전 키가 있으면 복원되며 출처가 '브라우저 저장소'로 기록
   localStorage.setItem('soszae_keys',JSON.stringify({gemini:'AIza_OLD_FREE_aaaa',claude:'',openai:'',provider:'auto',imgEngine:'gemini'}));
   UI.keySrc={};UI._booted=false;UI.restoreKeys();UI.onKey();UI._booted=true;
   out.restoredSrc=/브라우저 저장소/.test(UI.keySrc.gemini||'')&&App.keys.gemini==='AIza_OLD_FREE_aaaa';
   // 직접 입력하면 출처가 '직접 입력'으로 갱신
   document.getElementById('geminiKey').value='AIza_NEW_PAID_wnVk';UI.onKey();
   out.typedSrc=UI.keySrc.gemini==='직접 입력'&&App.keys.gemini==='AIza_NEW_PAID_wnVk';
   // 진단 첫 줄에 사용 키 지문+출처가 나오는지
   let alerted='';window.alert=m=>alerted=m;
   const realOnce=Engine._tfetchOnce;
   Engine._tfetchOnce=async()=>({ok:false,status:503,text:async()=>'down',json:async()=>({})});
   await Engine.diagnose();
   Engine._tfetchOnce=realOnce;
   out.diagShowsKey=/실제 사용 중인 키/.test(alerted)&&/…_wnVk/.test(alerted)&&/출처: 직접 입력/.test(alerted);
   out.diagWarns=/예전 키가 남아/.test(alerted);
   // 키 초기화 버튼
   out.clearBtn=[...document.querySelectorAll('header button')].some(b=>/키 초기화/.test(b.textContent));
   window.confirm=()=>true;
   UI.clearKeys();
   const st=JSON.parse(localStorage.getItem('soszae_keys')||'{}');
   out.cleared=!st.gemini&&!st.claude&&!st.openai&&App.keys.gemini===''&&document.getElementById('geminiKey').value===''&&Engine._imgResolved===null;
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['fp','fpEmpty','restoredSrc','typedSrc','diagShowsKey','diagWarns','clearBtn','cleared'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
