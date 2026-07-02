/* 29차: 제품 동질성 락 / refine 치환금지·N안 타게팅 / 시뮬 가시화 / audit 확장 */
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
   const PROD=solid('#ffcc00');
   App.brief={target:'2030 올리브영 관심자',offer:'네이처메이드 비타민C 구미 620mg',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['620mg','구미']};
   App.assets.products=[{id:'p1',name:'prod',url:PROD}];

   // ===== 1) 제품 동질성 =====
   // 프롬프트: recreate → edit/place 프레이밍 + 픽셀 충실 지시
   App.copies=[{id:'A',key:'k',sub:'s',cta:'c',tone:'t'}];Doc.initFromCopy(App.copies[0]);
   const ip=Engine._imagePrompt({layoutType:'product-shot'});
   out.editFraming=/THIS IS AN EDIT NOT A REDRAW/i.test(ip)&&/PIXEL-FAITHFUL/i.test(ip)&&/LOCKED, unmodifiable asset/i.test(ip);
   out.noRecreate=!/Recreate the product EXACTLY/i.test(ip);
   // productCheck 존재 + genImage에 게이트/재시도 배선
   out.pqcFn=typeof Engine.productCheck==='function';
   const gi=S3.genImage.toString();
   out.pqcWired=/productCheck/.test(gi)&&/CRITICAL RETRY/.test(gi)&&/재생성 중/.test(gi);

   // ===== 2) refine 재설계 =====
   const pr=Engine._prompt('refine',{copies:App.copies,offer:'o',target:'t',channel:''});
   out.directionRule=/삽입할 문구.*가 아니라.*해석할 방향|해석할 방향/.test(pr.sys)&&/그대로 복사해 넣지 말고/.test(pr.sys);
   out.noSubstitution=/브랜드명·제품명·고유명사는 절대/.test(pr.sys);
   out.noMoodRepeat=/2개 이상의 안에 반복 사용하는 것 절대 금지/.test(pr.sys);
   out.keepOthers=/전체를 균질하게 다시 쓰는 것 금지/.test(pr.sys);
   // targetIdx 프롬프트 반영
   const pr2=Engine._prompt('refine',{copies:App.copies,offer:'o',target:'t',channel:'',targetIdx:1});
   out.targetInPrompt=/'2안'만 겨냥/.test(pr2.user);

   // ===== 3) N안 타게팅 파서 + 수술적 병합 =====
   out.parse2=S2._targetFromText('2안만 좀 더 위트있게')===1;
   out.parseB=S2._targetFromText('안 B 바꿔줘')===1||S2._targetFromText('B안 바꿔줘')===1;
   out.parseNone=S2._targetFromText('전체적으로 상큼하게')===-1;
   // 채팅: "1안만" 겨냥 → 모델이 전부 다시 써도 1안만 교체
   App.copies=[
     {id:'A',key:'엣지있는 원본 카피 A',sub:'서브A 620mg',cta:'보기',tone:'직격'},
     {id:'B',key:'원본 카피 B',sub:'서브B 구미',cta:'보기',tone:'공감'}];
   App.keys.gemini='FAKE';App.simMode=false;
   const realGen=Engine.gen;
   Engine.gen=async(kind,payload)=>[
     {id:'A',key:'다시 쓴 A',sub:'x 620mg',cta:'c',tone:'직격'},
     {id:'B',key:'다시 쓴 B',sub:'y 구미',cta:'c',tone:'공감'}];
   document.getElementById('s2msg').value='1안만 더 짧게';
   await S2.chat();
   Engine.gen=realGen;
   out.mergeTargeted = App.copies[0].key==='다시 쓴 A' && App.copies[1].key==='원본 카피 B';

   // ===== 4) 무드어 도배 감지 =====
   const spamSet=[
     {key:'상큼한 아침 620mg',cta:'상큼하게 보기'},{key:'상큼 그 자체 구미',cta:'가기'},
     {key:'매일 상큼 루틴',cta:'시작'},{key:'다른 카피',cta:'보기'},{key:'또 다른 카피',cta:'열기'}];
   out.moodSpamDetects = S2._moodSpam(spamSet)==='상큼';
   out.moodSpamCleanNull = S2._moodSpam([{key:'하나',cta:'a'},{key:'둘',cta:'b'},{key:'셋',cta:'c'}])===null;

   // ===== 5) audit 확장: 오타·날조 %·무드어 =====
   const audited=S2._audit([
     {id:'A',key:'상큼달콤 해택받기 구미',sub:'620mg 비타민',cta:'해택받기',tone:'x'},
     {id:'B',key:'1일 권장량 620% 구미',sub:'네이처메이드 620mg',cta:'보기',tone:'y'}]);
   out.typoCaught = audited.some(s=>/오타 '해택'/.test(s));
   out.pctCaught = audited.some(s=>/브리프에 없는 수치 '620%'/.test(s));

   // ===== 6) 시뮬 폴백 가시화 =====
   out.simFlagCode = /App\.simMode=true/.test(Engine._run.toString())&&/App\.simMode=false/.test(Engine._run.toString());
   App.simMode=true;S2.render();
   out.simBanner = /시뮬레이터/.test(document.getElementById('copyGrid').textContent);
   App.simMode=false;S2.render();
   out.simBannerGone = !/시뮬레이터\(오프라인/.test(document.getElementById('copyGrid').textContent);

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['editFraming','noRecreate','pqcFn','pqcWired','directionRule','noSubstitution','noMoodRepeat','keepOthers','targetInPrompt','parse2','parseB','parseNone','mergeTargeted','moodSpamDetects','moodSpamCleanNull','typoCaught','pctCaught','simFlagCode','simBanner','simBannerGone'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
