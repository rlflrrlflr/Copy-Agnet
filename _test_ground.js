const https=require('https');const KEY=process.env.GKEY;
function call(body,cb){const b=JSON.stringify(body);const t0=Date.now();
 const req=https.request({method:'POST',hostname:'generativelanguage.googleapis.com',path:'/v1beta/models/gemini-3.1-pro-preview:generateContent?key='+KEY,headers:{'content-type':'application/json','content-length':Buffer.byteLength(b)}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>cb(r.statusCode,d,((Date.now()-t0)/1000).toFixed(1)));});req.write(b);req.end();}
// grounded text (no JSON schema)
call({contents:[{role:'user',parts:[{text:"테슬라 모델Y 트렁크 매트 시장에서 마케팅에 쓸 만한 '클레임 가능한 사실' 3개를 한국어로. 검색 근거로."}]}],tools:[{googleSearch:{}}]},(s,d,sec)=>{
 let txt='',gm=false;try{var j=JSON.parse(d);var parts=(((j.candidates||[])[0]||{}).content||{}).parts||[];txt=parts.map(p=>p.text||'').join('').slice(0,260);gm=!!((j.candidates||[])[0]||{}).groundingMetadata;}catch(e){txt='PARSE '+d.slice(0,160);}
 console.log('GROUNDED status',s,sec+'s','groundingMeta:',gm);console.log(txt);
});
