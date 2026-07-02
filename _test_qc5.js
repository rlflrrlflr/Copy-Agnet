const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.setViewport({width:1400,height:900});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 // B) header responsive at narrow width — no element overflows horizontally beyond viewport much
 await p.setViewport({width:430,height:850});await wait(200);
 const header=await p.evaluate(()=>{
   const out={};
   // step labels hidden on mobile, numbers still visible
   const lbl=document.querySelector('.step .stp-l');
   out.stepLabelHiddenMobile=lbl?getComputedStyle(lbl).display==='none':false;
   out.modeBadgeHidden=getComputedStyle(document.getElementById('modeBadge')).display==='none';
   // header doesn't cause big horizontal overflow
   out.noWideOverflow=document.documentElement.scrollWidth<=document.documentElement.clientWidth+4;
   // logo single line
   out.logoNowrap=getComputedStyle(document.querySelector('.logo')).whiteSpace==='nowrap';
   return out;
 });
 await p.setViewport({width:1400,height:900});await wait(150);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const BG=solid('#3377cc');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__bg=i;r();};i.src=BG;});
   S3._img[BG]=window.__bg;
   App.copies=[{id:'A',key:'k',sub:'s',cta:'c',tone:'t'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.brand.accent='#e60023';

   // A) panned base -> outpaint instruction present
   App.doc.bgScale=0.6;App.doc.bgX=0.1;App.doc.bgY=0;
   App._effBgPanned=true;
   const fp=Engine._finalPrompt(App.doc,0,{},true);
   out.outpaintWhenPanned=/seamlessly OUTPAINT/i.test(fp)&&/do NOT keep any blur/i.test(fp);
   App._effBgPanned=false;
   const fp2=Engine._finalPrompt(App.doc,0,{},true);
   out.noOutpaintWhenFlat=!/seamlessly OUTPAINT/i.test(fp2);
   // bakeBg sets fill (already tested in qc4); ensure panned flag computed in generate exists in code
   out.pannedFlagWired=/App\._effBgPanned=/.test(S4.generate.toString());

   // C) per-ratio export modal
   out.exportFns=['openExport','closeExport','renderExport','genRatio','genCustom','_nearestAR','_exportItems'].every(f=>typeof S4[f]==='function');
   out.modalExists=!!document.getElementById('exportModal')&&!!document.getElementById('exportGrid');
   // nearest AR
   out.nearestAR=S4._nearestAR(1200,628)==='2:1'?false:(['16:9','2:1','21:9'].indexOf(S4._nearestAR(1200,628))>=0); // ~1.91 -> 16:9 or 21:9
   // open modal renders cells (4 presets)
   App.stage=4;App.final={variants:[{bg:BG,full:true,dir:0,name:'완성안 1',ratio:'1:1'}],pick:0};
   S4.openExport();
   out.modalOpen=!document.getElementById('exportModal').classList.contains('hidden');
   out.presetCells=document.querySelectorAll('#exportGrid .export-cell').length===5; // 표준 4 + 카카오 비즈보드
   // custom add -> 6th cell
   document.getElementById('cw').value='1200';document.getElementById('ch').value='628';
   S4.genCustom();
   await new Promise(r=>setTimeout(r,300));
   out.customCellAdded=document.querySelectorAll('#exportGrid .export-cell').length===6;
   // a ratio gets cached (fallback fit from v.bg, no key)
   const v=App.final.variants[0];
   out.customCached=!!(v._ratioCache&&Object.keys(v._ratioCache).some(k=>/custom/.test(k)));
   S4.closeExport();
   out.modalClosed=document.getElementById('exportModal').classList.contains('hidden');
   return out;
 });

 await b.close();
 console.log('header:',JSON.stringify(header));
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['outpaintWhenPanned','noOutpaintWhenFlat','pannedFlagWired','exportFns','modalExists','nearestAR','modalOpen','presetCells','customCellAdded','customCached','modalClosed'];
 const hk=['stepLabelHiddenMobile','modeBadgeHidden','noWideOverflow','logoNowrap'];
 const ok=keys.every(k=>R[k])&&hk.every(k=>header[k])&&!errs.length;
 console.log('FAILED R:',keys.filter(k=>!R[k]),' H:',hk.filter(k=>!header[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
