const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:520,height:1400,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 // selection differs by funnel
 const sel=await p.evaluate(()=>{
   App.doc={layers:[],intent:{}};
   const out={};
   ['인지','유입','구매고려','전환','리타겟팅'].forEach(f=>{App.doc.intent={funnel:f};out[f]=Design.pickArchs(App.doc).join(',');});
   App.doc.intent={funnel:'전환'};App.doc.layers=[{type:'badge',text:'76%'}];out['전환+price뱃지']=Design.pickArchs(App.doc).join(',');
   return out;
 });
 console.log('archetype selection by funnel:');Object.entries(sel).forEach(([k,v])=>console.log('  '+k+' → '+v));
 // render all 5 archetypes without error
 const ok5=await p.evaluate(async()=>{
   document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';App.brief.funnel='유입';
   await S1.analyze();await new Promise(r=>setTimeout(r,300));S2.choose('A');await new Promise(r=>setTimeout(r,400));
   let okc=0; for(const a of ['impact','clean','price','timer','pop']){const c=document.createElement('canvas');try{Design.render(c,{bg:App.doc.bgImage,arch:a},App.doc);okc++;}catch(e){return 'ERR '+a+' '+e.message;}}
   return okc;
 });
 console.log('all 5 archetypes render:',ok5,'errors:',errs.length?errs.slice(0,4):'none');
 // screenshot stage4 (유입 → pop/impact/clean)
 await p.evaluate(()=>{UI.go(4);});await new Promise(r=>setTimeout(r,1400));
 await p.setViewport({width:900,height:1000,deviceScaleFactor:1.5});
 await p.screenshot({path:'/tmp/v29_pool4.png'});
 await b.close();
 const okk=(ok5===5)&&!errs.length&&sel['인지']!==sel['전환'];
 console.log(okk?'PASS':'FAIL');process.exit(okk?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
