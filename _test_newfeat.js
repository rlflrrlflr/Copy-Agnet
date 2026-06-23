const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const r=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   // ---- Q1: research wiring ----
   out.hasCheckbox=!!document.getElementById('inResearch');
   out.researchFn=typeof Engine.research==='function';
   out.researchGemFn=typeof Engine._geminiResearch==='function';
   out.rblockFn=typeof Engine._researchBlock==='function';
   // empty -> no block
   App.brief={target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   out.rblockEmpty=Engine._researchBlock()==='';
   // set research -> block appears AND is injected into prompts
   App.brief.research='1) 시장: 차량용 매트 수요 증가\n2) 경쟁: 순정 대비 가격 강조';
   const blk=Engine._researchBlock();
   out.rblockHas=/검색 리서치/.test(blk)&&/나파가죽/.test(blk+App.brief.offer);
   const pa=Engine._prompt('analyze',{target:App.brief.target,offer:App.brief.offer,funnel:'전환'});
   out.analyzeInject=/검색 리서치/.test(pa.user)&&/순정 대비/.test(pa.user);
   const pc=Engine._prompt('copies',{target:'t',offer:'o',pains:['x'],usps:['나파가죽'],tones:['직격']});
   out.copiesInject=/검색 리서치/.test(pc.user);
   // collect reads checkbox
   document.getElementById('inResearch').checked=true;
   document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';
   const cb=S1.collect();
   out.collectReads=cb.useResearch===true;
   document.getElementById('inResearch').checked=false;
   out.collectReadsOff=S1.collect().useResearch===false;

   // ---- Q2: critique + qcFix + baseOverride ----
   out.critiqueFn=typeof Engine.imageCritique==='function';
   out.qcFixFn=typeof S4.qcFix==='function';
   out.hasQcBtn=!!document.getElementById('s4qc');
   // qcFix guards (no key): should toast, not throw
   App.keys={gemini:'',claude:''};
   App.final={variants:[{bg:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',full:true,dir:0}],pick:0};
   App.doc={ratio:'1:1',layers:[{role:'key',text:'테스트'}],intent:{}};
   let qcSafe=true;try{await S4.qcFix();}catch(e){qcSafe=false;}
   out.qcNoKeySafe=qcSafe;
   // qcFix on non-full variant
   App.keys.gemini='FAKE';App.final.variants[0].full=false;
   let qcSafe2=true;try{await S4.qcFix();}catch(e){qcSafe2=false;}
   out.qcNonFullSafe=qcSafe2;
   return out;
 });

 await b.close();
 console.log(JSON.stringify(r,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 const ok=r.hasCheckbox&&r.researchFn&&r.researchGemFn&&r.rblockFn&&r.rblockEmpty&&r.rblockHas
   &&r.analyzeInject&&r.copiesInject&&r.collectReads&&r.collectReadsOff
   &&r.critiqueFn&&r.qcFixFn&&r.hasQcBtn&&r.qcNoKeySafe&&r.qcNonFullSafe&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
