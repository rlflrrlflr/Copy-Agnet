/* 41차 라이브: v33 GPT-Image 2 경로 실키 E2E — 시뮬 카피로 doc 구성 후 _openaiImage 직접 호출 */
const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs');
const KEY=process.env.OAI_KEY;
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
 await p.goto('file://'+path.resolve('v33_studio.html'),{waitUntil:'domcontentloaded'});
 const r=await p.evaluate(async(key)=>{
   localStorage.clear();
   document.getElementById('openaiKey').value=key;
   document.getElementById('imgEngine').value='openai';
   UI.onKey();
   document.getElementById('inTarget').value='트렁크 정리에 지친 30대 차주';
   document.getElementById('inOffer').value='나파가죽 트렁크매트 — 오늘만 39,000원, 무료배송';
   App.brief.funnel='전환';
   await S1.analyze(); // 키 없는 텍스트 → 시뮬 카피
   S2.choose('A'); await new Promise(r=>setTimeout(r,600));
   const img=await Engine._openaiImage('final',{finalDoc:true,fresh:true,dir:0});
   const ef=await Engine._imgEdge(img);
   return {ok:img.indexOf('data:image')===0,edge:ef,img:img.slice(0,100000000)};
 },KEY);
 fs.writeFileSync('_live_v33_out.png',Buffer.from(r.img.split(',')[1],'base64'));
 console.log('ok',r.ok,'edgeFrac',r.edge.toFixed(3));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
