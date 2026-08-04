/* 46차: HSV 스펙트럼 픽커 · Nano Banana 2 모델 선택 · 3단계 버튼 정리 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   // ── HSV 헬퍼 라운드트립 ──
   out.hsvFns=typeof S3._hsv2hex==='function'&&typeof S3._hex2hsv==='function';
   out.hsvBlack=S3._hsv2hex(0,0,0)==='#000000';
   out.hsvWhite=S3._hsv2hex(0,0,1)==='#ffffff';
   out.hsvRed=S3._hsv2hex(0,1,1)==='#ff0000';
   const rt=S3._hex2hsv('#1f6feb'),back=S3._hsv2hex(rt.h,rt.s,rt.v);
   out.hsvRoundtrip=back.toLowerCase()==='#1f6feb';
   // ── 색 컨트롤 팝오버에 스펙트럼 캔버스 2개 ──
   let picked=null;const ctl=S3._colorCtl('#e60023',v=>picked=v);
   document.body.appendChild(ctl);
   const swBtn=ctl.querySelector('button');swBtn.click();
   const pop=ctl.querySelector('.pal-pop');
   out.popOpens=!!pop;
   const canv=pop?pop.querySelectorAll('canvas'):[];
   out.specCanvases=canv.length===2; // SV 사각 + hue 바
   out.presetsKept=pop?pop.querySelectorAll('button').length>=8:false; // 프리셋 스와치 유지
   // ── 모델 선택자: Nano Banana 2 옵션 + 배선 ──
   const ie=document.getElementById('imgEngine');
   out.nb2Option=!!ie&&[...ie.options].some(o=>o.value==='gemini-flash'&&/Nano Banana 2/.test(o.text))&&[...ie.options].some(o=>o.value==='gemini'&&/자동/.test(o.text));
   out.gptOption=!!ie&&[...ie.options].some(o=>o.value==='openai');
   ie.value='gemini-flash';UI.onKey();
   out.flashWired=App.imgProvider==='gemini'&&App.geminiImgModel==='gemini-3.1-flash-image';
   ie.value='gemini';UI.onKey();
   out.proWired=App._imgModelPinned===false&&App.geminiImgModel==='gemini-3.1-flash-image'; // 51차: '자동'은 고정 해제 + 계정 최강 모델 확정에 위임
   out.provKnowsFlash=/geminiImgModel/.test(Engine._geminiImageOnce.toString())&&/gemini-3\.1-flash-image/.test(JSON.stringify(MODELS));
   // ── 3단계 버튼 정리: 기획안 시트 제거 ──
   out.planBtnGone=![...document.querySelectorAll('.s3-tools button')].some(b=>/기획안 시트/.test(b.textContent));
   out.downloadKept=[...document.querySelectorAll('.s3-tools button')].some(b=>/다운로드/.test(b.textContent));
   out.genBgKept=[...document.querySelectorAll('.s3-tools button')].some(b=>/배경 생성/.test(b.textContent));
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['hsvFns','hsvBlack','hsvWhite','hsvRed','hsvRoundtrip','popOpens','specCanvases','presetsKept','nb2Option','gptOption','flashWired','proWired','provKnowsFlash','planBtnGone','downloadKept','genBgKept'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
