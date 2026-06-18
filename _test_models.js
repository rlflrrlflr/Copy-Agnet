const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1200,height:900});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   const cap=[];
   window.fetch=async(url,opt)=>{cap.push({url:String(url),body:opt&&opt.body?JSON.parse(opt.body):null});
     // fake gemini text + image responses
     if(/generateContent/.test(url)&&/image/i.test(url)){
       return {ok:true,json:async()=>({candidates:[{content:{parts:[{inlineData:{mimeType:'image/png',data:'AAAA'}}]}}]})};
     }
     return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({copies:[{key:'k',sub:'s',cta:'c',tone:'t',why:'w'}]})}]}}]})};
   };
   App.keys.gemini='FAKEKEY';App.provider='gemini';
   App.brief={offer:'트렁크 매트',target:'t',funnel:'전환'};
   App.analysis={pains:['p'],tones:['t']};
   App.doc={ratio:'4:5',bgHue:200,intent:{layoutType:'product-shot',visualCarries:'x',mood:'m'}};
   // text gen
   await Engine.gen('copies',{channel:'',seedKey:'',tones:['t'],pains:['p'],target:'t',offer:'트렁크 매트',funnel:'전환'});
   // image gen
   await Engine.gen('image',{layoutType:'product-shot',seedHue:200});
   const txt=cap.find(c=>/:generateContent/.test(c.url)&&!/image/i.test(c.url));
   const img=cap.find(c=>/image/i.test(c.url));
   return {
     textModel:/models\/([^:]+):/.exec(txt.url)[1],
     imgModel:/models\/([^:]+):/.exec(img.url)[1],
     imgHasConfig:!!(img.body.generationConfig&&img.body.generationConfig.imageConfig),
     imgSize:img.body.generationConfig.imageConfig.imageSize,
     imgAR:img.body.generationConfig.imageConfig.aspectRatio,
     imgModalities:img.body.generationConfig.responseModalities
   };
 });
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs:'none');
 await b.close();
 const ok=out.textModel==='gemini-3.1-pro-preview'
   && out.imgModel==='gemini-3-pro-image-preview'
   && out.imgHasConfig && out.imgSize==='2K' && out.imgAR==='4:5'
   && JSON.stringify(out.imgModalities)==='["IMAGE"]'
   && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
