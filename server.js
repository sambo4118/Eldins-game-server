const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const GAMES_DIR = path.join(__dirname, 'games');

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

app.listen(PORT, () => {
    console.log(`Main site: http://localhost:${PORT}`);
});