const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8000;
const ROOT = __dirname;

const app = express();
const PORT = 3000;
const GAMES_DIR = path.join(__dirname, 'games');
const SCOREBOARD_DIR = path.join(__dirname, 'data', 'scoreboards');
const DEFAULT_MAX_ENTRIES = 10;
const MAX_STORED_ENTRIES = 100;

if (!fs.existsSync(SCOREBOARD_DIR)) {
    fs.mkdirSync(SCOREBOARD_DIR, { recursive: true });
}

app.use(express.json({ limit: '2kb' }));

function isValidGameId(gameId) {
    return typeof gameId === 'string' && /^[a-z0-9-]{1,64}$/i.test(gameId);
}

function getScoreboardFilePath(gameId) {
    return path.join(SCOREBOARD_DIR, `${gameId}.json`);
}

function readScoreboard(gameId) {
    const filePath = getScoreboardFilePath(gameId);
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeScoreboard(gameId, entries) {
    const filePath = getScoreboardFilePath(gameId);
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf8');
}

function normalizeLimit(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, MAX_STORED_ENTRIES);
}

app.get('/api/games/:gameId/leaderboard', (req, res) => {
    const { gameId } = req.params;
    if (!isValidGameId(gameId)) {
        res.status(400).json({ error: 'Invalid game id' });
        return;
    }

    const limit = normalizeLimit(req.query.limit, DEFAULT_MAX_ENTRIES);
    const entries = readScoreboard(gameId)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    res.json({ gameId, leaderboard: entries });
});

app.post('/api/games/:gameId/leaderboard', (req, res) => {
    const { gameId } = req.params;
    if (!isValidGameId(gameId)) {
        res.status(400).json({ error: 'Invalid game id' });
        return;
    }

    const { name, score } = req.body || {};
    if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 24) {
        res.status(400).json({ error: 'Invalid name' });
        return;
    }
    if (!Number.isInteger(score) || score < 0 || score > 999999999) {
        res.status(400).json({ error: 'Invalid score' });
        return;
    }

    const now = new Date().toISOString();
    const nextEntry = {
        name: name.trim().toUpperCase(),
        score,
        createdAt: now
    };

    const entries = readScoreboard(gameId);
    entries.push(nextEntry);
    entries.sort((a, b) => b.score - a.score);
    entries.splice(MAX_STORED_ENTRIES);
    writeScoreboard(gameId, entries);

    res.json({
        ok: true,
        gameId,
        leaderboard: entries.slice(0, DEFAULT_MAX_ENTRIES)
    });
});

// Auto-register a route for each folder in /games
fs.readdirSync(GAMES_DIR).forEach((name) => {
    const gamePath = path.join(GAMES_DIR, name);
    if (!fs.statSync(gamePath).isDirectory()) return;

    // Use frontend.html if index.html doesn't exist
    const indexFile = fs.existsSync(path.join(gamePath, 'index.html'))
        ? 'index.html'
        : 'frontend.html';

    app.use(`/${name}`, express.static(gamePath, { index: indexFile }));
    console.log(`Registered: http://localhost:${PORT}/${name}`);
});

// Serve static files (CSS, JS, images, etc.) from the current directory
app.use(express.static(__dirname));

// Serve index.html at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
