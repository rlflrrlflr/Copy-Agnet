/* 단축키 '실사용' 검증 — 함수 존재가 아니라 진짜 keyboard/mouse 이벤트로 전 단축키를 누른다 */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 // 셋업: 3단계 진입 + 레이어 선택
 await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const BG=solid('#3377cc');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.src=BG;});
   S3._img[BG]=window.__b;
   App.copies=[{id:'A',key:'헤드라인 카피',sub:'서브 카피',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.stage=3;UI.go(3);S3.renderAll();
   // 포커스가 input에 있지 않도록 명시적으로 body로
   document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
   var keyL=App.doc.layers.filter(l=>l.role==='key')[0];App.sel=keyL.id;App.sels=[keyL.id];S3.renderAll();
   try{History.reset();}catch(e){}
   window.__k=keyL.id;
 });
 const st0=await p.evaluate(()=>{var l=Doc.byId(window.__k);return {nx:l.nx,ny:l.ny,n:App.doc.layers.length};});

 // 1) 화살표 이동(실제 키)
 await p.keyboard.press('ArrowRight');await wait(60);
 await p.keyboard.press('ArrowDown');await wait(60);
 const st1=await p.evaluate(()=>{var l=Doc.byId(window.__k);return {nx:l.nx,ny:l.ny};});
 const arrows = st1.nx>st0.nx && st1.ny>st0.ny;

 // 2) Shift+화살표 = 큰 스텝
 await p.keyboard.down('Shift');await p.keyboard.press('ArrowRight');await p.keyboard.up('Shift');await wait(60);
 const st2=await p.evaluate(()=>Doc.byId(window.__k).nx);
 const bigStep = (st2-st1.nx)>0.03;

 // 3) Ctrl+D 복제
 await p.keyboard.down('Control');await p.keyboard.press('KeyD');await p.keyboard.up('Control');await wait(80);
 const afterDup=await p.evaluate(()=>App.doc.layers.length);
 const dup = afterDup===st0.n+1;

 // 4) Delete 삭제(복제본)
 await p.keyboard.press('Delete');await wait(80);
 const afterDel=await p.evaluate(()=>App.doc.layers.length);
 const del = afterDel===st0.n;

 // 5) Ctrl+Z 되돌리기(삭제 취소 → 다시 +1)
 await p.keyboard.down('Control');await p.keyboard.press('KeyZ');await p.keyboard.up('Control');await wait(100);
 const afterUndo=await p.evaluate(()=>App.doc.layers.length);
 const undo = afterUndo===st0.n+1;

 // 6) Ctrl+Shift+Z 다시실행(삭제 재적용 → 원복)
 await p.keyboard.down('Control');await p.keyboard.down('Shift');await p.keyboard.press('KeyZ');await p.keyboard.up('Shift');await p.keyboard.up('Control');await wait(100);
 const afterRedo=await p.evaluate(()=>App.doc.layers.length);
 const redo = afterRedo===st0.n;

 // 7) Ctrl+C → Ctrl+V 복사·붙여넣기
 await p.evaluate(()=>{var l=Doc.byId(window.__k);App.sel=l.id;App.sels=[l.id];S3.renderAll();});
 await p.keyboard.down('Control');await p.keyboard.press('KeyC');await p.keyboard.up('Control');await wait(60);
 await p.keyboard.down('Control');await p.keyboard.press('KeyV');await p.keyboard.up('Control');await wait(80);
 const afterPaste=await p.evaluate(()=>App.doc.layers.length);
 const copyPaste = afterPaste===st0.n+1;

 // 8) Escape 선택 해제
 await p.keyboard.press('Escape');await wait(60);
 const escClear=await p.evaluate(()=>App.sel===null&&App.sels.length===0);

 // 9) Ctrl+A 전체 선택
 await p.keyboard.down('Control');await p.keyboard.press('KeyA');await p.keyboard.up('Control');await wait(60);
 const selAll=await p.evaluate(()=>App.sels.length===App.doc.layers.length);

 // 10) 입력창 포커스 중엔 단축키 무시(오발동 방지)
 await p.evaluate(()=>{var l=App.doc.layers[0];App.sel=l.id;App.sels=[l.id];S3.renderAll();document.getElementById('s3msg').focus();});
 const nBefore=await p.evaluate(()=>App.doc.layers.length);
 await p.keyboard.press('Delete');await wait(60);
 const nAfter=await p.evaluate(()=>App.doc.layers.length);
 const inputGuard = nBefore===nAfter;
 await p.evaluate(()=>document.getElementById('s3msg').blur());

 // 11) 4단계 Ctrl+Z = 이전 버전
 await p.evaluate(()=>{
   App.stage=4;UI.go(4);
   App.final={variants:[{bg:'NEW',bgClean:'NC',full:true,dir:0,name:'완성안 1',ratio:'1:1',hist:[{bg:'OLD',bgClean:'OC',full:true,dir:0}]}],pick:0};
   document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
 });
 await p.keyboard.down('Control');await p.keyboard.press('KeyZ');await p.keyboard.up('Control');await wait(80);
 const s4undo=await p.evaluate(()=>App.final.variants[0].bg==='OLD');

 await b.close();
 const R={arrows,bigStep,dup,del,undo,redo,copyPaste,escClear,selAll,inputGuard,s4undo};
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=Object.keys(R);
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
