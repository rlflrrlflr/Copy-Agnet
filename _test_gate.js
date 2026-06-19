const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const out=await p.evaluate(async()=>{
   function solid(){const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');
     // smooth vertical gradient = 포그/실패 signature
     const g=x.createLinearGradient(0,0,0,200);g.addColorStop(0,'#d8d2cc');g.addColorStop(1,'#b0a89f');x.fillStyle=g;x.fillRect(0,0,200,200);return c.toDataURL('image/jpeg',0.9);}
   function busy(){const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,200,200);
     x.fillStyle='#111';x.font='900 40px sans-serif';x.fillText('한글 카피 텍스트',8,70);x.fillText('프리미엄 매트',8,130);
     x.fillStyle='#e60023';x.beginPath();x.arc(160,40,28,0,7);x.fill();return c.toDataURL('image/jpeg',0.9);}
   const efSolid=await Engine._imgEdge(solid());
   const efBusy=await Engine._imgEdge(busy());
   // S4 fallback: mock gen to return foggy gradient -> should degrade to Design
   App.brief={target:'t',offer:'트렁크 매트',funnel:'전환'};App.analysis={pains:['p'],tones:['t'],usps:['나파가죽'],copies:[]};
   Doc.initFromCopy({id:'A',key:'미니멀 매트',sub:'논슬립',cta:'확인',tone:'t'});
   App.keys.gemini='FAKE';App.final={variants:[],pick:0};
   const fog=solid();
   Engine.gen=async()=>fog; // always foggy
   await S4.generate();
   const allDegraded=App.final.variants.length===3 && App.final.variants.every(v=>v.full===false && v.degraded===true);
   return {efSolid:+efSolid.toFixed(4),efBusy:+efBusy.toFixed(4),allDegraded};
 });
 await b.close();
 console.log(JSON.stringify(out));
 console.log('errors:',errs.length?errs.slice(0,4):'none');
 const ok=out.efSolid<0.012 && out.efBusy>=0.012 && out.allDegraded && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
