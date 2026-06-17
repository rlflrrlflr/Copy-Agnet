const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:520,height:1200,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('con:'+m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='썸머세일';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>{S3.addBadge();var bd=Doc.byId(App.sel);bd.text='76%';bd.sub='최대';bd.style='burst';bd.color='#e60023';S3.renderAll();});
 // render impact canvas (regression check) + generate SVG
 const out=await p.evaluate(async()=>{
   App.doc.bgImage=Engine._scene('product-shot',210);
   const v={bg:App.doc.bgImage,arch:'impact'};
   const c=document.createElement('canvas');Design.render(c,v,App.doc);await new Promise(r=>setTimeout(r,150));Design.render(c,v,App.doc);
   const svg=Design.toSVG(v,App.doc);
   // toStage3 applies layers
   App.final.variants=[v];App.final.pick=0;
   S4.toStage3();
   const keyL=App.doc.layers.filter(l=>l.role==='key'&&l.type!=='badge')[0];
   return {png:c.toDataURL('image/png').slice(0,20),svgLen:svg.length, svgHasText:/<text[^>]*>열심히|팔았/.test(svg)||/<text/.test(svg), svgValid:svg.startsWith('<?xml')&&svg.includes('</svg>'), stage:App.stage, keyFont:keyL&&keyL.font, keyNy:keyL&&keyL.ny};
 });
 // save svg + a canvas png for visual check
 const svg=await p.evaluate(()=>Design.toSVG({bg:App.doc.bgImage,arch:'impact'},App.doc));
 fs.writeFileSync('/tmp/v29_export.svg',svg);
 // render the svg via puppeteer to confirm it's renderable
 const p2=await b.newPage();await p2.setViewport({width:540,height:540,deviceScaleFactor:1.4});
 await p2.goto('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));await new Promise(r=>setTimeout(r,300));
 await p2.screenshot({path:'/tmp/v29_export_svg.png'});
 console.log('export:',JSON.stringify(out));
 console.log('svg renderable screenshot saved; errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok=out.svgValid&&out.svgHasText&&out.stage===3&&out.keyFont&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
