const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAHElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAvA0hAAABw3l8KQAAAABJRU5ErkJggg==';

 // build doc + go to stage 3 with a product asset
 await p.evaluate(async(PNG)=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   App.brief={target:'t',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['나파가죽']};
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽 트렁크 매트',cta:'보기',tone:'직격'}];
   await new Promise(res=>{const im=new Image();im.onload=()=>{S3._img[PNG]=im;res();};im.onerror=res;im.src=PNG;});
   App.assets={products:[{id:'pp',name:'p.png',url:PNG,ar:1}],refs:[]};
   Doc.initFromCopy(App.copies[0]);
   UI.go(3);
 },PNG);
 await wait(400);

 // 1) Click the product thumbnail in the stage-3 asset grid (real DOM click)
 const before=await p.evaluate(()=>App.doc.layers.length);
 const clicked=await p.evaluate(()=>{
   const host=document.getElementById('assetGrid3');
   if(!host)return 'no-grid';
   const cell=host.querySelector('div'); // first asset cell
   if(!cell)return 'no-cell';
   cell.click();
   return 'clicked';
 });
 await wait(300);
 const after=await p.evaluate(()=>App.doc.layers.length);
 const imgLayer=await p.evaluate(()=>{const l=App.doc.layers.filter(l=>l.type==='image'&&l.role!=='logo')[0];return l?{nx:l.nx,ny:l.ny,wx:l.wx,hasImg:!!S3._img[l.src]}:null;});

 // 2) Real pointer event on canvas at the image center -> should select it
 const sel=await p.evaluate(()=>{
   const l=App.doc.layers.filter(l=>l.type==='image'&&l.role!=='logo')[0];if(!l)return 'no-layer';
   const cv=document.getElementById('editCanvas');const b=S3.bbox(l);
   const sc=cv.clientWidth/cv.width;const rect=cv.getBoundingClientRect();
   const px=rect.left+(b.x+b.w/2)*sc, py=rect.top+(b.y+b.h/2)*sc;
   const ev=new PointerEvent('pointerdown',{clientX:px,clientY:py,bubbles:true,pointerId:1});
   cv.dispatchEvent(ev);
   return App.sel===l.id?'selected':'not-selected(sel='+App.sel+')';
 });

 await b.close();
 console.log('thumbnail click:',clicked,' layers',before,'->',after);
 console.log('imgLayer:',JSON.stringify(imgLayer));
 console.log('canvas select:',sel);
 console.log('errors:',errs.length?errs.slice(0,8):'none');
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
