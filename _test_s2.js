const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   App.brief={offer:'쥬니퍼 전용 트렁크 매트 — 완벽 밀착',target:'테슬라 쥬니퍼 오너',funnel:'전환',visual:''};
   App.analysis=await Engine.gen('analyze',App.brief);
   await S2.regen(true);
   UI.go(2);
   const o={};
   o.count=App.copies.length;
   o.ids=App.copies.map(c=>c.id);
   o.cards=document.querySelectorAll('#copyGrid .copy-card').length;
   o.topCards=document.querySelectorAll('#copyGrid .copy-card.top').length;
   o.altCards=document.querySelectorAll('#copyGrid .copy-card.alt').length;
   o.ranks=[...document.querySelectorAll('#copyGrid .rank')].map(r=>r.textContent);
   // product noun present in at least one main/sub
   o.nounPresent=App.copies.some(c=>/매트/.test(c.key+c.sub));
   // editable: simulate editing the first card's key
   const firstK=document.querySelector('#copyGrid .copy-card .k[contenteditable]');
   firstK.textContent='쥬니퍼 트렁크 매트, 핏이 다릅니다';
   firstK.dispatchEvent(new Event('input',{bubbles:true}));
   o.editApplied=App.copies[0].key==='쥬니퍼 트렁크 매트, 핏이 다릅니다';
   // highlight on card click (not advance)
   document.querySelectorAll('#copyGrid .copy-card')[1].click();
   o.stageAfterCardClick=App.stage; // should stay 2
   o.highlighted=App.pick===App.copies[1].id;
   // pick button advances + uses edited copy
   document.querySelector('#copyGrid .copy-card .pick-btn').click();
   await new Promise(r=>setTimeout(r,300));
   o.stageAfterPick=App.stage; // 3
   o.docKey=App.doc?App.doc.layers[0].text:null; // should be edited key
   return o;
 });
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 await b.close();
 const ok=out.count===5 && out.cards===5 && out.topCards===3 && out.altCards===2
   && out.ranks[0]==='TOP 1' && out.ranks.includes('보조')
   && out.nounPresent && out.editApplied
   && out.stageAfterCardClick===2 && out.highlighted
   && out.stageAfterPick===3 && out.docKey==='쥬니퍼 트렁크 매트, 핏이 다릅니다'
   && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
