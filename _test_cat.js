const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1200,height:900});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 // force Math.random=0.5 → cat picks index1='scissors'; playing 'rock' always wins (rock beats scissors)
 const r1=await p.evaluate(()=>{
   try{localStorage.removeItem('soszae_rps');}catch(e){}
   Math.random=()=>0.5;
   Cat.score={w:0,l:0,d:0,streak:0,best:0};
   Cat.show('copies');
   return {on:document.getElementById('catOv').classList.contains('on'),
           scoreRendered:document.getElementById('catScore').textContent.includes('승'),
           busy:Cat._busy};
 });

 // play 'rock' → win; busy gating: an immediate second call must be ignored
 await p.evaluate(()=>{Cat.rps('rock');Cat.rps('rock');}); // second ignored (busy)
 await wait(1100);
 const r2=await p.evaluate(()=>({w:Cat.score.w,l:Cat.score.l,d:Cat.score.d,streak:Cat.score.streak,best:Cat.score.best,
   vsOn:document.getElementById('catVS').classList.contains('on'),
   vsText:document.getElementById('catVS').textContent,
   busy:Cat._busy,
   faceSad:document.getElementById('catImg').src===CAT.sad}));

 // play two more wins → streak 3, best 3
 await p.evaluate(()=>Cat.rps('rock'));await wait(1100);
 await p.evaluate(()=>Cat.rps('rock'));await wait(1100);
 const r3=await p.evaluate(()=>({w:Cat.score.w,streak:Cat.score.streak,best:Cat.score.best}));

 // now force a loss: Math.random=0 → cat='rock'; play 'scissors' → rock beats scissors → cat wins
 await p.evaluate(()=>{Math.random=()=>0;Cat.rps('scissors');});await wait(1100);
 const r4=await p.evaluate(()=>({l:Cat.score.l,streak:Cat.score.streak,best:Cat.score.best,
   faceHappy:document.getElementById('catImg').src===CAT.happy,
   up:document.getElementById('catImg').classList.contains('up')}));

 // best persists across reload
 await p.reload({waitUntil:'domcontentloaded'});await wait(300);
 const r5=await p.evaluate(()=>{Cat._load();return Cat.score.best;});

 await b.close();
 console.log('show:',JSON.stringify(r1));
 console.log('after win1 (busy-gated double):',JSON.stringify(r2));
 console.log('after 3 wins:',JSON.stringify(r3));
 console.log('after loss:',JSON.stringify(r4));
 console.log('best after reload:',r5);
 console.log('errors:',errs.length?errs.slice(0,5):'none');
 const ok = r1.on && r1.scoreRendered && r1.busy===false
   && r2.w===1 && r2.l===0 && r2.d===0 && r2.streak===1 && r2.vsOn && /나.*VS.*냥/.test(r2.vsText) && r2.busy===false && r2.faceSad
   && r3.w===3 && r3.streak===3 && r3.best===3
   && r4.l===1 && r4.streak===0 && r4.best===3 && r4.faceHappy && r4.up
   && r5===3 && !errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
