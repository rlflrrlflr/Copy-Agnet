const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.4});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(async()=>{try{localStorage.removeItem('soszae_v29');}catch(e){}
   document.getElementById('inTarget').value='모델Y 쥬니퍼 오너';document.getElementById('inOffer').value='나파가죽 트렁크 매트';App.brief.funnel='전환';
   await S1.analyze();await new Promise(r=>setTimeout(r,300));S2.choose('A');await new Promise(r=>setTimeout(r,400));
   // set realistic copy + badge
   var k=App.doc.layers.filter(l=>l.role==='key')[0];k.text='트렁크 오염, 이젠 끝.';
   var s=App.doc.layers.filter(l=>l.role==='sub')[0];s.text='100% 방수 논슬립 가죽, 쥬니퍼 트렁크 오염·긁힘 완벽 차단.';
   S3.addBadge();var bd=Doc.byId(App.sel);bd.text='75%';bd.sub='최대';bd.style='burst';bd.color='#e60023';
   App.sel=k.id;S3.renderAll();
 });
 await new Promise(r=>setTimeout(r,400));
 await p.screenshot({path:'/tmp/v29_fix_s3.png'});
 await p.evaluate(()=>S4.open());await new Promise(r=>setTimeout(r,1700));
 await p.screenshot({path:'/tmp/v29_fix_s4.png'});
 await b.close();console.log('shots done');
})().catch(e=>{console.error(e.message);process.exit(1);});
