const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c,w,h){var cv=document.createElement('canvas');cv.width=w||200;cv.height=h||200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,cv.width,cv.height);return cv.toDataURL();}
   const SCENE=solid('#3377cc',400,400), LOGO=solid('#ff8800',200,80);
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__s=i;r();};i.src=SCENE;});
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__l=i;r();};i.src=LOGO;});
   S3._img[SCENE]=window.__s;S3._img[LOGO]=window.__l;
   App.copies=[{id:'A',key:'완벽한 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   App.brand.logo=LOGO;App.brand.accent='#e60023';
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=SCENE;App.stage=3;
   S3.ensureLogo();

   // 1) 취소(ESC) 메커니즘
   out.cancelApi=typeof Engine.resetCancel==='function'&&typeof Engine.cancel==='function'&&typeof Engine._isCancel==='function';
   Engine.resetCancel();
   out.resetClears=Engine._cancelled===false;
   Engine.cancel();
   out.cancelSets=Engine._cancelled===true;
   out.isCancelDetect=Engine._isCancel(new Error('boom __CANCELLED__'))===true&&Engine._isCancel(new Error('other'))===false;
   // _run 은 취소상태면 sim 으로 안 떨어지고 __CANCELLED__ 던짐
   Engine._cancelled=true;
   let threw='';try{await Engine._run('analyze',{},false,false);}catch(e){threw=e.message;}
   out.runRethrowsCancel=/__CANCELLED__/.test(threw);
   Engine.resetCancel();

   // ESC 키 → 오버레이 떠있을 때만 취소
   document.getElementById('catOverlay').classList.add('show');
   Engine.resetCancel();
   document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
   out.escCancels=Engine._cancelled===true;
   document.getElementById('catOverlay').classList.remove('show');
   Engine.resetCancel();
   document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
   out.escNoopWhenHidden=Engine._cancelled===false;

   // 2) 고양이 오버레이 = 작은 팝업(전체 백드롭 아님)
   var co=getComputedStyle(document.getElementById('catOverlay'));
   out.catPopup=co.position==='fixed'&&co.pointerEvents==='none'&&co.inset!=='0px';
   out.escHint=!!document.querySelector('#catOverlay .cat-esc-hint')&&/ESC/.test(document.querySelector('#catOverlay .cat-esc-hint').textContent);
   out.hintOutsideCard=!document.querySelector('.cat-card .cat-esc-hint'); // 카드 '바깥'에

   // 3) 전역 배경음영 슬라이더 삭제
   out.scrimSliderGone=document.getElementById('scrimRange')===null&&document.getElementById('scrimNum')===null;

   // 4) 슬롯별 스피너(생성중 뱅글뱅글)
   App.stage=4;App.final={variants:[{loading:true,name:'완성안 1'},{loading:true,name:'완성안 2'}],pick:0};
   S4.renderVariants();
   out.spinnerOnLoading=document.querySelectorAll('#variantList .vspin').length===2&&/생성/.test(document.querySelector('#variantList .vspin-txt').textContent);

   // 5) bgClean — 생성 시 로고 없는 원본 보관, 합성본과 분리
   App.keys.gemini='FAKE';
   const realGen=Engine.gen,realEdge=Engine._imgEdge;
   let genCalls=[];
   Engine.gen=async(kind,payload)=>{genCalls.push({kind,payload});await new Promise(r=>setTimeout(r,5));return SCENE;};
   Engine._imgEdge=async()=>1;
   App.final={variants:[],pick:0};
   await S4.generate();
   const v0=App.final.variants[0];
   out.bgCleanSaved=v0&&v0.bgClean===SCENE;            // 원본(로고X)
   out.bgComposited=v0&&v0.full===true&&v0.bg!==SCENE; // 표시본엔 로고 합성됨
   out.threeVariants=App.final.variants.length===3&&App.final.variants.every(v=>!v.loading);

   // 6) 비율 내보내기 reframe 는 bgClean 을 베이스로(로고 1회만 → 겹침 방지)
   genCalls=[];
   App.final.variants[0].bgClean='CLEAN_BASE_X';App.final.variants[0].bg='COMPOSITED_Y';App.final.variants[0].full=true;
   Engine.gen=async(kind,payload)=>{genCalls.push({kind,payload});return SCENE;};
   GEM_AR['16:9']='16:9';
   await S4.genRatio({k:'16:9',label:'16:9 배너',dims:[1920,1080],ar:'16:9'});
   const rf=genCalls.filter(c=>c.payload&&c.payload.reframe)[0];
   out.reframeUsesClean=!!rf&&rf.payload.baseOverride==='CLEAN_BASE_X';
   Engine.gen=realGen;Engine._imgEdge=realEdge;

   // 7) _finalPrompt EDIT MODE — 베이스+요청 있으면 '그것만 바꾸라' 지시
   const fpEdit=Engine._finalPrompt(App.doc,0,{fb:'텍스트를 조금 더 아래로 내려줘'},true);
   out.editMode=/EDIT MODE/.test(fpEdit)&&/텍스트를 조금 더 아래로 내려줘/.test(fpEdit);
   const fpRef=Engine._finalPrompt(App.doc,0,{reframe:true},true);
   out.reframeNoEdit=!/EDIT MODE/.test(fpRef)&&/RE-FRAME it to aspect ratio/i.test(fpRef);
   // 로고 합성은 여전히 1회(스펙에 로고 없음 + AI 로고금지)
   out.noAILogo=/Do NOT draw, render, write or invent ANY logo/i.test(fpEdit)&&!/"el":"logo"/.test(fpEdit);

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['cancelApi','resetClears','cancelSets','isCancelDetect','runRethrowsCancel','escCancels','escNoopWhenHidden','catPopup','escHint','hintOutsideCard','scrimSliderGone','spinnerOnLoading','bgCleanSaved','bgComposited','threeVariants','reframeUsesClean','editMode','reframeNoEdit','noAILogo'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
