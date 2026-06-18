const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:900,height:1000,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await wait(300);

 // storyline opens
 const open=await p.evaluate(()=>{try{localStorage.removeItem('soszae_rps');}catch(e){}_rps23={score:0,streak:0,best:0};Cat.show('copies');
   return {shown:document.getElementById('catOverlay').classList.contains('show'),
     hasCat:!!document.getElementById('catChar'),hasPapers:document.querySelectorAll('#papers .paper').length,
     hasDeskTop:!!document.querySelector('.desk-top'),title:document.getElementById('catTitle').textContent};});
 await wait(350);
 // shot: writing phase
 const r=await p.evaluate(()=>{var c=document.querySelector('.cat-card').getBoundingClientRect();return {x:c.x,y:c.y,w:c.width,h:c.height};});
 await p.screenshot({path:'shot_cat_story1.png',clip:{x:r.x,y:r.y,width:r.w,height:r.h}});

 // wait for cat to emerge + propose (storyline ~2.5s)
 await wait(2600);
 const proposed=await p.evaluate(()=>({state:_catSt,btn:!document.getElementById('rbtnrock').disabled,head:document.getElementById('rpsHead').textContent}));
 await p.screenshot({path:'shot_cat_story2.png',clip:{x:r.x,y:r.y,width:r.w,height:r.h}});

 // force a LOSS (cat wins) to test papers scatter + float
 await p.evaluate(()=>{Math.random=()=>0;_catClear();_catSt='result';catRPS('scissors');});// triggers fresh countdown then play scissors; cat will be rock(0)
 await wait(150);
 await p.evaluate(()=>{Math.random=()=>0;});
 // play during count
 await p.evaluate(()=>{if(_catSt==='count')catRPS('scissors');});
 await wait(3200);
 const lose=await p.evaluate(()=>({score:_rps23.score,streak:_rps23.streak,
   scatter:document.getElementById('papers').classList.contains('scatter')|| (document.getElementById('papers').className.indexOf('scatter')>=0),
   catUp:document.getElementById('catChar').classList.contains('up'),
   title:document.getElementById('catTitle').textContent}));
 await p.screenshot({path:'shot_cat_story3.png',clip:{x:r.x,y:r.y,width:r.w,height:r.h}});

 // force a WIN (player) -> cat leaves, score++
 await p.evaluate(()=>{Math.random=()=>0;catRPS('paper');});// new round, cat rock, paper beats rock => win
 await wait(150);
 await p.evaluate(()=>{if(_catSt==='count')catRPS('paper');});
 await wait(3200);
 const win=await p.evaluate(()=>({score:_rps23.score,streak:_rps23.streak,best:_rps23.best,
   leave:document.getElementById('catChar').classList.contains('leave')}));
 // best persisted?
 const saved=await p.evaluate(()=>localStorage.getItem('soszae_rps'));

 await b.close();
 console.log('open:',JSON.stringify(open));
 console.log('proposed:',JSON.stringify(proposed));
 console.log('lose:',JSON.stringify(lose));
 console.log('win:',JSON.stringify(win));
 console.log('saved:',saved);
 console.log('errors:',errs.length?errs.slice(0,6):'none');
 const ok=open.shown&&open.hasCat&&open.hasPapers>=3&&open.hasDeskTop
   &&proposed.btn&&/가위바위보/.test(proposed.head)
   &&lose.scatter&&lose.catUp&&lose.score===0
   &&win.score===1&&win.leave
   &&saved&&/best/.test(saved)
   &&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
