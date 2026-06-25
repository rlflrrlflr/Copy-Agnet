const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAHElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAvA0hAAABw3l8KQAAAABJRU5ErkJggg==';
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const R={};

 // BUG 1: with 검색보강(useResearch) ON, cat must STAY visible through research AND analyze
 R.catResearch=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   document.getElementById('inTarget').value='테슬라 오너';
   document.getElementById('inOffer').value='알리익스프레스 트렁크매트';
   App.brief.funnel='전환';App.keys.gemini='FAKE';App.provider='gemini';
   document.getElementById('inResearch').checked=true;
   // mock research (slow) and analyze gen (slow)
   Engine.research=async()=>{await new Promise(r=>setTimeout(r,250));return '리서치결과';};
   const realRun=Engine._run;
   Engine._run=async(kind,pl,isImg,strict)=>{await new Promise(r=>setTimeout(r,400));return Engine._sim(kind,pl);};
   const pr=S1.analyze();
   // sample overlay visibility across the whole analyze
   let visibleSamples=0,total=0;
   for(let i=0;i<12;i++){await new Promise(r=>setTimeout(r,60));total++;if(document.getElementById('catOverlay').classList.contains('show'))visibleSamples++;}
   await pr;
   return {visibleSamples,total,allVisible:visibleSamples===total};
 });

 // BUG 2: downloads must be 2K (>=2000px long edge)
 R.twoK=await p.evaluate(async(PNG)=>{
   await new Promise(res=>{const im=new Image();im.onload=()=>{S3._img[PNG]=im;res();};im.onerror=res;im.src=PNG;});
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=PNG;delete S3._img[App.doc.bgImage];S3._img[PNG]=S3._img[PNG];
   App.stage=4;App.final={variants:[{bg:PNG,full:true,dir:0,name:'완성안 1',ratio:'1:1'}],pick:0};
   // stage4 export canvas helper should be 2K
   const ec=await S4._exportCanvas(App.final.variants[0],'16:9');
   const s4ok=ec&&Math.max(ec.width,ec.height)>=2000;
   // stage3 export 2K
   UI.go(3);
   const e3=await S3._exportCanvas();
   const s3ok=e3&&Math.max(e3.width,e3.height)>=2000;
   return {s4ok,s4dim:ec?[ec.width,ec.height]:null,s3ok,s3dim:e3?[e3.width,e3.height]:null};
 },PNG);

 // BUG 3: clicking a stage-3 product thumbnail (real DOM) adds a movable image layer; clicking it on canvas selects it
 R.imgClick=await p.evaluate(async(PNG)=>{
   App.assets={products:[{id:'pp',name:'p.png',url:PNG,ar:1}],refs:[]};
   UI.go(3);Assets.render();
   const before=App.doc.layers.length;
   const cell=document.querySelector('#assetGrid3 div');
   cell.click();
   await new Promise(r=>setTimeout(r,150));
   const added=App.doc.layers.length===before+1;
   const imL=App.doc.layers.filter(l=>l.type==='image'&&l.role!=='logo')[0];
   // select on canvas
   let selOk=false;
   if(imL){const cv=document.getElementById('editCanvas');const b=S3.bbox(imL);
     selOk=S3.hit({x:b.x+b.w/2,y:b.y+b.h/2})===imL.id;}
   return {added,selOk};
 },PNG);

 // BUG 4: background is selectable — function, layer-list row, and empty-canvas click all select it
 R.bgSelect=await p.evaluate(()=>{
   App.doc.bgImage='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
   S3.layers();
   const row=[...document.querySelectorAll('#layerList .lay')].some(r=>/배경/.test(r.textContent));
   // empty-canvas click selects bg
   App.sel=null;App.sels=[];
   const cv=document.getElementById('editCanvas');
   // click a corner unlikely to hit a layer
   S3.onDown({target:cv,clientX:cv.getBoundingClientRect().left+3,clientY:cv.getBoundingClientRect().top+3,shiftKey:false,pointerId:1,stopPropagation(){}});
   const bgSelectedByClick=App.sel==='__bg__';
   // props shows bg panel
   S3.props();
   const bgPanel=/좌우반전/.test(document.getElementById("propBody").textContent)&&/배경 크기/.test(document.getElementById("propBody").textContent);
   return {fn:typeof S3.selectBg==='function',row,bgSelectedByClick,bgPanel,hasBgLayerOrSelect:true};
 });

 // EXTRA: stage-4 variation seed makes prompts diverge across generations + reframe preserves detail
 R.diverge=await p.evaluate(()=>{
   App.brand.accent='#e60023';
   const a=Engine._finalPrompt(App.doc,0,{seed:0},true);
   const bb=Engine._finalPrompt(App.doc,0,{seed:3},true); // same dir, different seed -> different nudge
   const seedDiffers=a!==bb&&/visually distinct/i.test(a);
   const reframeKeeps=/NEVER crop out the product/i.test(a)&&/extend\/outpaint/i.test(a);
   return {seedDiffers,reframeKeeps};
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 const ok=R.catResearch.allVisible&&R.twoK.s4ok&&R.twoK.s3ok&&R.imgClick.added&&R.imgClick.selOk
   &&R.bgSelect.fn&&R.bgSelect.row&&R.bgSelect.bgSelectedByClick&&R.bgSelect.bgPanel
   &&R.diverge.seedDiffers&&R.diverge.reframeKeeps&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
