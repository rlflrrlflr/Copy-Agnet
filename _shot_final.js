const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:1180,deviceScaleFactor:1.4});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{try{localStorage.removeItem('soszae_v29');}catch(e){} S1.sample();S1.mode('full');});
 await new Promise(r=>setTimeout(r,200));
 await p.screenshot({path:'/tmp/v29_stage1_final.png'});
 await b.close();console.log('shot done');
})().catch(e=>{console.error(e.message);process.exit(1);});
