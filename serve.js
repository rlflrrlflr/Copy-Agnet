/* 소재냥인 로컬 서버 (v33·42차) — 무의존(Node 내장만). 역할 2가지:
   1) 이 폴더를 정적 서빙 (http://localhost:5173/v33_studio.html)
   2) GET /keys — %USERPROFILE%\.studio\keys.txt 를 파싱해 키를 앱에 자동 주입(127.0.0.1 전용, 키는 리포에 없음)
   실행: node serve.js  (또는 소재냥인_시작.bat 더블클릭) */
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const PORT = 5173, ROOT = __dirname;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".md": "text/markdown; charset=utf-8" };

function readKeys() {
  const out = { gemini: "", claude: "", openai: "" };
  try {
    const txt = fs.readFileSync(path.join(os.homedir(), ".studio", "keys.txt"), "utf-8");
    const lines = txt.split(/\r?\n/);
    let label = "";
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      if (/[>:]$/.test(t)) { label = t.toLowerCase(); continue; }
      if (/gemini/.test(label)) out.gemini = out.gemini || t;
      else if (/gpt|openai|chat/.test(label)) out.openai = out.openai || t;
      else if (/claude|anthropic/.test(label)) out.claude = out.claude || t;
    }
  } catch (e) { /* 키 파일 없으면 빈 값 — 앱은 수동 입력/localStorage로 동작 */ }
  return out;
}

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  if (url === "/keys") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(readKeys())); return; }
  let file = url === "/" ? "/v33_studio.html" : url;
  const fp = path.normalize(path.join(ROOT, file));
  if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => console.log("소재냥인 → http://localhost:" + PORT + "/  (키 자동 연결: ~\\.studio\\keys.txt)"));
