const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   const out={};
   function solid(c){var cv=document.createElement('canvas');cv.width=cv.height=200;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,200,200);return cv.toDataURL();}
   const BG=solid('#3377cc');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.src=BG;});
   S3._img[BG]=window.__b;
   App.copies=[{id:'A',key:'헤드라인',sub:'서브',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;

   // 1) 샤랄라 로딩 오버레이 — 존재 + 애니메이션 CSS
   out.fxExists=!!document.getElementById('s4loadFX');
   out.starEl=!!document.querySelector('#s4loadFX .s4-load-star')&&!!document.querySelector('#s4loadFX .s4-load-text');
   out.shimmerCss=[...document.styleSheets].some(ss=>{try{return[...ss.cssRules].some(r=>/s4shimmer/.test(r.name||'')||/s4twinkle/.test(r.name||''));}catch(e){return false;}});
   const txt=document.querySelector('.s4-load-text');
   const cs=txt&&getComputedStyle(txt);
   out.gradientText = !!txt && (cs.webkitBackgroundClip==='text'||cs.backgroundClip==='text') && cs.animationName==='s4shimmer';
   const star=document.querySelector('.s4-load-star');
   out.starAnim = star && getComputedStyle(star).animationName==='s4twinkle';

   // 2) paintFinal: 로딩이면 오버레이 show, 아니면 hide (캔버스에 정적 텍스트 안 그림)
   out.paintShowsFx = /fx\.classList\.add\("show"\)/.test(S4.paintFinal.toString())&&/fx\.classList\.remove\("show"\)/.test(S4.paintFinal.toString());
   App.stage=4;App.final={variants:[{loading:true,name:'완성안 1'}],pick:0};UI.go(4);S4.paintFinal();
   out.fxShownWhenLoading = document.getElementById('s4loadFX').classList.contains('show');
   App.final.variants[0]={bg:BG,full:true,dir:0,name:'완성안 1',ratio:'1:1'};S4.paintFinal();
   out.fxHiddenWhenDone = !document.getElementById('s4loadFX').classList.contains('show');

   // 3) 3단계 배경 패널에 '배경만 저장' 버튼 + 메서드
   App.stage=3;App.sel='__bg__';App.sels=[];UI.go(3);S3.props();
   const btns=[...document.querySelectorAll('#propBody button')].map(b=>b.textContent);
   out.bgSaveBtn = btns.some(t=>/배경만 저장/.test(t));
   out.bgSaveFn = typeof S3.downloadBgOnly==='function';
   // 다운로드 트리거 — _dl 가 호출되는지 가로채서 확인(텍스트 없는 배경 url)
   let dlName=null,dlHref=null;const realDl=S4._dl;S4._dl=function(href,name){dlHref=href;dlName=name;};
   await S3.downloadBgOnly();
   out.bgSaveDownloads = /배경만/.test(dlName||'') && !!dlHref;
   S4._dl=realDl;

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['fxExists','starEl','shimmerCss','gradientText','starAnim','paintShowsFx','fxShownWhenLoading','fxHiddenWhenDone','bgSaveBtn','bgSaveFn','bgSaveDownloads'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
