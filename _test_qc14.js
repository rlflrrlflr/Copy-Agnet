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
   const BG=solid('#3377cc');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.src=BG;});
   S3._img[BG]=window.__b;
   App.brief={target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['나파가죽']};
   App.copies=[{id:'A',key:'완벽한 매트 핏',sub:'나파가죽 트렁크 매트',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.stage=3;UI.go(3);S3.renderAll();

   // ===== 1) 뱃지 디폴트 없음(신규 기획) + 유도 시드 제거 =====
   out.freshNoBadge = !App.doc.layers.some(l=>l.type==='badge');
   const fpAll=[0,1,2].map(i=>Engine._finalPrompt(App.doc,i,{seed:i},true)).join(' ');
   out.noBadgeSeed = !/badge-and-callout/.test(fpAll);

   // ===== 2) 디자인 스타일 풀 6종 + 셀렉터 =====
   out.dirsPool = Array.isArray(Engine.DIRS)&&Engine.DIRS.length===6&&Engine.DIRS.map(d=>d.k).join(',')==='clean,wit,promo,benefit,price,ui';
   const fp3=Engine._finalPrompt(App.doc,3,{},true),fp4=Engine._finalPrompt(App.doc,4,{},true),fp5=Engine._finalPrompt(App.doc,5,{},true);
   out.newStyles = /PROMO PACK/i.test(fp3)&&/NUMBER\/PRICE CALLOUT/i.test(fp4)&&/UI-IN-CONTEXT/i.test(fp5);
   out.noInventNumbers = /do NOT invent any new numbers/i.test(fp3)&&/Do NOT invent numbers/i.test(fp4);
   out.styleSelect = !!document.getElementById('s4style')&&document.querySelectorAll('#s4style option').length===7;

   // ===== 3) 중복 금지 + 기획→퀄업 + 중복 비전점검 =====
   const fp0=Engine._finalPrompt(App.doc,0,{},true);
   out.noDupRule = /NO DUPLICATES/.test(fp0)&&/EXACTLY ONCE/.test(fp0);
   out.elevateRule = /PLAN vs FINISH/.test(fp0)&&/ELEVATE/.test(fp0);
   out.critiqueDup = /동일 요소 중복/.test(Engine.imageCritique.toString());

   // ===== 4) 순차 생성(병렬 제거) =====
   out.sequential = !/Promise\.all\(tasks\)/.test(S4.generate.toString())&&/순차 생성/.test(S4.generate.toString());
   out.styleWired = /s4style/.test(S4.generate.toString());

   // ===== 5) 도형 레이어 =====
   const nBefore=App.doc.layers.length;
   S3.addShape('rect');
   out.shapeAdded = App.doc.layers.length===nBefore+1 && App.doc.layers[App.doc.layers.length-1].type==='shape';
   const sh=App.doc.layers[App.doc.layers.length-1];
   out.shapeDraws = (function(){try{S3.draw();return true;}catch(e){return false;}})();
   const sb=S3.bbox(sh);
   out.shapeBbox = sb.w>0&&sb.h>0;
   // 도형 속성 패널: 모양 seg + 불투명도
   App.sel=sh.id;App.sels=[sh.id];S3.props();
   const segBtns=[...document.querySelectorAll('#propBody .seg button')].map(b=>b.textContent).join('');
   out.shapeProps = /사각/.test(segBtns)&&/화살표/.test(segBtns);
   // 도형 8방향 리사이즈 분기 + 가이드/스펙 포함
   out.shapeResize = /l\.type==="shape"/.test(S3.onMove.toString());
   out.shapeInGuide = /l\.type==="shape"/.test(Engine._layoutGuide.toString());
   const fpS=Engine._finalPrompt(App.doc,0,{},true);
   out.shapeInSpec = /"el":"shape"/.test(fpS)&&/planning placeholder/i.test(fpS);
   // 모든 kind 렌더 안전
   out.allKindsDraw = ['circle','triangle','arrow','line'].every(k=>{sh.kind=k;try{S3.draw();return true;}catch(e){return false;}});
   Doc.remove(sh.id);

   // ===== 6) +로고/+CTA 버튼 =====
   const tb=[...document.querySelectorAll('.s3-tools button')].map(b=>b.textContent).join('|');
   out.toolbarBtns = /도형/.test(tb)&&/CTA/.test(tb)&&/로고/.test(tb);
   // CTA 삭제 후 addCta → 재생성
   const cta=App.doc.layers.filter(l=>l.type==='cta')[0];Doc.remove(cta.id);
   S3.addCta();
   out.ctaReAdd = App.doc.layers.some(l=>l.type==='cta');

   // ===== 7) 변형 히스토리 + N안 타게팅 =====
   App.stage=4;App.final={variants:[
     {bg:'B1',bgClean:'C1',full:true,dir:0,name:'완성안 1',ratio:'1:1'},
     {bg:'B2',bgClean:'C2',full:true,dir:1,name:'완성안 2',ratio:'1:1'}],pick:0};
   const v=App.final.variants[0];
   S4._pushHist(v); v.bg='B1x';v.bgClean='C1x';
   S4.undoVariant();
   out.histUndo = v.bg==='B1'&&v.bgClean==='C1';
   out.mention2 = S4._variantFromText('완성안 2만 바꿔줘')===1 && S4._variantFromText('2안 배경 바꿔')===1;
   out.mentionNone = S4._variantFromText('더 고급스럽게')===-1;
   out.undoBtn = !!document.getElementById('s4undo');
   out.refineTargets = /S4\._variantFromText\(fb\)/.test(S4.refine.toString());
   out.refinePushHist = /_pushHist/.test(S4.refine.toString())&&/_pushHist/.test(S4.regenBg.toString())&&/_pushHist/.test(S4.qcFix.toString());
   out.regen6 = /%Engine\.DIRS\.length/.test(S4.regenBg.toString());

   // ===== 8) 카피 QC 루프 =====
   out.auditFn = typeof S2._audit==='function'&&typeof S2.qcPass==='function';
   const bad=[{id:'A',key:'지금 바로 최고의 선택',sub:'특별한 혜택',cta:'가기',tone:'x'},
              {id:'B',key:'지금 바로 최고의 선택',sub:'뭔가',cta:'가기',tone:'y'}];
   const issues=S2._audit(bad);
   out.auditCatches = issues.some(s=>/클리셰/.test(s)) && issues.some(s=>/제품 명사/.test(s)) && issues.some(s=>/중복/.test(s));
   const good=[{id:'A',key:'나파가죽 트렁크 매트, 순정 핏',sub:'테슬라 전용 나파가죽 매트',cta:'보기',tone:'직격'}];
   out.auditPassesGood = S2._audit(good).filter(s=>!/전체:/.test(s)).length===0;
   out.qcWired = /S2\.qcPass\(\)/.test(S1.analyze.toString())&&/S2\.qcPass\(\)/.test(S2.regen.toString());

   // ===== 9) 단축키 =====
   const bk=bindKeys.toString();
   out.copyPaste = /k==="c"/.test(bk)&&/k==="v"/.test(bk)&&/App\._clip/.test(bk);
   out.stage4Undo = /App\.stage!==4/.test(bk)&&/undoVariant/.test(bk);
   out.ctrlS = (bk.match(/k==="s"/g)||[]).length>=2;

   // ===== 10) 환경 일관성 CSS =====
   out.envCss = [...document.styleSheets].some(ss=>{try{return[...ss.cssRules].some(r=>/tap-highlight/.test(r.cssText||''));}catch(e){return false;}});

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['freshNoBadge','noBadgeSeed','dirsPool','newStyles','noInventNumbers','styleSelect','noDupRule','elevateRule','critiqueDup','sequential','styleWired','shapeAdded','shapeDraws','shapeBbox','shapeProps','shapeResize','shapeInGuide','shapeInSpec','allKindsDraw','toolbarBtns','ctaReAdd','histUndo','mention2','mentionNone','undoBtn','refineTargets','refinePushHist','regen6','auditFn','auditCatches','auditPassesGood','qcWired','copyPaste','stage4Undo','ctrlS','envCss'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
