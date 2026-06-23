const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEUlEQVR42mNk+M9Qz0BkYAAA9wEC9bL0YwAAAABJRU5ErkJggg==';

 const r=await p.evaluate(async(PNG)=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   await new Promise(res=>{const im=new Image();im.onload=()=>{window.__img=im;res();};im.onerror=res;im.src=PNG;});
   App.brief={target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['나파가죽']};
   App.copies=[{id:'A',key:'완벽한 순정 핏',sub:'나파가죽 트렁크 매트',cta:'보기',tone:'직격'}];

   // --- negative-copy guidance present in prompts ---
   const pa=Engine._prompt('analyze',{target:'t',offer:'o',funnel:'전환'});
   out.negA=/부정 표현 규칙/.test(pa.sys);
   const pc=Engine._prompt('copies',{target:'t',offer:'o',pains:['x'],usps:['y'],tones:['z']});
   out.negC=/부정 표현/.test(pc.sys);

   // --- regen rotates angle (different each press) ---
   out.hasAngles=Array.isArray(S2._angles)&&S2._angles.length>=5;

   // --- logo pipeline: brand logo -> stage3 layer ---
   App.brand.logo=PNG; S3._img[PNG]=window.__img;
   Doc.initFromCopy(App.copies[0]); App.stage=3;
   S3.ensureLogo();
   const logoL=App.doc.layers.filter(l=>l.role==='logo')[0];
   out.logoLayer=!!logoL && logoL.type==='image' && logoL.src===PNG;
   S3.ensureLogo(); // idempotent
   out.logoOnce=App.doc.layers.filter(l=>l.role==='logo').length===1;

   // --- final prompt: JSON spec + no-invent + logo-exact ---
   App.brand.accent='#e60023';
   const fp=Engine._finalPrompt(App.doc,1,{},true);
   out.specJson=/"el":"headline"/.test(fp)&&/"accent":"#e60023"/.test(fp);
   out.noInvent=/render ONLY the elements/i.test(fp)&&/Do NOT invent or add ANY extra badge/i.test(fp);
   out.logoExact=/brand LOGO/i.test(fp)&&/do NOT redraw, recolor, restyle, distort/i.test(fp);
   // variations differ meaningfully
   const f0=Engine._finalPrompt(App.doc,0,{},true),f2=Engine._finalPrompt(App.doc,2,{},true);
   out.varied=/EDITORIAL MINIMAL/.test(f0)&&/SOLID CARD PANEL/.test(f2)&&f0!==f2;

   // --- per-text scrim: text layers only (no cta) drives shadow; verify draw uses text type ---
   // (indirect) ensure CTA layer exists and is type cta, text layers type text
   out.hasTextLayers=App.doc.layers.some(l=>l.type==='text')&&App.doc.layers.some(l=>l.type==='cta');

   // --- stage4 loading slots + export gating ---
   App.keys.gemini='FAKE';
   let calls=0;const realGen=Engine.gen;
   Engine.gen=async()=>{calls++;await new Promise(r=>setTimeout(r,30));return PNG;};
   Engine._imgEdge=async()=>1;
   App.stage=4;App.final={variants:[],pick:0};
   const genP=S4.generate();
   await new Promise(r=>setTimeout(r,10));
   // right after kick-off: 3 loading slots + export disabled
   out.threeSlots=App.final.variants.length===3;
   out.slotsLoading=App.final.variants.every(v=>v.loading===true);
   out.exportLockedDuring=document.getElementById('s4dlPng').disabled===true;
   await genP;
   out.allFull=App.final.variants.length===3&&App.final.variants.every(v=>v.full===true);
   out.exportUnlocked=document.getElementById('s4dlPng').disabled===false;
   Engine.gen=realGen;

   // --- stage4 layout: chat above main, variants in side ---
   out.layout=!!document.querySelector('.s4-main')&&!!document.querySelector('.s4-side .s4-variants');

   return out;
 },PNG);

 await b.close();
 console.log(JSON.stringify(r,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['negA','negC','hasAngles','logoLayer','logoOnce','specJson','noInvent','logoExact','varied','hasTextLayers','threeSlots','slotsLoading','exportLockedDuring','allFull','exportUnlocked','layout'];
 const ok=keys.every(k=>r[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!r[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
