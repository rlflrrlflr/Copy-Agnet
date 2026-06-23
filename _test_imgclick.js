const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const r=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEUlEQVR42mNk+M9Qz0BkYAAA9wEC9bL0YwAAAABJRU5ErkJggg==';
   // Build a doc from a copy and go to stage 3
   App.brief={target:'t',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['나파가죽'],copies:[]};
   App.copies=[{id:'A',key:'메인 카피',sub:'서브 카피',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]); App.stage=3; UI.go(3);
   await new Promise(r=>setTimeout(r,150));
   const before=App.doc.layers.length;
   // Path 1: toolbar +image -> addImage directly (await load)
   await new Promise(res=>{ const im=new Image(); im.onload=function(){S3._img[PNG]=im; S3.addImage(PNG); res();}; im.src=PNG; });
   await new Promise(r=>setTimeout(r,120));
   out.layerAdded = App.doc.layers.length===before+1;
   const imgL = App.doc.layers.filter(l=>l.type==='image')[0];
   out.hasImageLayer=!!imgL;
   // is it in the #layerList DOM?
   out.inLayerList = /이미지/.test(document.getElementById('layerList').innerHTML);
   // is it hit-testable at its center?
   if(imgL){
     const cv=document.getElementById('editCanvas');const W=cv.width,H=cv.height;
     const b2=S3.bbox(imgL);
     const cx=b2.x+b2.w/2, cy=b2.y+b2.h/2;
     out.bbox={x:Math.round(b2.x),y:Math.round(b2.y),w:Math.round(b2.w),h:Math.round(b2.h)};
     out.hitCenter = S3.hit({x:cx,y:cy})===imgL.id;
   }
   // Path 2: product thumbnail -> Assets.toLayer
   App.assets={products:[{id:'pp',name:'p.png',url:PNG,ar:1}],refs:[]};
   Assets.render();
   const before2=App.doc.layers.length;
   Assets.toLayer(PNG);
   await new Promise(r=>setTimeout(r,120));
   out.toLayerAdded = App.doc.layers.length===before2+1;
   return out;
 });

 await b.close();
 console.log(JSON.stringify(r,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
