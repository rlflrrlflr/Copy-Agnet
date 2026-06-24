const puppeteer=require('puppeteer'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const URL='file://'+path.resolve('v30_studio.html');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1400,height:1100});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto(URL,{waitUntil:'domcontentloaded'});await wait(300);
 const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAHElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAvA0hAAABw3l8KQAAAABJRU5ErkJggg==';

 const r=await p.evaluate(async(PNG)=>{
   const out={};
   // ---- copy sanitization (_cleanCopy / _coerce) ----
   const giant='왜 '+('가나다 '.repeat(120));
   const c=Engine._coerce('copies',{copies:[{key:'',sub:'서브만 있음',cta:'',tone:'직격직격직격직격직격직격직격직격',why:giant}]});
   out.whyClipped=c[0].why.length<=70;
   out.emptyKeyFixed=c[0].key==='서브만 있음';
   out.ctaFilled=c[0].cta==='자세히 보기';
   out.toneClipped=c[0].tone.length<=14;
   // analyze coerce also cleans
   const a=Engine._coerce('analyze',{pains:['p'],tones:['t'],usps:['u'],copies:[{key:'키',sub:'서브',cta:'cta',tone:'t',why:giant}]});
   out.analyzeWhyClipped=a.copies[0].why.length<=70;
   // ---- stage3 download exists ----
   out.s3download=typeof S3.download==='function'&&!!document.querySelector('#stage3 button[onclick="S3.download()"]');
   // ---- stage4 fit helper never-blank ----
   out.fitFn=typeof S4._fitToRatio==='function';
   const fit=await S4._fitToRatio(PNG,'16:9');
   out.fitWorks=typeof fit==='string'&&fit.indexOf('data:image/png')===0;
   const fitBad=await S4._fitToRatio('not-an-image','1:1');
   out.fitBadNull=fitBad===null;
   // ---- cat min-time wiring ----
   out.catMin=/1800-elapsed/.test(Cat.hide.toString());
   // temps lowered
   out.temps=Engine._temp('copies')===1.05&&Engine._temp('refine')===0.9;
   return out;
 },PNG);

 // ---- boot always lands on stage 1 even with saved progress ----
 await p.evaluate((PNG)=>{
   const snap={v:1,stage:3,brief:{target:'t',offer:'o',funnel:'전환'},brand:{accent:'',logo:null},assets:{products:[],refs:[]},ctx:[],
     copies:[{id:'A',key:'k',sub:'s',cta:'c',tone:'t'}],pick:'A',analysis:{pains:['p'],tones:['t'],usps:['u']},
     doc:{ratio:'1:1',bgImage:null,bgHue:200,scrim:.45,intent:{},layers:[]}};
   localStorage.setItem('soszae_v30',JSON.stringify(snap));
 },PNG);
 await p.goto(URL,{waitUntil:'domcontentloaded'});await wait(400);
 const boot=await p.evaluate(()=>({
   stage:App.stage,
   stage1Visible:!document.getElementById('stage1').classList.contains('hidden'),
   step2Reachable:UI.reachable(2),
   step3Reachable:UI.reachable(3),
   step2NotLocked:!document.getElementById('step2').classList.contains('lock')
 }));

 await b.close();
 console.log(JSON.stringify(r,null,1));
 console.log('boot:',JSON.stringify(boot));
 console.log('errors:',errs.length?errs.slice(0,8):'none');
 const keys=['whyClipped','emptyKeyFixed','ctaFilled','toneClipped','analyzeWhyClipped','s3download','fitFn','fitWorks','fitBadNull','catMin','temps'];
 const ok=keys.every(k=>r[k]) && boot.stage===1 && boot.stage1Visible && boot.step2Reachable && boot.step3Reachable && boot.step2NotLocked && !errs.length;
 console.log('FAILED:',keys.filter(k=>!r[k]),(boot.stage!==1?'boot-stage':''));
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
