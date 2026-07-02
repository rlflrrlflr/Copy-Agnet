/* 카피 QC 수술적 병합 — 통과한 안은 바이트 동일(엣지 보존), 문제 안만 교체 */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1300,height:900});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   App.keys.gemini='FAKE';
   App.brief={target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['나파가죽']};
   // 1안 = 엣지 있는 '통과' 카피(제품명사+USP 포함) / 2안 = 클리셰 + 제품명사 없음
   const EDGE={id:'A',key:'나파가죽 트렁크 매트, 순정보다 순정답게',sub:'테슬라 나파가죽 전용 재단',cta:'핏 확인하기',tone:'직격'};
   const BAD ={id:'B',key:'지금 바로 최고의 선택',sub:'특별한 혜택을 만나보세요',cta:'가기',tone:'감성'};
   App.copies=[JSON.parse(JSON.stringify(EDGE)),JSON.parse(JSON.stringify(BAD))];

   // 이슈 인덱스 파싱 — BAD(2안)만 지목되는지
   const issues=S2._audit(App.copies);
   out.issuesFound = issues.length>0;
   const idxs=S2._issueIdxs(issues);
   out.onlyBadIdx = idxs.indexOf(1)>=0 && idxs.indexOf(0)<0;

   // 모델이 '전부' 뭉툭하게 다시 써서 반환해도(플래트닝 시뮬) — 병합은 문제 안만 교체해야 함
   const realGen=Engine.gen;
   Engine.gen=async(kind,payload)=>{
     return [
       {id:'A',key:'프리미엄 트렁크 매트',sub:'좋은 나파가죽 매트',cta:'보기',tone:'직격'},   // 1안을 뭉툭하게 재작성(무시돼야 함)
       {id:'B',key:'나파가죽 트렁크 매트 실측 재단',sub:'테슬라 트렁크에 딱 맞게',cta:'핏 보기',tone:'감성'} // 2안 수정(채택돼야 함)
     ];
   };
   await S2.qcPass();
   Engine.gen=realGen;
   out.edgePreserved = App.copies[0].key===EDGE.key && App.copies[0].sub===EDGE.sub; // 1안 바이트 동일
   out.badReplaced   = App.copies[1].key!==BAD.key && /나파가죽/.test(App.copies[1].key);
   // 보정 후 이슈 감소
   out.fewerIssues = S2._audit(App.copies).length < issues.length;

   // 발산 설정 불변 확인 — temp 1.25(카피/분석) 유지, 수렴(refine)만 1.0
   out.tempDiverge = Engine._temp('copies')===1.25 && Engine._temp('analyze')===1.25;
   out.tempConverge = Engine._temp('refine')===1.0;

   // 중복 이슈("1안·2안")는 '뒤 안'만 교체 대상
   const dupIdx=S2._issueIdxs(['1안·2안: 메인이 사실상 중복']);
   out.dupTakesLater = dupIdx.length===1 && dupIdx[0]===1;

   // 모든 안이 깨끗하면 qcPass는 아무 것도 안 함(호출 자체 스킵)
   App.copies=[JSON.parse(JSON.stringify(EDGE))];
   let called=0;Engine.gen=async()=>{called++;return [];};
   await S2.qcPass();
   Engine.gen=realGen;
   out.cleanSkips = called===0 && App.copies[0].key===EDGE.key;

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['issuesFound','onlyBadIdx','edgePreserved','badReplaced','fewerIssues','tempDiverge','tempConverge','dupTakesLater','cleanSkips'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
