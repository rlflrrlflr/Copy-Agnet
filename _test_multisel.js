const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));

 // helper to dispatch a pointer event on the canvas at normalized coords with optional shift
 const out=await p.evaluate(async()=>{
   const o={};try{localStorage.removeItem('soszae_v29');}catch(e){}
   App.brief={offer:'에어프라이어',target:'1인 가구',funnel:'전환',visual:''};
   Doc.initFromCopy({key:'메인 헤드라인',sub:'서브 카피',cta:'구매하기',tone:'확신'});
   UI.go(3);
   const layers=App.doc.layers; // key, sub, cta
   const key=layers[0],sub=layers[1],cta=layers[2];
   // place them at known spots
   key.nx=.1;key.ny=.2; sub.nx=.1;sub.ny=.5; cta.nx=.1;cta.ny=.8;
   S3.draw();

   const cv=document.getElementById('editCanvas');
   function center(l){var bb=S3.bbox(l);var r=cv.getBoundingClientRect();var sc=r.width/cv.width;
     return {x:r.left+(bb.x+bb.w/2)*sc, y:r.top+(bb.y+bb.h/2)*sc};}
   function down(l,shift){var c=center(l);var e={target:cv,clientX:c.x,clientY:c.y,shiftKey:!!shift,pointerId:1};
     cv.setPointerCapture=function(){};S3.onDown(e);}
   function move(dxNorm,dyNorm){var W=cv.width,H=cv.height;
     // simulate a move event: start point was last down center; create move at +delta
     var e={clientX:0,clientY:0};
     // easier: call onMove with synthetic point via canvasPoint override
     return;}

   // 1) plain click key → single select
   down(key,false);
   o.afterKey=S3.selIds().slice();
   // 2) shift-click sub → group {key,sub}
   down(sub,true);
   o.afterShiftSub=S3.selIds().slice();
   // 3) shift-click cta → group {key,sub,cta}
   down(cta,true);
   o.afterShiftCta=S3.selIds().slice();
   o.primary=App.sel;
   // 4) overlay should render 3 boxes, 1 with handles
   S3.overlay();
   o.boxes=document.querySelectorAll('#overlay .selbox').length;
   o.subBoxes=document.querySelectorAll('#overlay .selbox.sub').length;
   o.handles=document.querySelectorAll('#overlay .hdl').length;
   // 5) shift-click sub again → toggles OUT
   down(sub,true);
   o.afterToggleOut=S3.selIds().slice();
   o.subStillSelected=S3.isSel(sub.id);

   // 6) group drag: select key+cta, drag by +0.2x via onMove simulation
   App.sels=[key.id,cta.id];App.sel=key.id;
   var kx0=key.nx,cx0=cta.nx,ky0=key.ny,cy0=cta.ny;
   var bb=S3.bbox(key);var r=cv.getBoundingClientRect();var sc=r.width/cv.width;
   var startC={x:r.left+(bb.x+bb.w/2)*sc,y:r.top+(bb.y+bb.h/2)*sc};
   cv.setPointerCapture=function(){};
   S3.onDown({target:cv,clientX:startC.x,clientY:startC.y,shiftKey:false,pointerId:1});
   // move +0.2*W px to the right, +0.1*H down
   var W=cv.width,H=cv.height;
   S3.onMove({clientX:startC.x+0.2*W*sc,clientY:startC.y+0.1*H*sc});
   o.keyMovedX=+(key.nx-kx0).toFixed(2);
   o.ctaMovedX=+(cta.nx-cx0).toFixed(2);
   o.keyMovedY=+(key.ny-ky0).toFixed(2);
   o.ctaMovedY=+(cta.ny-cy0).toFixed(2);
   o.subMovedX=+(sub.nx-.1).toFixed(2); // sub NOT in group → unmoved
   S3.onUp({});

   // 7) group delete via keyboard
   App.sels=[sub.id,cta.id];App.sel=cta.id;
   var before=App.doc.layers.length;
   document.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete'}));
   o.deletedCount=before-App.doc.layers.length;
   o.selsAfterDelete=S3.selIds().length;

   // 8) Ctrl+A select all (remaining = key only)
   document.dispatchEvent(new KeyboardEvent('keydown',{key:'a',ctrlKey:true}));
   o.selectAll=S3.selIds().length;
   return o;
 });
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 await b.close();
 const ok = out.afterKey.length===1
   && out.afterShiftSub.length===2
   && out.afterShiftCta.length===3
   && out.boxes===3 && out.subBoxes===2 && out.handles===3
   && out.afterToggleOut.length===2 && out.subStillSelected===false
   && out.keyMovedX===0.20 && out.ctaMovedX===0.20 && out.keyMovedY===0.10 && out.ctaMovedY===0.10
   && out.subMovedX===0.00
   && out.deletedCount===2 && out.selsAfterDelete===0
   && out.selectAll===1
   && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
