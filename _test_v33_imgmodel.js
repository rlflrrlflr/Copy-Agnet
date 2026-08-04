/* 51차: 은퇴 모델 제거 · 계정 최강 이미지 모델 자동 확정 · 404 자가치유 */
const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1000});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const R=await p.evaluate(async()=>{
   const out={};
   // 은퇴한 preview ID가 기본에서 제거됐는지
   out.retiredGone=MODELS.geminiImage!=='gemini-3-pro-image-preview'&&!IMG_PREF.some(m=>m.id==='gemini-3-pro-image-preview');
   out.prefOrder=IMG_PREF[0].id==='gemini-3-pro-image'&&IMG_PREF[1].id==='gemini-3.1-flash-image';
   App.keys.gemini='GK';
   const realOnce=Engine._tfetchOnce;
   const list=(ids)=>({ok:true,status:200,json:async()=>({models:ids.map(i=>({name:'models/'+i}))}),text:async()=>''});
   // ① Pro가 있으면 Pro 선택
   Engine._imgResolved=null;
   Engine._tfetchOnce=async()=>list(['gemini-3.1-pro-preview','gemini-3.1-flash-image','gemini-3-pro-image']);
   let r1=await Engine.resolveImageModel(true);
   out.picksPro=r1&&r1.id==='gemini-3-pro-image';
   // ② Pro가 없으면 Nano Banana 2로
   Engine._tfetchOnce=async()=>list(['gemini-3.1-flash-image','gemini-2.5-flash-image']);
   let r2=await Engine.resolveImageModel(true);
   out.picksNB2=r2&&r2.id==='gemini-3.1-flash-image';
   // ③ 선호목록에 없어도 image 계열이면 채택
   Engine._tfetchOnce=async()=>list(['some-future-image-model']);
   let r3=await Engine.resolveImageModel(true);
   out.picksFuture=r3&&r3.id==='some-future-image-model';
   // ④ 404 자가치유: 은퇴 모델 호출 → 재확정 후 자동 전환
   App.geminiImgModel='gemini-3-pro-image-preview';App._imgModelPinned=true;Engine._imgResolved=null;
   let calls=[];
   Engine._tfetchOnce=async(url)=>{
     if(/\/models\?key=/.test(url))return list(['gemini-3.1-flash-image']);
     calls.push(url);
     if(/gemini-3-pro-image-preview/.test(url))return {ok:false,status:404,text:async()=>'{"error":{"code":404,"message":"models/gemini-3-pro-image-preview is not found"}}'};
     return {ok:true,status:200,json:async()=>({candidates:[{content:{parts:[{inlineData:{mimeType:'image/png',data:'iVBORw0KGgo='}}]}}]}),text:async()=>''};
   };
   App.doc={ratio:'1:1',layers:[],intent:{}};
   let url=null;try{url=await Engine._geminiImageOnce('image',{});}catch(e){out.err=e.message;}
   out.healed404=calls.length===2&&/gemini-3-pro-image-preview/.test(calls[0])&&/gemini-3\.1-flash-image/.test(calls[1]);
   out.switched=App.geminiImgModel==='gemini-3.1-flash-image'&&typeof url==='string'&&url.indexOf('data:image')===0;
   Engine._tfetchOnce=realOnce;App.keys.gemini='';
   // 선택자 라벨/고정 동작
   const ie=document.getElementById('imgEngine');
   out.autoLabel=[...ie.options].some(o=>o.value==='gemini'&&/자동/.test(o.text));
   ie.value='gemini';UI.onKey();out.autoNotPinned=App._imgModelPinned===false;
   ie.value='gemini-flash';UI.onKey();out.flashPinned=App._imgModelPinned===true&&App.geminiImgModel==='gemini-3.1-flash-image';
   return out;
 });
 await b.close();
 console.log(JSON.stringify(R,null,1));console.log('errors:',errs.length?errs.slice(0,6):'none');
 const keys=['retiredGone','prefOrder','picksPro','picksNB2','picksFuture','healed404','switched','autoLabel','autoNotPinned','flashPinned'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
