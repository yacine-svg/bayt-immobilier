/* Petit serveur local pour tester le site généré : `npm run dev` puis http://localhost:3000 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const DIST = path.join(__dirname, "dist");
const PORT = process.env.PORT || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.includes("..")) { res.writeHead(400); return res.end(); }
  let file = path.join(DIST, p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith("/")) { res.writeHead(308, { Location: p + "/" + (req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "") }); return res.end(); }
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file)) { res.writeHead(404, { "Content-Type": TYPES[".html"] }); return fs.createReadStream(path.join(DIST, "404.html")).pipe(res); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
