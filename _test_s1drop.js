const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const out=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const o={};
   // dropzones exist, textarea removed
   o.dzProduct=!!document.getElementById('dzProduct');
   o.dzRef=!!document.getElementById('dzRef');
   o.dzCtx=!!document.getElementById('dzCtx');
   o.textareaGone=!document.getElementById('ctxText');
   o.bound=!!(document.getElementById('dzProduct')._dropBound);
   // drag-over class toggles
   const dz=document.getElementById('dzProduct');
   dz.dispatchEvent(new Event('dragover',{bubbles:true,cancelable:true}));
   o.dragOver=dz.classList.contains('drag-over');
   dz.dispatchEvent(new Event('dragleave',{bubbles:true,cancelable:true}));
   o.dragLeave=!dz.classList.contains('drag-over');
   // simulate dropping a text file into context zone
   const file=new File(['경쟁사 대비 30% 저렴, 후기 4.8, 재구매율 높음'],'research.txt',{type:'text/plain'});
   Ctx.addFile([file]);
   await new Promise(r=>setTimeout(r,150));
   o.ctxAdded=App.ctx.length;
   o.ctxText=App.ctx[0]?App.ctx[0].value.slice(0,10):'';
   o.ctxKind=App.ctx[0]?App.ctx[0].kind:'';
   o.ctxRendered=document.getElementById('ctxList').children.length;
   // simulate product image add via addFiles with a data-url image File
   // build a tiny png blob
   const bytes=Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),c=>c.charCodeAt(0));
   const img=new File([bytes],'p.png',{type:'image/png'});
   Assets.addFiles('product',[img]);
   await new Promise(r=>setTimeout(r,200));
   o.products=App.assets.products.length;
   return o;
 });
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 await b.close();
 const ok=out.dzProduct&&out.dzRef&&out.dzCtx&&out.textareaGone&&out.bound
   &&out.dragOver&&out.dragLeave
   &&out.ctxAdded===1&&out.ctxKind==='text'&&out.ctxRendered===1
   &&out.products===1&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
