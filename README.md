# Eldins-game-server

This server hosts all games in the `games/` folder and exposes a shared leaderboard API any game can use.

## Shared Leaderboard API

Use one game id per game (for example `tetris-online`).

### Get leaderboard

- `GET /api/games/:gameId/leaderboard`
- Optional query: `limit` (default `10`, max `100`)

Example response:

```json
{
	"gameId": "tetris-online",
	"leaderboard": [
		{
			"name": "ABC",
			"score": 12345,
			"createdAt": "2026-04-08T10:00:00.000Z"
		}
	]
}
```

### Submit score

- `POST /api/games/:gameId/leaderboard`
- JSON body:

```json
{
	"name": "ABC",
	"score": 12345
}
```

Validation rules:

- `gameId`: letters, numbers, dashes, max 64 chars
- `name`: 1 to 24 chars
- `score`: integer from `0` to `999999999`

Scores are persisted in `data/scoreboards/:gameId.json`.

## Deploying With Git Submodules

This repository pins `games/tetris-online` and `games/2048-remade` as submodules.

If an updater runs `git pull` inside a submodule, the parent repository becomes dirty because the submodule commit no longer matches the commit recorded by the parent repo.

For automated updates, use this flow from the repository root:

```bash
git pull
npm run sync:submodules
```

That keeps the direct submodules aligned to the exact commits recorded by the parent repository.

Do not run `git pull` directly inside `games/tetris-online` unless you also intend to commit the updated submodule pointer in the parent repository.

## Add scoreboard to a new game

1. Pick a stable `gameId` (usually the folder name).
2. Read scores from `GET /api/games/:gameId/leaderboard?limit=10`.
3. Post scores to `POST /api/games/:gameId/leaderboard` with `{ name, score }`.
4. Render returned `leaderboard` array in your game UI.