const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   const o={};try{localStorage.removeItem('soszae_v30');}catch(e){}
   // ---- robust JSON parse (fences + leading thinking text) ----
   o.json1=JSON.stringify(Engine._json('```json\n{"copies":[{"key":"a"}]}\n```'));
   o.json2=JSON.stringify(Engine._json('생각: 좋아.\n{"pains":["x"],"tones":["t"],"usps":["나파가죽"]}\n끝'));
   // ---- analyze sim extracts usps from offer ----
   const a=Engine._sim('analyze',{target:'t',offer:'쥬니퍼 전용 트렁크 매트 — 나파가죽, IPX7 방수, 1.2mm 논슬립'});
   o.usps=a.usps;
   o.uspHasNappa=a.usps.indexOf('나파가죽')>=0;
   // ---- stuck-button bug: analyze with NO keys (sim path) must advance + reset button ----
   document.getElementById('inTarget').value='테슬라 쥬니퍼 오너';
   document.getElementById('inOffer').value='쥬니퍼 전용 트렁크 매트 — 나파가죽, IPX7 방수';
   App.brief.funnel='전환';
   [].forEach.call(document.getElementById('funnelChips').children,c=>c.classList.toggle('on',c.textContent==='전환'));
   await S1.analyze();
   o.stage=App.stage; // expect 2
   o.btnText=document.getElementById('s1btn').textContent; // reset, no '분석 중'
   o.btnBusy=document.getElementById('s1btn').dataset.busy; // '0'
   o.copies=App.copies.length; // 5
   o.uspInCopy=App.copies.some(c=>/나파가죽/.test(c.key+c.sub)); // sim weaves usp? sim uses prodNoun, not usp; check at least product noun
   o.analysisUspShown=/USP/.test(document.getElementById('s2analysis').textContent);
   return o;
 });
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 await b.close();
 const ok=out.json1==='{"copies":[{"key":"a"}]}'
   && /나파가죽/.test(out.json2)
   && out.uspHasNappa
   && out.stage===2 && !/분석 중/.test(out.btnText) && out.btnBusy==='0' && out.copies===5
   && out.analysisUspShown
   && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
