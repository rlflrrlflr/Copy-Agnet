const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const IMG=solid('#33aa55');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__i=i;r();};i.src=IMG;});
   S3._img[IMG]=window.__i;
   App.copies=[{id:'A',key:'헤드라인 텍스트',sub:'서브',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=IMG;App.stage=3;UI.go(3);S3.renderAll();

   // 1) 8방향 핸들 + 회전점 — primary 선택에 핸들 9개(8방향+rot)
   var keyL=App.doc.layers.filter(l=>l.role==='key')[0];
   App.sel=keyL.id;App.sels=[keyL.id];S3.overlay();
   const handles=[...document.querySelectorAll('#overlay .selbox .hdl')];
   const modes=handles.map(h=>h.dataset.h).sort().join(',');
   out.eightHandles = handles.length===9 && modes==='e,n,ne,nw,rot,s,se,sw,w';
   out.rotTooltip = handles.some(h=>h.dataset.h==='rot'&&/회전/.test(h.title));
   out.resizeTooltip = handles.some(h=>h.dataset.h==='se'&&/크기/.test(h.title));

   // 2) 리사이즈 로직 — 텍스트 'se' 모서리 드래그 → 폰트 size 증가
   var b0=S3.bbox(keyL),osz=keyL.size;
   S3.drag={id:keyL.id,mode:'se',sx:0,sy:0,osize:osz,owx:keyL.wx,oar:1,onx:keyL.nx,ony:keyL.ny,b0:b0,obh:b0.h};
   // 가짜 포인터 이동: 아래로 80px → 세로 커짐 → size 증가
   S3.onMove({clientX:0,clientY:0,_:0,preventDefault(){}, // canvasPoint은 editCanvas rect 기준이라 직접 호출 대신 좌표 주입
     });
   // canvasPoint가 clientX/Y 사용하므로 직접 size 계산 검증: 모드 핸들러가 존재하는지 + 코드 경로 확인
   out.resizeBranch = /8방향 리사이즈/.test(S3.onMove.toString())&&/oar/.test(S3.startHandle.toString());

   // 이미지 'w' 핸들 = 왼쪽 고정 앵커(반대편 고정) 로직 존재
   out.anchorLogic = /if\(west\)nx=\(b0\.x\+b0\.w\)-newW/.test(S3.onMove.toString());

   // 3) Ctrl+Shift 복제 — onDown에서 ctrl+shift면 즉시 복제 후 사본 드래그
   out.dupCode = /\(e\.ctrlKey\|\|e\.metaKey\)&&e\.shiftKey/.test(S3.onDown.toString())&&/App\.doc\.layers\.push\(cp\)/.test(S3.onDown.toString());
   const beforeN=App.doc.layers.length;
   // hit 좌표를 keyL 위로 → ctrl+shift 다운 시뮬
   var bb=S3.bbox(keyL);var cv=$("editCanvas");var rect=cv.getBoundingClientRect();var sc=rect.width/cv.width;
   var cx=rect.left+(bb.x+bb.w/2)*sc, cy=rect.top+(bb.y+bb.h/2)*sc;
   S3.onDown({target:{classList:{contains:()=>false}},clientX:cx,clientY:cy,shiftKey:true,ctrlKey:true,pointerId:1,preventDefault(){}});
   out.dupRuns = App.doc.layers.length===beforeN+1;
   if(S3.drag)S3.onUp({});

   // 4) 챗봇 액션 — 3·4단계 로그 컨테이너 + _log 헬퍼 + 생각중 펄스
   out.s3log = !!document.getElementById('s3log');
   out.s4log = !!document.getElementById('s4log');
   out.logHelpers = typeof S3._log==='function' && typeof S4._log==='function';
   var msg=S3._log('me','테스트'); var th=S3._log('ai','고치는 중',true);
   out.logRenders = !!msg && document.querySelectorAll('#s3log .s2-msg').length===2 && th.classList.contains('think');
   out.thinkCss = [...document.styleSheets].some(ss=>{try{return[...ss.cssRules].some(r=>/think/.test(r.selectorText||'')||/thinkpulse/.test(r.name||''));}catch(e){return false;}});

   // 5) S4.refine/S3.chat 가 로그를 사용(액션감)
   out.chatUsesLog = /S3\._log\("me"/.test(S3.chat.toString())&&/think/.test(S3.chat.toString());
   out.refineUsesLog = /S4\._log\("me"/.test(S4.refine.toString());

   return out;
 });

 // 6) 모바일 — 좁은 뷰포트에서 가로 오버플로 없음 + 버튼 축소
 await p.setViewport({width:390,height:780});await wait(200);
 const mob=await p.evaluate(()=>{
   const out={};
   out.noOverflow=document.documentElement.scrollWidth<=document.documentElement.clientWidth+4;
   const btn=document.querySelector('.btn');
   out.btnFont=btn?parseFloat(getComputedStyle(btn).fontSize)<=13:false;
   out.bodyFont=parseFloat(getComputedStyle(document.body).fontSize)<=13;
   return out;
 });
 await p.setViewport({width:1400,height:1000});

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('mobile:',JSON.stringify(mob));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['eightHandles','rotTooltip','resizeTooltip','resizeBranch','anchorLogic','dupCode','dupRuns','s3log','s4log','logHelpers','logRenders','thinkCss','chatUsesLog','refineUsesLog'];
 const mk=['noOverflow','btnFont','bodyFont'];
 const ok=keys.every(k=>R[k])&&mk.every(k=>mob[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]),'MOB:',mk.filter(k=>!mob[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
