const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAHElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAvA0hAAABw3l8KQAAAABJRU5ErkJggg==';
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async(PNG)=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   await new Promise(res=>{const im=new Image();im.onload=()=>{window.__img=im;res();};im.onerror=res;im.src=PNG;});
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   App.assets={products:[{id:'p1',name:'a.png',url:PNG,ar:1},{id:'p2',name:'detail.png',url:PNG,ar:1}],refs:[]};
   S3._img[PNG]=window.__img;
   Doc.initFromCopy(App.copies[0]);UI.go(3);

   // 1) UNDO/REDO
   out.historyExists=typeof History==='object'&&typeof History.undoIt==='function';
   const n0=App.doc.layers.length;
   S3.addText(); // mutate + renderAll -> commit
   const n1=App.doc.layers.length;
   History.undoIt();
   const nUndo=App.doc.layers.length;
   History.redoIt();
   const nRedo=App.doc.layers.length;
   out.undoWorks=(n1===n0+1)&&(nUndo===n0)&&(nRedo===n0+1);

   // 2) IMAGE 0-CENTERED ZOOM
   S3.addImage(PNG);
   const imL=App.doc.layers.filter(l=>l.type==='image'&&l.role==='image')[0];
   App.sel=imL.id;App.sels=[imL.id];S3.props();
   const numEl=[...document.querySelectorAll('#propBody input[type=number]')][0];
   out.zeroCenter = numEl && (+numEl.min<0) && Math.abs(+numEl.value)<2; // 0 at original
   // type -50 -> shrink
   numEl.focus();numEl.value='-50';numEl.dispatchEvent(new Event('input',{bubbles:true}));
   out.shrinkWorks = imL.wx < imL._wx0;
   out.numFocusKept = document.activeElement===numEl;

   // 3) DETAIL CUT circular movable layer
   out.detailFn=typeof Doc.detail==='function'&&typeof S3.ensureDetails==='function'&&typeof S3.addDetail==='function';
   S3.ensureDetails();
   const dl=App.doc.layers.filter(l=>l.role==='detail')[0];
   out.detailAdded=!!dl&&dl.shape==='circle';
   // bbox square + draw no error
   if(dl){const bx=S3.bbox(dl);out.detailSquare=Math.abs(bx.w-bx.h)<1; App.sel=dl.id;App.sels=[dl.id]; S3.draw(); out.detailMovable=!dl.locked;}
   out.detailBtn=!!document.querySelector('#stage3 button[onclick="S3.addDetail()"]');

   // 4) STAGE 3 CHAT + intent
   out.s3chat=typeof S3.chat==='function'&&!!document.getElementById('s3msg');
   out.intentKeep=Engine.classifyIntent('톤만 더 따뜻하게')==='keep';
   out.intentNew=Engine.classifyIntent('완전히 다른 컨셉으로 새로 만들어줘')==='new';

   // 5) STAGE 4 reference attach
   out.s4ref=typeof S4.addRef==='function'&&typeof S4.renderRefs==='function'&&!!document.getElementById('s4ref');
   S4._refs=[];S4._refs.push({kind:'image',name:'r.png',url:PNG});
   const parts=Engine._imgParts('x',null,false,[PNG]);
   out.chatRefInParts=parts.some(pt=>pt.inlineData);

   // 6) SEED/TEMPLATE: no diagonal/split; reframe; anti-split rule
   App.brand.accent='#e60023';
   const f0=Engine._finalPrompt(App.doc,0,{seed:0},true);
   out.noSplitRule=/do NOT use a diagonal split-screen/i.test(f0)&&!/diagonal composition/i.test(f0);
   const fr=Engine._finalPrompt(App.doc,0,{reframe:true,baseOverride:PNG},true);
   out.reframeKeepsDesign=/WITHOUT changing the design/i.test(fr)&&/do NOT use a split-screen/i.test(fr);
   // wit direction present in option #2
   const f1=Engine._finalPrompt(App.doc,1,{},true);
   out.witTemplate=/WIT/i.test(f1);

   return out;
 },PNG);

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['historyExists','undoWorks','zeroCenter','shrinkWorks','numFocusKept','detailFn','detailAdded','detailSquare','detailMovable','detailBtn','s3chat','intentKeep','intentNew','s4ref','chatRefInParts','noSplitRule','reframeKeepsDesign','witTemplate'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
