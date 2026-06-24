const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   // distinct solid-color images: base=red, detail=blue
   function solid(col){var c=document.createElement('canvas');c.width=c.height=120;var x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,120,120);return c.toDataURL('image/png');}
   const RED=solid('#ff0000'),BLUE=solid('#0000ff');
   await new Promise(res=>{const i=new Image();i.onload=()=>{window.__r=i;res();};i.onerror=res;i.src=RED;});
   await new Promise(res=>{const i=new Image();i.onload=()=>{window.__b=i;res();};i.onerror=res;i.src=BLUE;});
   S3._img[RED]=window.__r;S3._img[BLUE]=window.__b;
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   App.assets={products:[{id:'p1',name:'scene.png',url:RED,ar:1},{id:'p2',name:'detail.png',url:BLUE,ar:1}],refs:[]};
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=RED;App.stage=3;

   // 1) detail layer image SELECTABLE in props
   const dl=Doc.detail(RED,{});App.doc.layers.push(dl);App.sel=dl.id;App.sels=[dl.id];UI.go(3);S3.props();
   const thumbs=[...document.querySelectorAll('#propBody img')];
   out.detailPicker=thumbs.length>=2;
   const other=thumbs.find(t=>t.src===BLUE);
   if(other)other.click();
   out.detailSelectable=dl.src===BLUE;

   // 2) addDetail rotates
   const beforeN=App.doc.layers.filter(l=>l.role==='detail').length;
   S3.addDetail();S3.addDetail();
   out.addDetailRotates=App.doc.layers.filter(l=>l.role==='detail').length===beforeN+2;

   // 3) composite bakes the detail into a final image at the right spot (blue appears on red base)
   out.compositeFn=typeof S4._compositeExtras==='function';
   App.doc.layers=App.doc.layers.filter(l=>l.role!=='detail');
   App.doc.layers.push(Doc.detail(BLUE,{nx:.6,ny:.58,wx:.3}));
   const composited=await S4._compositeExtras(RED);
   out.compositeChanges=typeof composited==='string'&&composited.indexOf('data:image/png')===0&&composited!==RED;
   out.compositeHasDetail=await new Promise(res=>{const im=new Image();im.onload=function(){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
     const px=x.getImageData(Math.round(im.width*0.75),Math.round(im.height*0.73),1,1).data; // detail center
     const corner=x.getImageData(2,2,1,1).data; // base corner (red)
     res(px[2]>120&&px[0]<120 && corner[0]>120&&corner[2]<120);};im.onerror=()=>res(false);im.src=composited;});

   // 4) prompts: safe-area + no-AI-inset
   App.brand.accent='#e60023';
   const fp=Engine._finalPrompt(App.doc,0,{seed:0},true);
   out.safeArea=/SAFE AREA/i.test(fp)&&/at least ~8% margin/i.test(fp);
   out.noAIinset=/Do NOT draw any circular photo inset/i.test(fp);
   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['detailPicker','detailSelectable','addDetailRotates','compositeFn','compositeChanges','compositeHasDetail','safeArea','noAIinset'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
