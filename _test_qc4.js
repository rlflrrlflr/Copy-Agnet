const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(col){var c=document.createElement('canvas');c.width=c.height=160;var x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,160,160);return c.toDataURL('image/png');}
   const RED=solid('#cc0000'),BLUE=solid('#0000cc');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__r=i;r();};i.onerror=r;i.src=RED;});
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.onerror=r;i.src=BLUE;});
   S3._img[RED]=window.__r;S3._img[BLUE]=window.__b;
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽',cta:'보기',tone:'직격'}];
   App.assets={products:[{id:'p1',name:'a.png',url:RED,ar:1},{id:'p2',name:'b.png',url:BLUE,ar:1}],refs:[]};
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=RED;App.stage=3;UI.go(3);

   // A) buttons nowrap
   out.btnNowrap=getComputedStyle(document.querySelector('#stage3 .btn')).whiteSpace==='nowrap';
   out.toolWrap=getComputedStyle(document.querySelector('.s3-tools')).flexWrap==='wrap';

   // C) background pan/zoom
   App.sel='__bg__';App.sels=[];S3.props();
   out.bgSizeSlider=[...document.querySelectorAll('#propBody input[type=range]')].length>=1 && [...document.querySelectorAll('#propBody input[type=number]')].some(n=>+n.min<0);
   // apply scale -40 via number
   const bgNum=[...document.querySelectorAll('#propBody input[type=number]')][0];
   bgNum.focus();bgNum.value='-40';bgNum.dispatchEvent(new Event('input',{bubbles:true}));
   out.bgScaleApplied=Math.abs(App.doc.bgScale-0.6)<0.02;
   out.bgNumFocusKept=document.activeElement===bgNum;
   // pan via onMove (bgmove)
   App.doc.bgX=0;App.doc.bgY=0;
   S3.drag={mode:'bgmove',sx:0,sy:0,obgx:0,obgy:0};
   const cv=document.getElementById('editCanvas');
   S3.onMove({clientX:cv.getBoundingClientRect().left+cv.clientWidth*0.2,clientY:cv.getBoundingClientRect().top});
   out.bgPan=Math.abs(App.doc.bgX)>0.05;
   S3.drag=null;
   // bakeBg returns a filled image when transformed
   App.doc.bgScale=0.6;App.doc.bgX=0.1;App.doc.bgY=0;
   const baked=await S3.bakeBg();
   out.bakeFilled=typeof baked==='string'&&baked.indexOf('data:image/png')===0&&baked!==RED;

   // D) detail/image-layer targeted chat
   out.chatLayerAware=/sel\.type==="image"/.test(S3.chat.toString())&&/baseEdit:sel\.src/.test(S3.chat.toString());

   // E) shared refs (Refs module, both strips, images())
   out.refsModule=typeof Refs==='object'&&typeof Refs.images==='function';
   App.chatRefs=[];Refs.list().push({kind:'image',name:'ref.png',url:BLUE});
   out.refsImages=Refs.images().length===1&&Refs.images()[0]===BLUE;
   Refs.render();
   out.refStripS3=!!document.querySelector('#s3refStrip img');
   out.s3refInput=!!document.getElementById('s3ref');

   // B) prompt: option1 large headline, option2 no badge, vertical safe-zone, badge-count guard
   App.brand.accent='#e60023';App.doc.ratio='9:16';
   const f1=Engine._finalPrompt(App.doc,0,{},true);
   out.headlineLarge=/headline must be LARGE and dominant/i.test(f1);
   out.vertSafe=/VERTICAL MEDIA SAFE ZONE/i.test(f1)&&/CENTRAL ~70% vertical/i.test(f1);
   const f2=Engine._finalPrompt(App.doc,1,{},true);
   out.witNoBadge=/Do NOT add any badge, sticker, price tag/i.test(f2);
   out.noBadgeGuard=/is NO badge in the spec/i.test(f1); // doc has no badge layer
   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['btnNowrap','toolWrap','bgSizeSlider','bgScaleApplied','bgNumFocusKept','bgPan','bakeFilled','chatLayerAware','refsModule','refsImages','refStripS3','s3refInput','headlineLarge','vertSafe','witNoBadge','noBadgeGuard'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
