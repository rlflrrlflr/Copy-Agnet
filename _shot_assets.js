const puppeteer=require('puppeteer'),path=require('path');
const RED='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAHElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAA4GIQABAAEi6mUAAAAASUVORK5CYII=';
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:1300,deviceScaleFactor:1.3});
 await p.goto('file://'+path.resolve('v29_studio.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 await p.evaluate((RED)=>{try{localStorage.removeItem('soszae_v29');}catch(e){}
   function add(kind,u){return new Promise(res=>{var o={id:'x'+Math.random(),name:'p.png',url:u};(kind==='product'?App.assets.products:App.assets.refs).push(o);var im=new Image();im.onload=function(){S3._img[u]=im;o.ar=1;res();};im.src=u;});}
   window.__seed=async()=>{await add('product',RED);await add('product',RED);await add('ref',RED);Assets.render();S1.sample();S1.mode('full');};
 },RED);
 await p.evaluate(()=>window.__seed());await new Promise(r=>setTimeout(r,300));
 await p.screenshot({path:'/tmp/v29_assets1.png'});
 // stage3 with product as layer
 await p.evaluate(async()=>{await S1.analyze();await new Promise(r=>setTimeout(r,300));S2.choose('A');});await new Promise(r=>setTimeout(r,600));
 await p.evaluate(()=>{var u=App.assets.products[0].url;Assets.toBg(u);Assets.toLayer(u);});await new Promise(r=>setTimeout(r,300));
 await p.screenshot({path:'/tmp/v29_assets3.png'});
 await b.close();console.log('shots done');
})().catch(e=>{console.error(e.message);process.exit(1);});
