/* 54차: Drive 백업 설정 마법사 — 안내·코드계약·URL검증·저장/해제 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   const out={};
   try{localStorage.clear();}catch(e){}
   // prompt() 대신 마법사가 뜨는지
   let promptCalled=false;window.prompt=()=>{promptCalled=true;return null;};
   Cloud.setup();
   const ov=[...document.querySelectorAll('div')].find(d=>/Apps Script|드라이브 자동 백업/.test(d.textContent)&&d.style.position==='fixed');
   out.wizardOpens=!!ov&&!promptCalled;
   const txt=ov?ov.textContent:'';
   out.hasSteps=/script\.google\.com/.test(txt)&&/모든 사용자/.test(txt)&&/실행 주체/.test(txt);
   out.hasWarning=/공유하지 마세요/.test(txt);
   out.hasWhy=/서버가 없는|드라이브에 접근할 방법/.test(txt)||/우리 서버는 관여하지 않습니다/.test(txt);
   // 코드가 앱이 보내는 계약({name,data})과 일치하는지
   out.codeContract=/body\.name/.test(Cloud.CODE)&&/body\.data/.test(Cloud.CODE)&&/base64Decode/.test(Cloud.CODE)&&/소재냥인 제작물/.test(Cloud.CODE);
   out.sendContract=/name:/.test(Cloud.send.toString())&&/data:/.test(Cloud.send.toString())&&/no-cors/.test(Cloud.send.toString());
   // 버튼 존재
   const btns=ov?[...ov.querySelectorAll('button')].map(x=>x.textContent):[];
   out.buttons=btns.some(t=>/코드 복사/.test(t))&&btns.some(t=>/연결 테스트/.test(t))&&btns.some(t=>/저장하고 켜기/.test(t))&&btns.some(t=>/해제하기/.test(t));
   // 잘못된 URL은 테스트 거부
   const inp=ov.querySelector('input');const tbtn=[...ov.querySelectorAll('button')].find(x=>/연결 테스트/.test(x.textContent));
   let toasted='';const rt=window.toast;window.toast=m=>toasted=m;
   inp.value='https://example.com/nope';tbtn.click();await new Promise(r=>setTimeout(r,60));
   out.rejectsBadUrl=/exec/.test(toasted);
   // 정상 URL 저장 → ON
   inp.value='https://script.google.com/macros/s/AKfycbTEST/exec';
   [...ov.querySelectorAll('button')].find(x=>/저장하고 켜기/.test(x.textContent)).click();
   out.saved=Cloud.on()===true&&Cloud.url().indexOf('/exec')>0;
   // 해제
   Cloud.setup();
   const ov2=[...document.querySelectorAll('div')].find(d=>/드라이브 자동 백업/.test(d.textContent)&&d.style.position==='fixed');
   [...ov2.querySelectorAll('button')].find(x=>/해제하기/.test(x.textContent)).click();
   out.cleared=Cloud.on()===false;
   window.toast=rt;
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['wizardOpens','hasSteps','hasWarning','hasWhy','codeContract','sendContract','buttons','rejectsBadUrl','saved','cleared'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
