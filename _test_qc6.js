const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c,w,h){var cv=document.createElement('canvas');cv.width=w||200;cv.height=h||200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,cv.width,cv.height);return cv.toDataURL();}
   const SCENE=solid('#3377cc',400,400), LOGO=solid('#ff8800',200,80);
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__s=i;r();};i.src=SCENE;});
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__l=i;r();};i.src=LOGO;});
   S3._img[SCENE]=window.__s;S3._img[LOGO]=window.__l;
   App.copies=[{id:'A',key:'완벽한 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   App.brand.logo=LOGO;App.brand.accent='#e60023';
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=SCENE;App.stage=3;
   S3.ensureLogo(); // adds logo layer

   // 1) LOGO composited into stage-4 output (orange logo appears top-right on blue base)
   const composited=await S4._compositeExtras(SCENE);
   out.logoComposited=await new Promise(res=>{const im=new Image();im.onload=function(){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
     // logo layer default nx .74 ny .05 wx .20 -> sample inside it
     const px=x.getImageData(Math.round(im.width*0.80),Math.round(im.height*0.08),1,1).data;
     res(px[0]>180&&px[1]>90&&px[2]<90);};im.onerror=()=>res(false);im.src=composited;});
   // _finalPrompt tells AI NOT to draw a logo; logo not in spec elements
   const fp=Engine._finalPrompt(App.doc,0,{},true);
   out.noAILogo=/Do NOT draw, render, write or invent ANY logo/i.test(fp)&&!/"el":"logo"/.test(fp);

   // 2) per-layer shadow + color
   const keyL=App.doc.layers.filter(l=>l.role==='key')[0];
   App.sel=keyL.id;App.sels=[keyL.id];UI.go(3);S3.props();
   const ranges=[...document.querySelectorAll('#propBody input[type=range]')];
   out.shadowSlider=ranges.length>=2; // size + shadow
   const colors=[...document.querySelectorAll('#propBody input[type=color]')];
   out.shadowColorPicker=colors.length>=2; // text color + shadow color
   // set per-layer scrim + color, draw uses hexRgb
   keyL.scrim=0.7;keyL.scrimColor='#ff0000';
   out.hexRgb=S3._hexRgb('#ff0000')==='255,0,0'&&S3._hexRgb('#000')==='0,0,0';
   out.perLayerDraws=(function(){try{S3.draw();return true;}catch(e){return false;}})();

   // 3) stage-3 export uses native+upscale (no size rescale), returns 2K canvas
   out.exportSafe=/imageSmoothingQuality/.test(S3._exportCanvas.toString())&&!/l.size=l.size\*k/.test(S3._exportCanvas.toString())&&/document.fonts/.test(S3._exportCanvas.toString());
   const ec=await S3._exportCanvas();
   out.export2K=ec&&Math.max(ec.width,ec.height)>=2000;

   // 4) refs flow to stage-4 final gen (chatRefs reach _imgParts)
   const parts=Engine._imgParts('x',null,false,[LOGO]);
   out.refsFlow=parts.filter(pt=>pt.inlineData).length===1;
   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['logoComposited','noAILogo','shadowSlider','shadowColorPicker','hexRgb','perLayerDraws','exportSafe','export2K','refsFlow'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
