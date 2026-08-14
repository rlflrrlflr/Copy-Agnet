/* 55차: 한글 IME 조합 중 Enter 무시 — '끝 글자 반복 전송' 재현 후 차단 확인 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   const out={};
   out.guardFn=typeof entKey==='function'&&typeof clearInput==='function';
   // 가드 단위 동작
   out.blocksComposing=entKey({key:'Enter',isComposing:true})===false;
   out.blocks229=entKey({key:'Enter',isComposing:false,keyCode:229})===false;
   out.allowsNormal=entKey({key:'Enter',isComposing:false,keyCode:13})===true;
   out.allowsShiftNo=entKey({key:'Enter',isComposing:false,keyCode:13,shiftKey:true})===false; // 줄바꿈 의도는 전송 안 함
   // 4개 입력 모두 가드 적용
   const ids=['s2msg','s3msg','s4fb','ctxUrl'];
   out.allWired=ids.every(id=>{const el=document.getElementById(id);return el&&/entKey\(event\)/.test(el.getAttribute('onkeydown')||'');});
   // 재현: 조합 중 Enter → 전송되면 안 됨
   let sent=0;const real=S4.refine;S4.refine=async()=>{sent++;};
   const fb=document.getElementById('s4fb');fb.value='TVC 예시를 넣어줘';
   const mk=(comp)=>{const e=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});
     Object.defineProperty(e,'isComposing',{value:comp});Object.defineProperty(e,'keyCode',{value:comp?229:13});return e;};
   fb.dispatchEvent(mk(true));                 // 조합 중(마지막 '줘'가 아직 조합)
   out.composingNotSent=sent===0;
   fb.dispatchEvent(mk(false));                // 조합 확정 후 Enter
   out.normalSent=sent===1;
   S4.refine=real;
   // clearInput: 값 비우고 blur로 조합 종료
   const t=document.getElementById('s2msg');t.value='남은글자';t.focus();
   clearInput(t);
   out.clearedNow=t.value==='';
   await new Promise(r=>setTimeout(r,20));
   out.clearedAfterTick=t.value===''; // 비동기 커밋이 와도 다시 비움
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['guardFn','blocksComposing','blocks229','allowsNormal','allowsShiftNo','allWired','composingNotSent','normalSent','clearedNow','clearedAfterTick'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
