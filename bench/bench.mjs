#!/usr/bin/env node
/* 소재냥인 A/B 벤치 — Gemini(Nano Banana Pro) vs OpenAI(gpt-image-2) 한글 텍스트 품질 반복 비교
   사용: GEMINI_API_KEY=... OPENAI_API_KEY=... node bench/bench.mjs [--only gemini|gpt|mask]
   결과: bench/out/<ts>/ 에 PNG + report.html (브라우저로 열면 나란히 비교 + 클라이언트 엣지 점수) */
import fs from "node:fs"; import path from "node:path";
const GK=process.env.GEMINI_API_KEY||"", OK=process.env.OPENAI_API_KEY||"";
const only=(process.argv.find(a=>a.startsWith("--only"))||"").split("=")[1]||"";
const dir=path.join("bench","out",new Date().toISOString().replace(/[:.]/g,"-").slice(0,19));
fs.mkdirSync(dir,{recursive:true});
const scenarios=JSON.parse(fs.readFileSync("bench/scenarios.json","utf8"));
const rows=[];
const save=(name,b64)=>{fs.writeFileSync(path.join(dir,name),Buffer.from(b64,"base64"));return name;};
async function gemini(sc){
  const url="https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key="+GK;
  const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    contents:[{role:"user",parts:[{text:sc.prompt}]}],
    generationConfig:{responseModalities:["IMAGE"],imageConfig:{aspectRatio:sc.ratio,imageSize:"2K"}}})});
  if(!r.ok)throw new Error("gemini "+r.status+" "+(await r.text()).slice(0,120));
  const j=await r.json();
  const part=(((j.candidates||[])[0]||{}).content||{}).parts?.find(p=>p.inlineData);
  if(!part)throw new Error("gemini: no image");
  return save(`${sc.id}_gemini.png`,part.inlineData.data);
}
async function gpt(sc){
  const r=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",
    headers:{"content-type":"application/json",authorization:"Bearer "+OK},
    body:JSON.stringify({model:"gpt-image-2",prompt:sc.prompt,size:sc.size,n:1})});
  if(!r.ok)throw new Error("gpt "+r.status+" "+(await r.text()).slice(0,200));
  const j=await r.json(); const b64=j.data?.[0]?.b64_json;
  if(!b64)throw new Error("gpt: no image (url만 오면 response_format 확인)");
  return save(`${sc.id}_gpt.png`,b64);
}
async function maskProbe(){ // 마스크 극성 판정: 어느 절반이 빨갛게 변하는가
  const fd=new FormData();
  fd.append("model","gpt-image-2");
  fd.append("prompt","Fill the editable area with solid pure red. Change nothing else.");
  fd.append("image",new Blob([fs.readFileSync("bench/fixtures/base.png")],{type:"image/png"}),"base.png");
  fd.append("mask",new Blob([fs.readFileSync("bench/fixtures/mask_left.png")],{type:"image/png"}),"mask.png");
  const r=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{authorization:"Bearer "+OK},body:fd});
  if(!r.ok)throw new Error("mask "+r.status+" "+(await r.text()).slice(0,200));
  const j=await r.json(); return save("maskprobe_gpt.png",j.data[0].b64_json);
}
for(const sc of scenarios){
  const row={id:sc.id,prompt:sc.prompt,gemini:null,gpt:null,err:{}};
  if(GK&&only!=="gpt"&&only!=="mask"){try{row.gemini=await gemini(sc);console.log("✓ gemini",sc.id);}catch(e){row.err.gemini=e.message;console.error("✗ gemini",sc.id,e.message);}}
  if(OK&&only!=="gemini"&&only!=="mask"){try{row.gpt=await gpt(sc);console.log("✓ gpt",sc.id);}catch(e){row.err.gpt=e.message;console.error("✗ gpt",sc.id,e.message);}}
  rows.push(row);
}
let maskImg=null,maskErr=null;
if(OK&&(only===""||only==="mask")){try{maskImg=await maskProbe();console.log("✓ mask probe");}catch(e){maskErr=e.message;console.error("✗ mask",e.message);}}
const html=`<!doctype html><meta charset="utf-8"><title>소재냥인 A/B 벤치</title>
<style>body{font-family:Pretendard,sans-serif;margin:24px;background:#faf9f7}h2{margin:28px 0 8px}
.grid{display:flex;gap:16px;flex-wrap:wrap}.cell{flex:1;min-width:320px;max-width:520px;background:#fff;border:1px solid #e5e1da;border-radius:12px;padding:12px}
img{max-width:100%;border-radius:8px}.score{font-weight:800;font-size:13px;margin-top:6px}.err{color:#c00;font-size:12px}
.prompt{font-size:11px;color:#888;margin:4px 0 12px;white-space:pre-wrap}</style>
<h1>소재냥인 A/B 벤치 — Gemini vs gpt-image-2</h1>
<p>체크 포인트: ①한글 헤드라인 오탈자 ②작은 서브카피/라벨 판독성 ③전체 완성도. 점수는 엣지 비율(선명 경계, 높을수록 텍스트·디테일 많음 — 참고용).</p>
${rows.map(r=>`<h2>${r.id}</h2><div class="prompt">${r.prompt.replace(/</g,"&lt;")}</div><div class="grid">
<div class="cell"><b>Gemini (Nano Banana Pro)</b><br>${r.gemini?`<img src="${r.gemini}" onload="score(this)">`:`<div class="err">${r.err.gemini||"키 없음/스킵"}</div>`}<div class="score"></div></div>
<div class="cell"><b>OpenAI (gpt-image-2)</b><br>${r.gpt?`<img src="${r.gpt}" onload="score(this)">`:`<div class="err">${r.err.gpt||"키 없음/스킵"}</div>`}<div class="score"></div></div>
</div>`).join("")}
<h2>마스크 극성 프로브 (gpt-image-2 images.edit)</h2>
<p>base(파랑+중앙 흰 사각) + mask(왼쪽 불투명/오른쪽 투명) + "편집 영역을 빨강으로". <b>빨개진 쪽 = 편집되는 쪽</b> → 융합 구현 시 제품 영역을 반대 극성으로 보호.</p>
${maskImg?`<div class="grid"><div class="cell"><img src="maskprobe_gpt.png"></div><div class="cell"><b>base</b><br><img src="../../fixtures/base.png"><b>mask</b><br><img src="../../fixtures/mask_left.png"></div></div>`:`<div class="err">${maskErr||"OPENAI_API_KEY 없음/스킵"}</div>`}
<script>
function score(img){const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let e=0,n=0;
for(let y=1;y<c.height-1;y+=3)for(let px=1;px<c.width-1;px+=3){const i=(y*c.width+px)*4,r=(y*c.width+px+1)*4,b=((y+1)*c.width+px)*4;
if(Math.abs(d[i]-d[r])+Math.abs(d[i+1]-d[r+1])+Math.abs(d[i+2]-d[r+2])>90||Math.abs(d[i]-d[b])+Math.abs(d[i+1]-d[b+1])+Math.abs(d[i+2]-d[b+2])>90)e++;n++;}
img.parentElement.querySelector('.score').textContent='엣지 점수: '+(e/n*100).toFixed(1)+'%';}
</script>`;
fs.writeFileSync(path.join(dir,"report.html"),html);
console.log("\n리포트:",path.join(dir,"report.html"),"(브라우저로 열기)");
