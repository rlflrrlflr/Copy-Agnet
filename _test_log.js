const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1100,height:800});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate(()=>{try{localStorage.removeItem('soszae_v29');}catch(e){} window.__calls=[]; const of=window.fetch; window.fetch=function(u,o){window.__calls.push({u:String(u),body:o&&o.body});return Promise.resolve({ok:true});};});
 await p.evaluate(()=>{document.getElementById('inTarget').value='모델Y 쥬니퍼 오너';document.getElementById('inOffer').value='나파가죽 트렁크 매트';App.brief.funnel='전환';});
 await p.evaluate(async()=>{await S1.analyze();});await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>S2.choose('A'));await new Promise(r=>setTimeout(r,500));
 await p.evaluate(()=>S4.open());await new Promise(r=>setTimeout(r,1700));
 const r=await p.evaluate(()=>{
   const hook=window.__calls.filter(c=>/script\.google\.com\/macros/.test(c.u));
   const rows=[];hook.forEach(c=>{try{JSON.parse(c.body).rows.forEach(x=>rows.push(x));}catch(e){}});
   const actions={};rows.forEach(x=>{actions[x.row[3]]=(actions[x.row[3]]||0)+1;});
   return {hookCalls:hook.length, totalRows:rows.length, actions, sample:rows[0]&&rows[0].row, adv:rows[0]&&rows[0].row[1], sheet:rows[0]&&rows[0].sheet};
 });
 console.log('log:',JSON.stringify(r));
 console.log('errors:',errs.length?errs.slice(0,4):'none');
 await b.close();
 const ok=r.hookCalls>0&&r.actions.pair===3&&r.actions.select===1&&r.actions.generate>=1&&r.sheet==='pref'&&r.sample.length===7&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
