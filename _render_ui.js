const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:560,height:1400,deviceScaleFactor:2});
 p.on('pageerror',()=>{});
 await p.goto('file://'+path.resolve('v27_copy_engine.html'),{waitUntil:'domcontentloaded'}).catch(()=>{});
 await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>{
   ['header','footer','#sectionLoop','#sectionFinal','#statusBar'].forEach(s=>{var e=document.querySelector(s);if(e)e.style.display='none';});
   // hide stage-1 input section (first section in main)
   var secs=document.querySelectorAll('main section'); if(secs[0])secs[0].style.display='none';
   var sc=document.getElementById('sectionCompose'); if(sc)sc.classList.remove('hidden');
   var cb=document.getElementById('composeBody'); if(cb)cb.classList.remove('hidden');
   var ce=document.getElementById('composeEmpty'); if(ce)ce.style.display='none';
   var ov=document.getElementById('catOverlay'); if(ov)ov.style.display='none';
   try{ if(typeof showPanel==='function') showPanel('default'); }catch(e){}
   // collapse the left (canvas) column so the right control panel is full-width readable
   var cols=cb?cb.children:[]; if(cols[0])cols[0].style.display='none';
 });
 await new Promise(r=>setTimeout(r,300));
 const el=await p.$('#sectionCompose');
 if(el){await el.screenshot({path:'/tmp/ui_panel.png'});console.log('panel shot ok');}
 else console.log('no section');
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
