const puppeteer=require('puppeteer'),path=require('path');
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|net::/.test(m.text()))errs.push(m.text());});
 await p.goto('file://'+path.resolve('v30_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const out=await p.evaluate(async()=>{
   try{localStorage.removeItem('soszae_v30');}catch(e){}
   App.brief={target:'테슬라 오너',offer:'트렁크 매트 — 나파가죽, IPX7 방수',funnel:'전환',channel:''};
   App.analysis={pains:['고정페인'],tones:['고정톤'],usps:['나파가죽'],copies:[]};
   // intercept gen to see which kind S2.regen calls
   const calls=[];const orig=Engine.gen.bind(Engine);
   Engine.gen=async(kind,pl,strict)=>{calls.push({kind,vary:!!(pl&&pl._vary)});return orig(kind,pl,strict);};
   await S2.regen(true);
   Engine.gen=orig;
   const regenKind=calls[0]; // should be analyze + _vary
   const analysisChanged=App.analysis.pains[0]!=='고정페인'; // re-derived
   const copies=App.copies.length;
   // temperature plumbing
   const tCopies=Engine._temp('copies'), tAnalyze=Engine._temp('analyze'), tRefine=Engine._temp('refine');
   // vary directive in analyze prompt
   const pr=Engine._prompt('analyze',{target:'t',offer:'o',funnel:'전환',_vary:true});
   const varyDirective=/다른 각도/.test(pr.user);
   const noVaryClean=!/다른 각도/.test(Engine._prompt('analyze',{target:'t',offer:'o',funnel:'전환'}).user);
   return {regenKind,analysisChanged,copies,tCopies,tAnalyze,tRefine,varyDirective,noVaryClean};
 });
 await b.close();
 console.log(JSON.stringify(out,null,1));
 console.log('errors:',errs.length?errs.slice(0,4):'none');
 const ok=out.regenKind.kind==='analyze'&&out.regenKind.vary===true&&out.analysisChanged&&out.copies===5
   &&out.tCopies===1.05&&out.tAnalyze===1.05&&out.tRefine===0.9&&out.varyDirective&&out.noVaryClean&&!errs.length;
 console.log(ok?'PASS':'FAIL');process.exit(ok?0:1);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
