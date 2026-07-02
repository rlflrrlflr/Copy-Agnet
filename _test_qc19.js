/* 31차: 자동 레이어 근절 / 디테일컷 모양 / 돼지꼬리 / 아이콘 seg / 보존안 2K / 썸네일 컨테인 / 장식도형 금지 */
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
   const BG=solid('#3377cc'),P1=solid('#ffcc00'),P2=solid('#ff8800'),LOGO=solid('#00aa88');
   await new Promise(r=>{const i=new Image();i.onload=()=>{window.__b=i;r();};i.src=BG;});
   S3._img[BG]=window.__b;
   await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[P2]=i;r();};i.src=P2;});
   App.brief={target:'t',offer:'비타민C 구미',funnel:'전환',channel:''};
   App.analysis={pains:['p'],tones:['직격'],usps:['620mg']};
   App.assets.products=[{id:'p1',url:P1},{id:'p2',url:P2}]; // 2장 → 예전엔 자동 디테일컷 생성 조건
   App.brand.logo=LOGO;await new Promise(r=>{const i=new Image();i.onload=()=>{S3._img[LOGO]=i;r();};i.src=LOGO;});
   App.copies=[{id:'A',key:'헤드라인',sub:'서브',cta:'보기',tone:'직격'}];
   Doc.initFromCopy(App.copies[0]);App.doc.bgImage=BG;App.stage=3;

   // 1) 디테일컷 자동 생성 금지 — 상품 2장이어도 mount 시 안 생김(버튼 전용)
   S3.mount();
   out.noAutoDetail = !App.doc.layers.some(l=>l.role==='detail');
   out.mountNoEnsureDetails = !/S3\.ensureDetails\(\)/.test(S3.mount.toString());
   // 버튼으로는 추가됨
   S3.addDetail();
   out.btnAddsDetail = App.doc.layers.some(l=>l.role==='detail');

   // 2) 로고 삭제 존중 — 지우면 자동 재생성 안 됨, +로고 버튼으로만 복귀
   const lg=App.doc.layers.filter(l=>l.role==='logo')[0];
   out.logoAuto = !!lg; // ensureLogo가 처음엔 추가
   Doc.remove(lg.id);
   S3.ensureLogo();
   out.logoStaysDeleted = !App.doc.layers.some(l=>l.role==='logo') && App.doc._logoDeleted===true;
   S3.addLogo();
   out.logoBtnReAdds = App.doc.layers.some(l=>l.role==='logo') && !App.doc._logoDeleted;

   // 3) 디테일컷 모양 3종 — dshape 렌더/합성/속성
   const det=App.doc.layers.filter(l=>l.role==='detail')[0];
   out.dshapeDraws = ['circle','rounded','rect'].every(k=>{det.dshape=k;try{S3.draw();return true;}catch(e){return false;}});
   out.dshapeComposite = /l\.dshape\|\|"circle"/.test(S4._compositeExtras.toString());
   App.sel=det.id;App.sels=[det.id];S3.props();
   const dsegs=[...document.querySelectorAll('#propBody .seg button')].map(b=>b.textContent);
   out.dshapeSeg = dsegs.includes('●')&&dsegs.includes('▢')&&dsegs.includes('■');

   // 4) 도형 돼지꼬리 + 아이콘만 seg
   S3.addShape('tail');
   const sh=App.doc.layers[App.doc.layers.length-1];
   out.tailDraws = (function(){try{S3.draw();return true;}catch(e){return false;}})();
   App.sel=sh.id;App.sels=[sh.id];S3.props();
   const kbtns=[...document.querySelectorAll('#propBody .seg button')].map(b=>b.textContent);
   out.tailInSeg = kbtns.includes('〰');
   out.iconOnly = kbtns.every(t=>!/[가-힣]/.test(t)); // 한글 설명 없이 기호만
   Doc.remove(sh.id);

   // 5) AI 장식 도형 금지
   const fp=Engine._finalPrompt(App.doc,0,{},true);
   out.noDecoShapes = /NO DECORATIVE SHAPES/.test(fp)&&/empty circle, ring, frame/i.test(fp);

   // 6) 보존안 = 2K 네이티브 렌더 / 썸네일 컨테인
   out.lossless2K = /S3\._exportCanvas\(\)/.test(S4.generate.toString());
   out.thumbContain = typeof S4._drawContain==='function' && /_drawContain\(c,v\.bg\)/.test(S4.renderVariants.toString());

   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['noAutoDetail','mountNoEnsureDetails','btnAddsDetail','logoAuto','logoStaysDeleted','logoBtnReAdds','dshapeDraws','dshapeComposite','dshapeSeg','tailDraws','tailInSeg','iconOnly','noDecoShapes','lossless2K','thumbContain'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
