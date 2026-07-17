/* 45차: 라이브 마스터 — 텍스트 소거→비전 좌표→캔버스 타이포 재렌더 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   try{localStorage.clear();}catch(e){}
   const out={};
   // 프롬프트: eraseText 분기
   const ep=Engine._finalPrompt(null,0,{eraseText:true},true);
   out.erasePrompt=/ERASE every piece of rendered text/.test(ep)&&/CHANGE NOTHING ELSE/.test(ep);
   out.boxFn=typeof Engine.textBoxes==='function';
   out.btn=!!document.getElementById('s4liveM');
   // 파이프라인(모킹): 소거 결과 위에 카피가 실제로 렌더되는지
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=400;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,400,400);return cv.toDataURL();}
   const RAW=solid('#7799bb'),ERASED=solid('#88aacc');
   App.brief={target:'t',offer:'o',funnel:'전환',channel:''};
   App.copies=[{id:'A',key:'라이브 마스터 카피',sub:'서브 카피 무손실',cta:'구매하기',tone:'직격'}];
   App.assets={products:[],refs:[]};
   Doc.initFromCopy(App.copies[0]);
   App.stage=4;UI.go(4);await new Promise(r=>setTimeout(r,150));
   App.live=true;App.keys.gemini='FAKE';
   App.final={variants:[{bg:RAW,bgClean:RAW,full:true,dir:0,name:'완성안 1',ratio:App.doc.ratio}],pick:0};
   const rG=Engine.gen,rB=Engine.textBoxes,rE=Engine._imgEdge,rC=S4._compositeExtras;
   let erasePayload=null;
   Engine.gen=async(kind,payload)=>{erasePayload=payload;return ERASED;};
   Engine.textBoxes=async()=>[{kind:'headline',x:.08,y:.12,w:.8,h:.14,align:'left'},{kind:'cta',x:.08,y:.8,w:.3,h:.07}];
   Engine._imgEdge=async()=>1;S4._compositeExtras=async(u)=>u;
   await S4.liveMaster();
   Engine.gen=rG;Engine.textBoxes=rB;Engine._imgEdge=rE;S4._compositeExtras=rC;App.keys.gemini='';App.live=false;
   out.eraseSent=!!(erasePayload&&erasePayload.eraseText&&erasePayload.baseOverride===RAW);
   const nv=App.final.variants[App.final.variants.length-1];
   out.cardAdded=App.final.variants.length===2&&!!nv.liveMaster&&nv.lossless&&nv.full;
   out.pickMoved=App.final.pick===1;
   out.docRestored=App.doc.bgImage!==ERASED&&(App.doc.layers||[]).length>0;
   // 합성 결과: ERASED 단색과 달리 텍스트 픽셀이 있어야
   out.bgIsPng=typeof nv.bg==='string'&&nv.bg.indexOf('data:image/png')===0;
   if(out.bgIsPng){
     const im=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=nv.bg;});
     if(im){const c=document.createElement('canvas');c.width=200;c.height=200;const x=c.getContext('2d');x.drawImage(im,0,0,200,200);
       const d=x.getImageData(0,0,200,200).data;const cols={};
       for(let i=0;i<d.length;i+=16){cols[(d[i]>>4)+','+(d[i+1]>>4)+','+(d[i+2]>>4)]=1;}
       out.textRendered=Object.keys(cols).length>3; // 단색(1~2)이 아니라 텍스트·배경 다색
     }
   }
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['erasePrompt','boxFn','btn','eraseSent','cardAdded','pickMoved','docRestored','bgIsPng','textRendered'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
