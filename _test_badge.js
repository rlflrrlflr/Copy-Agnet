const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.4});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('con:'+m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,250));
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='썸머세일';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,600));
 const r=await p.evaluate(()=>{
   const out={};
   // add a disc badge + a ribbon badge, style + move
   S3.addBadge(); const b1=Doc.byId(App.sel); b1.text='76%'; b1.sub='최대'; b1.style='burst'; b1.color='#1f6feb'; b1.nx=.62; b1.ny=.06;
   S3.addBadge(); const b2=Doc.byId(App.sel); b2.style='ribbon'; b2.text='무료배송'; b2.sub=''; b2.color='#0a7d4d'; b2.nx=.06; b2.ny=.46; b2.rot=-6;
   S3.renderAll();
   out.badgeCount = App.doc.layers.filter(l=>l.type==='badge').length;
   out.bboxOk = (()=>{var bb=S3.bbox(b1);return bb.w>0&&bb.h>0;})();
   out.hit = (S3.hit((function(){var bb=S3.bbox(b1);return {x:bb.x+bb.w/2,y:bb.y+bb.h/2};})())===b1.id);
   // STAGE 4 carries badges? open and compose, count badge layers seen in final doc
   S4.open();
   out.stage=App.stage;
   out.finalHasBadges = App.doc.layers.filter(l=>l.type==='badge').length; // same doc → composited
   // intent summary reflects badges
   S4.intent(); out.intentText=document.getElementById('intentList').textContent.includes('76%');
   return out;
 });
 console.log('badge:',JSON.stringify(r));
 await new Promise(r=>setTimeout(r,400));
 // screenshot stage 3 with badges
 await p.evaluate(()=>UI.go(3));await new Promise(r=>setTimeout(r,400));
 await p.screenshot({path:'/tmp/v29_badge3.png'});
 await p.evaluate(()=>UI.go(4));await new Promise(r=>setTimeout(r,800));
 await p.screenshot({path:'/tmp/v29_badge4.png'});
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=r.badgeCount===2&&r.bboxOk&&r.hit&&r.stage===4&&r.finalHasBadges===2&&r.intentText&&!errs.length;
 console.log(ok?'ALL PASS':'SOME FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
