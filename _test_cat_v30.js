const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:900,height:900});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);
 const r1=await p.evaluate(()=>{
   try{localStorage.removeItem('soszae_rps');}catch(e){}
   Math.random=()=>0.5; // cat -> scissors; play rock -> win
   Cat.score={w:0,l:0,d:0,streak:0,best:0};Cat.show('copies');
   return {on:document.getElementById('catOv').classList.contains('on'),
     topPrompt:document.getElementById('catTop').textContent.includes('한 판'),
     stageH:document.getElementById('catStage').offsetHeight,
     btnEnabled:!document.querySelector('.cat-rps button').disabled};
 });
 // start a round; during count buttons disabled + top shows a beat
 await p.evaluate(()=>Cat.rps('rock'));
 await wait(250);
 const during=await p.evaluate(()=>({busy:Cat._busy,btnDisabled:document.querySelector('.cat-rps button').disabled,
   topTick:/가위|바위|보/.test(document.getElementById('catTop').textContent),
   psy:document.getElementById('catImg').classList.contains('psy')}));
 // double-press ignored during round
 await p.evaluate(()=>Cat.rps('paper'));
 await wait(1300);
 const after=await p.evaluate(()=>({w:Cat.score.w,l:Cat.score.l,d:Cat.score.d,streak:Cat.score.streak,best:Cat.score.best,
   win:document.getElementById('catTop').classList.contains('win'),
   pawYou:document.getElementById('catPawYou').textContent,
   pawCat:document.getElementById('catPawCat').textContent,
   faceSad:document.getElementById('catImg').src===CAT.sad,
   btnBack:!document.querySelector('.cat-rps button').disabled}));
 // a loss -> shake + happy + up
 await p.evaluate(()=>{Math.random=()=>0;Cat.rps('scissors');}); // cat rock beats scissors -> lose
 await wait(1300);
 const loss=await p.evaluate(()=>({l:Cat.score.l,streak:Cat.score.streak,lose:document.getElementById('catTop').classList.contains('lose'),
   faceHappy:document.getElementById('catImg').src===CAT.happy,up:document.getElementById('catImg').classList.contains('up')}));
 await b.close();
 console.log('show:',JSON.stringify(r1));
 console.log('during:',JSON.stringify(during));
 console.log('after win:',JSON.stringify(after));
 console.log('loss:',JSON.stringify(loss));
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 const ok=r1.on&&r1.topPrompt&&r1.stageH>=210&&r1.btnEnabled
   &&during.busy&&during.btnDisabled&&during.topTick&&during.psy
   &&after.w===1&&after.l===0&&after.d===0&&after.streak===1&&after.win&&after.pawYou==='✊'&&after.pawCat==='✌️'&&after.faceSad&&after.btnBack
   &&loss.l===1&&loss.streak===0&&loss.lose&&loss.faceHappy&&loss.up
   &&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
