/* Cloud(개인 Drive 자동 백업) — 모듈/버튼/배선/off시 무전송 */
const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1300,height:900});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 const R=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');localStorage.removeItem('soszae_drivehook');localStorage.removeItem('soszae_driveon');}catch(e){}
   const out={};
   out.moduleFns = ['url','on','setup','reflect','send'].every(f=>typeof Cloud[f]==='function');
   out.btnExists = !!document.getElementById('cloudBtn');
   out.dlWired = /Cloud\.send\(name,href\)/.test(S4._dl.toString());
   // off 상태: send는 fetch 안 함
   let fetched=0;const realFetch=window.fetch;window.fetch=async()=>{fetched++;return {};};
   await Cloud.send('t.png','data:image/png;base64,AAAA');
   out.offNoSend = fetched===0;
   // on 상태: dataURL만 전송, blob은 스킵
   localStorage.setItem('soszae_drivehook','https://example.com/hook');localStorage.setItem('soszae_driveon','1');
   await Cloud.send('t.png','data:image/png;base64,AAAA');
   const afterData=fetched;
   await Cloud.send('t.svg','blob:xyz');
   out.onSendsData = afterData===1 && fetched===1; // data 1회, blob 0회
   window.fetch=realFetch;
   // reflect: on이면 라벨 변경
   Cloud.reflect();
   out.reflectOn = /ON/.test(document.getElementById('cloudBtn').textContent);
   localStorage.removeItem('soszae_drivehook');localStorage.setItem('soszae_driveon','0');Cloud.reflect();
   out.reflectOff = /설정/.test(document.getElementById('cloudBtn').textContent);
   return out;
 });

 await b.close();
 console.log(JSON.stringify(R,null,1));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['moduleFns','btnExists','dlWired','offNoSend','onSendsData','reflectOn','reflectOff'];
 const ok=keys.every(k=>R[k])&&!errs.length;
 console.log('FAILED:',keys.filter(k=>!R[k]));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
