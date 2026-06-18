const puppeteer=require('puppeteer'),path=require('path');
// tiny 2x2 red png dataURL
const RED='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEUlEQVR4nGP8z8Dwn4EIwDiKAQB0xQv8wYwQ3wAAAABJRU5ErkJggg==';
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:1000,deviceScaleFactor:1.3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const r=await p.evaluate(async(RED)=>{
   const out={};
   // add product + detail + ref directly to model + preload
   function addAsset(kind,url){return new Promise(res=>{var o={id:'x'+Math.random(),name:'a.png',url:url};(kind==='product'?App.assets.products:App.assets.refs).push(o);var im=new Image();im.onload=function(){S3._img[url]=im;o.ar=im.height/im.width;res();};im.src=url;});}
   await addAsset('product',RED); await addAsset('product',RED); await addAsset('ref',RED);
   Assets.render(); out.gridCount=document.getElementById('assetGrid').querySelectorAll('img').length;
   // image-gen prompt contains identity-lock + parts
   const prompt=Engine._imagePrompt({layoutType:'product-shot'}); out.lock=/IDENTITY LOCKED/.test(prompt)&&/NEVER redraw/.test(prompt); out.ref=/STYLE REFERENCE/.test(prompt);
   const parts=Engine._imgParts(prompt); out.parts=parts.length; out.partsInline=parts.filter(x=>x.inlineData).length;
   // flow to stage3, use product as bg + as layer
   document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';App.brief.funnel='전환';
   await S1.analyze(); await new Promise(r=>setTimeout(r,300)); S2.choose('A'); await new Promise(r=>setTimeout(r,400));
   Assets.toBg(RED); out.bgSet=(App.doc.bgImage===RED);
   const before=App.doc.layers.length; Assets.toLayer(RED); await new Promise(r=>setTimeout(r,150));
   out.imgLayer=(App.doc.layers.length===before+1 && App.doc.layers.some(l=>l.type==='image'));
   out.grid3=document.getElementById('assetGrid3').querySelectorAll('img').length;
   return out;
 },RED);
 console.log('assets:',JSON.stringify(r));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=r.gridCount===3&&r.lock&&r.ref&&r.parts===4&&r.partsInline===3&&r.bgSet&&r.imgLayer&&r.grid3===3&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
