// Drive the REAL drawComposeText on a canvas to visually verify compose changes.
const fs=require('fs'),puppeteer=require('puppeteer');
const fileUrl='file://'+require('path').resolve('v27_copy_engine.html');
(async()=>{
 const browser=await puppeteer.launch({args:['--no-sandbox']});
 const page=await browser.newPage();
 page.on('pageerror',e=>{}); // swallow init errors from missing CDNs
 await page.goto(fileUrl,{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await new Promise(r=>setTimeout(r,400));
 const info=await page.evaluate(()=>{
   const have=typeof drawComposeText==='function' && typeof _composeLines==='function' && typeof _fontSpec==='function';
   return {have, fns:{draw:typeof drawComposeText, lines:typeof _composeLines, font:typeof _fontSpec, sel:typeof _composeSelect, posov:typeof positionOverlay}};
 });
 console.log('fn presence:', JSON.stringify(info));
 if(!info.have){console.error('REQUIRED FNS MISSING — init aborted before defs');await browser.close();process.exit(2);}

 const scenarios=JSON.parse(process.env.SCN||'[]');
 for(const s of scenarios){
   const out=await page.evaluate((s)=>{
     // ensure inputs exist
     function inp(id,val,tag){let e=document.getElementById(id);if(!e){e=document.createElement(tag||'textarea');e.id=id;document.body.appendChild(e);}if('checked' in e && tag==='checkbox'){}e.value=val;return e;}
     let scrim=document.getElementById('composeScrim'); if(!scrim){scrim=document.createElement('input');scrim.type='checkbox';scrim.id='composeScrim';document.body.appendChild(scrim);}
     scrim.checked=!!s.scrim;
     inp('composeKey', s.key||'');
     inp('composeSub', s.sub||'');
     inp('composeCta', s.cta||'');
     // reset & apply composeState
     composeState = Object.assign({letter:'A',bg:'gradient',ratio:'1:1',pos:'bottom',textColor:'light',hAlign:'left',bgImage:null}, s.state||{});
     try{ if(typeof getOverlayLogos!=='function') window.getOverlayLogos=function(){return [];}; }catch(e){}
     // build canvas
     const W=s.W||1080,H=s.H||1080;
     const c=document.createElement('canvas');c.width=W;c.height=H;
     const ctx=c.getContext('2d');
     // bg
     const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#3a2f5e');g.addColorStop(1,'#1d1730');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
     let err=null;
     try{ drawComposeText(ctx,W,H); }catch(e){ err=e.message+' | '+(e.stack||'').split('\n')[1]; }
     return {url:c.toDataURL('image/png'), err, parts: (typeof _cTextParts!=='undefined'&&_cTextParts)?Object.keys(_cTextParts):null, box:(typeof _cTextBox!=='undefined'&&_cTextBox)?_cTextBox:null};
   }, s);
   if(out.err){console.error('  ['+s.name+'] DRAW ERROR:', out.err);}
   else{
     const b=Buffer.from(out.url.split(',')[1],'base64');
     fs.writeFileSync('/tmp/compose_'+s.name+'.png', b);
     console.log('  ['+s.name+'] ok parts='+JSON.stringify(out.parts)+' box='+(out.box?Math.round(out.box.x)+','+Math.round(out.box.y):'-'));
   }
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
