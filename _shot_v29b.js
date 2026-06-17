const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});
 const p=await b.newPage();await p.setViewport({width:1340,height:980,deviceScaleFactor:1.4});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,250));
 // capture cat overlay (force show)
 await p.evaluate(()=>Cat.show('image'));
 await new Promise(r=>setTimeout(r,650));
 await p.screenshot({path:'/tmp/v29b_cat.png'});
 // confirm hide works after delay
 const hid=await p.evaluate(async()=>{Cat.hide();await new Promise(r=>setTimeout(r,350));return !document.getElementById('catOv').classList.contains('on');});
 console.log('overlay hidden after hide()+delay:',hid);
 // to stage3, rotate a layer, screenshot editor with rotate handle + align panel
 await p.evaluate(()=>{document.getElementById('inTarget').value='마진 5% 1인 셀러';document.getElementById('inOffer').value='알리바바 직소싱';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,600));
 await p.evaluate(()=>{App.sel=App.doc.layers[0].id;var L=Doc.byId(App.sel);L.rot=-8;S3.renderAll();});
 await new Promise(r=>setTimeout(r,300));
 await p.screenshot({path:'/tmp/v29b_editor.png'});
 await b.close(); console.log('shots done');
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
