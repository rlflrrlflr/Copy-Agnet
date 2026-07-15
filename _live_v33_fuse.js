/* 42차 라이브: 서버 키 자동 주입 + 마스크 융합 E2E */
const puppeteer=require('puppeteer'),fs=require('fs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
 await p.goto('http://localhost:5173/',{waitUntil:'domcontentloaded'});await wait(800);
 const r=await p.evaluate(async()=>{
   const autofill=!!document.getElementById('openaiKey').value&&!!document.getElementById('geminiKey').value;
   // 합성 상황 구성: 그라데이션 배경 + 라벨 있는 가짜 제품(누끼 PNG)
   localStorage.removeItem('soszae_v33');
   document.getElementById('inTarget').value='t';document.getElementById('inOffer').value='나파가죽 트렁크매트';
   App.brief.funnel='전환'; await S1.analyze(); S2.choose('A'); await new Promise(r=>setTimeout(r,500));
   const bg=(()=>{const c=document.createElement('canvas');c.width=c.height=600;const x=c.getContext('2d');
     const g=x.createLinearGradient(0,0,600,600);g.addColorStop(0,'#39445c');g.addColorStop(1,'#141821');x.fillStyle=g;x.fillRect(0,0,600,600);return c.toDataURL();})();
   const prod=(()=>{const c=document.createElement('canvas');c.width=300;c.height=300;const x=c.getContext('2d');
     x.fillStyle='#c8a24a';x.fillRect(60,40,180,220);x.fillStyle='#fff';x.fillRect(85,120,130,60);
     x.fillStyle='#000';x.font='bold 22px sans-serif';x.textAlign='center';x.fillText('나파가죽',150,145);x.font='11px sans-serif';x.fillText('PREMIUM TRUNK MAT',150,165);return c.toDataURL();})();
   App.doc.bgImage=bg; App.assets.products=[{url:prod,name:'p.png'}];
   App.doc._prodLayerDeleted=false;
   const before=App.doc.bgImage;
   await S3.fuseProduct();
   const L=(App.doc.layers||[]).filter(l=>l.role==='product')[0];
   return {autofill,changed:App.doc.bgImage!==before,layerHidden:L?L.hidden:null,out:App.doc.bgImage.indexOf('data:image')===0?App.doc.bgImage:null,
     toast:(document.querySelector('#toast')||{}).textContent||''};
 });
 if(r.out)fs.writeFileSync('_live_v33_fuse.png',Buffer.from(r.out.split(',')[1],'base64'));
 console.log('autofill',r.autofill,'| bg changed',r.changed,'| product layer hidden',r.layerHidden,'| toast:',r.toast.slice(0,80));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
