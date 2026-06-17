const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1340,height:1000,deviceScaleFactor:1.4});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push('con:'+m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='o';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 const r=await p.evaluate(async()=>{
   const out={};
   // brand accent applies to render
   Brand.setAccent('#1f6feb');
   App.doc.bgImage=Engine._scene('product-shot',210);
   const v={bg:App.doc.bgImage,arch:'impact'}; const c=document.createElement('canvas'); Design.render(c,v,App.doc);
   const svg=Design.toSVG(v,App.doc); out.brandAccentInSvg = svg.includes('#1f6feb');
   // brand logo op present
   const tiny='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
   App.brand.logo=tiny; const svg2=Design.toSVG(v,App.doc); out.logoInSvg = svg2.includes('<image href="'+tiny);
   App.brand.logo=null;
   // stage4 marketer controls
   S4.open(); await new Promise(r=>setTimeout(r,600));
   out.variants=App.final.variants.length;
   const oldArch=App.final.variants[0].arch; S4.setArch('pop'); out.archChanged=(App.final.variants[0].arch==='pop'&&oldArch!=='pop');
   S4.setAccent('#0a7d4d'); out.accentSet=(App.final.variants[0].accent==='#0a7d4d');
   out.archSelectFilled=document.getElementById('s4arch').options.length===5;
   return out;
 });
 console.log('brand/controls:',JSON.stringify(r));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=r.brandAccentInSvg&&r.logoInSvg&&r.variants===3&&r.archChanged&&r.accentSet&&r.archSelectFilled&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
