const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const LEADERBOARD_FILE = path.join(__dirname, "leaderboard.json");
const MAX_ENTRIES = 10;

function readLeaderboard() {
  try {
    return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeLeaderboard(entries) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries), "utf8");
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/leaderboard") {
    const entries = readLeaderboard();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(entries));
    return;
  }

  if (req.method === "POST" && req.url === "/api/leaderboard") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      if (body.length > 1024) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        return;
      }
      try {
        const { initials, score } = JSON.parse(body);
        if (typeof initials !== "string" || !/^[A-Z]{1,3}$/.test(initials)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid initials" }));
          return;
        }
        if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 9999999) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid score" }));
          return;
        }
        const entries = readLeaderboard();
        entries.push({ initials, score });
        entries.sort((a, b) => b.score - a.score);
        entries.splice(MAX_ENTRIES);
        writeLeaderboard(entries);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, leaderboard: entries }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad request" }));
      }
    });
    return;
  }

  const reqPath = req.url === "/" ? "/frontend.html" : req.url;
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
