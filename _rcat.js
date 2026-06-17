// Fast standalone cat renderer: reads /tmp/cat_svg.txt, applies the v28 toggle CSS, screenshots states.
const fs=require('fs'),puppeteer=require('puppeteer');
const svg=fs.readFileSync('/tmp/cat_svg.txt','utf8');
const CSS=`
#catChar .paw-rock,#catChar .paw-paper,#catChar .paw-scissors{display:none}
#catChar.pose-rock .paw-rock{display:block}
#catChar.pose-paper .paw-paper{display:block}
#catChar.pose-scissors .paw-scissors{display:block}
#catChar #catPaw{display:none}
#catChar.pose-on #catPaw{display:block}
#catChar.pose-on #catArmRest{display:none}
#catChar .face-sad,#catChar .face-happy{display:none}
#catChar.face-sad .face-neutral,#catChar.face-happy .face-neutral{display:none}
#catChar.face-sad .face-sad{display:block!important}
#catChar.face-happy .face-happy{display:block!important}
`;
const states=[
 ['default',''],
 ['rock','pose-on pose-rock'],
 ['paper','pose-on pose-paper'],
 ['scissors','pose-on pose-scissors'],
 ['sad','pose-on pose-scissors face-sad'],
 ['happy','pose-on pose-rock face-happy'],
];
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:200,height:200,deviceScaleFactor:2});
 const doc=`<!doctype html><meta charset=utf8><style>body{margin:0;background:#efe9f7}.stage{width:200px;height:200px;display:flex;align-items:center;justify-content:center}#catChar{width:160px;image-rendering:pixelated;height:auto}${CSS}</style><div class=stage>${svg}</div>`;
 await p.setContent(doc,{waitUntil:'load'});
 for(const [n,cls] of states){
   await p.evaluate(c=>{document.getElementById('catChar').setAttribute('class','cat-char '+c);},cls);
   await new Promise(r=>setTimeout(r,60));
   await p.screenshot({path:`/tmp/k_${n}.png`});
 }
 await b.close();console.log('rendered',states.map(s=>s[0]).join(','));
})().catch(e=>{console.error(e);process.exit(1);});
