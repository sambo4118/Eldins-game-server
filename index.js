const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const startSpot = 3;

class tetromino {
    constructor(shape, grid, color, gridX, gridY, rotation = 0, texture = null) {
        this.x = gridX;
        this.y = gridY;
        this.shape = shape;
        this.grid = grid;
        this.rotation = rotation;
        if (!texture) {
            this.color = color;
        } else {
            this.loadTexture(texture);
        }
        this.active = true;
        this.lockDelaySteps = 0;
        this.maxLockDelaySteps = 3;
        if (!this.color && !this.texture) {
            this.color = this.shapeColor();
        }
    }

    loadTexture(texture) {
        // todo: load texture
    }

    matrix(rotation = this.rotation) {
        const shapes = {
        O: [[
            [1, 1],
            [1, 1],
        ]],
        I: [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
            ],
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ],
        ],
        T: [
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [1, 0, 0],
                [1, 1, 0],
                [1, 0, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 0, 1],
            ],
        ],
        J: [
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0],
            ],
        ],
        L: [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0],
            ],
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0],
            ],
        ],
        S: [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ],
            [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1],
            ],
        ],
        Z: [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [1, 0, 0],
            ],
        ],
        }
        return shapes[this.shape][rotation];
    }
    get rotationNumber() {
        const shapeRotationCounts = {
            O: 1,
            I: 4,
            T: 4,
            L: 4,
            J: 4,
            S: 4,
            Z: 4,
        }
        return shapeRotationCounts[this.shape];
    }
    shapeColor() {
        const shapeColors = {
            O: "yellow",
            I: "cyan",
            T: "purple",
            L: "orange",
            J: "blue",
            S: "green",
            Z: "red"
        }
        return shapeColors[this.shape];
    }

    updateCells() {
        this.matrix().forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;

                const gridX = this.x + j;
                const gridY = this.y + i;

                if (this.grid.cells[gridY][gridX] != null && this.grid.cells[gridY][gridX] != this) return;
                
                if (
                        gridY >= 0 &&
                        gridY < this.grid.rows &&
                        gridX >= 0 && 
                        gridX < this.grid.cols
                    ) {
                    this.grid.cells[gridY][gridX] = this;
                }
                

            })
        });
        return true;
    }

    clearCells() {
        this.matrix().forEach((row, i) => {
            row.forEach((cell, j) => {
                
                const gridX = this.x + j;
                const gridY = this.y + i;
                
                if (gridY < 0 || gridY >= this.grid.rows || gridX < 0 || gridX >= this.grid.cols) return;
                if (this.grid.cells[gridY][gridX] !== this) return;
                this.grid.cells[gridY][gridX] = null;
            })
        });
    }


    checkCollision(x = this.x, y = this.y, rotation = this.rotation) {
        for (const [i, row] of this.matrix(rotation).entries()) {
            for (const [j, cell] of row.entries()) {
                if (!cell) continue;
                const gridX = x + j;
                const gridY = y + i;
                if (gridX < 0 || gridX >= this.grid.cols || gridY >= this.grid.rows) return "grid";
                if (gridY < 0) continue;
                const occupant = this.grid.cells[gridY][gridX];
                if (occupant !== null && occupant !== this) return occupant;
            }
        }
        return null;
    }

    stepDown() {
    
        if (!this.active) return;

        const canMove = !this.checkCollision(this.x, this.y + 1);
        
        if (!canMove) {
            this.lockDelaySteps++;
            if (this.lockDelaySteps >= this.maxLockDelaySteps) {
                this.active = false;
            }
            return;
        }

        this.clearCells();
        this.y += 1;
        this.updateCells();
        this.grid.drawCells();
        this.grid.drawActivePiece(this);
        
    }

    resetLockDelay() {
        this.lockDelaySteps = 0;
    }

    hardDrop() {
        if (!this.active) return;
        
        this.clearCells();
        while (!this.checkCollision(this.x, this.y + 1)) {
            this.y += 1;
        }
        this.updateCells();
        this.grid.drawCells();
        this.active = false;
    }

}


class Grid {
    constructor(centerX, centerY, cellSize, rows, cols, color = "grey") {
        this.centerX = centerX;
        this.centerY = centerY;
        this.cellSize = cellSize;
        this.rows = rows;
        this.cols = cols;
        this.color = color;
        this.cells = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    drawBorder(color = this.color, width = 1) {
        context.strokeStyle = color;
        context.lineWidth = width;
        context.strokeRect(this.left, this.top, this.width, this.height);
    }

    get left() {
        return this.centerX - (this.cols * this.cellSize) / 2;
    }

    get top() {
        return this.centerY - (this.rows * this.cellSize) / 2;
    }

    get width() {
        return this.cols * this.cellSize;
    }

    get height() {
        return this.rows * this.cellSize;
    }

    clearLine(rowNumber) {
        this.cells.splice(rowNumber, 1);
        this.cells.unshift(Array(this.cols).fill(null));
    }

    checkLines() {
        const fullRows = [];
        for (let i = 0; i < this.rows; i++) {
            const row = this.cells[i];
            const isFull = row.every(cell => cell !== null && !cell.active);
            if (isFull) {
                fullRows.push(i);
            }
        }
        return fullRows;
    }

    drawActivePiece(piece) {
        if (!piece || !piece.active) return;
        const matrix = piece.matrix();
        context.save();
        context.beginPath();
        context.rect(this.left, this.top, this.width, this.height);
        context.clip();
        matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;
                const px = this.left + (piece.x + j) * this.cellSize;
                const py = this.top + (piece.y + i) * this.cellSize;
                context.fillStyle = piece.color;
                context.fillRect(px, py, this.cellSize, this.cellSize);
            });
        });
        context.restore();
    }

    drawCells() {
        this.drawBorder("grey", 1);
        this.cells.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    context.fillStyle = cell.color;
                    context.fillRect(
                        this.left + j * this.cellSize,
                        this.top + i * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
                if (!cell) {
                    context.fillStyle = "black";
                    context.fillRect(
                        this.left + j * this.cellSize,
                        this.top + i * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            });
        });
    }
}

class Score {
    constructor(context, x, y, font = "16px Arial", color = "white") {
        this.context = context;
        this.x = x;
        this.y = y;
        this.font = font;
        this.color = color;
        this.score = 0;
        this.linesCleared = 0;
        this.level = 1;
        this.displayScore = this.score;
    }

    addscore(lines) {
        const lineScores = [0, 1000, 2000, 3000, 10000];
        this.score += lineScores[lines] * this.level;
        this.linesCleared += lines;
        this.level = Math.floor(this.linesCleared / 10) + 1;
    }

    draw() {
        if (this.displayScore < this.score) {
            this.displayScore = Math.min(this.displayScore + Math.ceil((this.score - this.displayScore) / 10), this.score);
        }
        const scoreMetrics = this.context.measureText(`Score: ${this.displayScore}`);
        const linesMetrics = this.context.measureText(`Lines: ${this.linesCleared}`);
        const levelMetrics = this.context.measureText(`Level: ${this.level}`);
        const maxWidth = Math.max(scoreMetrics.width, linesMetrics.width, levelMetrics.width);
        this.context.clearRect(this.x, this.y - 20, this.x + maxWidth, this.y + 48);
        this.context.fillStyle = this.color;
        this.context.font = this.font;
        this.context.fillText(`Score: ${this.displayScore}`, this.x, this.y);
        this.context.fillText(`Lines: ${this.linesCleared}`, this.x, this.y + 24);
        this.context.fillText(`Level: ${this.level}`, this.x, this.y + 48);
    }



}

function grabBagRandomShape(bag) {
    if (!bag || bag.length === 0) {
        const shapes = ["O", "I", "T", "L", "J", "S", "Z"];
        bag.push(...shapes, ...shapes);
    }

    const randomIndex = Math.floor(Math.random() * bag.length);
    
    return bag.splice(randomIndex, 1)[0];
}

function holdPiece() {
    if (!canHold || !currentPeice.active) return;
    
    currentPeice.clearCells();
    const currentShape = currentPeice.shape;
    
    if (heldPieceShape === null) {
        heldPieceShape = currentShape;
        const shape = grabBagRandomShape(bag);
        currentPeice = new tetromino(shape, playField, null, startSpot, shape === "I" ? -1 : 0);
    } else {
        const tempShape = heldPieceShape;
        heldPieceShape = currentShape;
        currentPeice = new tetromino(tempShape, playField, null, startSpot, tempShape === "I" ? -1 : 0);
    }
    
    currentPeice.updateCells();
    canHold = false;
    drawHeldPiece();
    playField.drawCells();
    playField.drawActivePiece(currentPeice);
}

function drawHeldPiece() {
    // Clear and redraw the hold box background
    context.fillStyle = "black";
    context.fillRect(holdGrid.left, holdGrid.top, holdGrid.width, holdGrid.height);
    holdGrid.drawBorder("grey", 1);

    if (heldPieceShape) {
        const tempPiece = new tetromino(heldPieceShape, holdGrid, null, 0, 0);
        const matrix = tempPiece.matrix(0);
        const pieceCols = matrix[0].length;
        const pieceRows = matrix.length;
        const startX = holdGrid.centerX - (pieceCols * holdGrid.cellSize) / 2;
        const startY = holdGrid.centerY - (pieceRows * holdGrid.cellSize) / 2;

        matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;
                context.fillStyle = tempPiece.color;
                context.fillRect(
                    startX + j * holdGrid.cellSize,
                    startY + i * holdGrid.cellSize,
                    holdGrid.cellSize,
                    holdGrid.cellSize
                );
            });
        });
    }
}

playField = new Grid(canvas.width / 2, canvas.height / 2 + 50, 20, 20, 10);
playField.drawBorder("grey", 1);
scoreCounter = new Score(context, canvas.width - 100, playField.top);
// Hold grid - small 4x4 grid on the left side
holdGrid = new Grid(canvas.width / 2 - 150, canvas.height / 2 - 100, 20, 4, 4);
holdGrid.drawBorder("grey", 1);

LastStepTime = Date.now();
let bag = [];
let heldPieceShape = null;
let canHold = true;

const initialShape = grabBagRandomShape(bag);
let currentPeice = new tetromino(initialShape, playField, null, startSpot, initialShape === "I" ? -1 : 0);
currentPeice.updateCells();

drawHeldPiece();

requestAnimationFrame(gameLoop);

function gameLoop() {
    console.log("loop");
    if (Date.now() - LastStepTime > 500) {
        if (!currentPeice.active) {
            const shape = grabBagRandomShape(bag);
            currentPeice = new tetromino(shape, playField, null, startSpot, shape === "I" ? -1 : 0);
            currentPeice.updateCells();
            canHold = true; // Reset hold ability for new piece
        }
        
        currentPeice.stepDown();

        LastStepTime = Date.now();
    }
    
    if (playField.checkLines().length > 0) {
        playField.checkLines().forEach(row => { playField.clearLine(row); scoreCounter.addscore(1); });
        playField.drawCells();
        playField.drawActivePiece(currentPeice);
    }

    scoreCounter.draw();

    requestAnimationFrame(gameLoop);
}

function getSRSKicks(shape, fromRotation, toRotation) {
    const jlstzKicks = {
        "0>1": [[ 0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],
        "1>0": [[ 0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
        "1>2": [[ 0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
        "2>1": [[ 0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],
        "2>3": [[ 0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
        "3>2": [[ 0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],
        "3>0": [[ 0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],
        "0>3": [[ 0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
    };
    const iKicks = {
        "0>1": [[ 0,0],[-2,0],[ 1,0],[-2, 1],[ 1,-2]],
        "1>0": [[ 0,0],[ 2,0],[-1,0],[ 2,-1],[-1, 2]],
        "1>2": [[ 0,0],[-1,0],[ 2,0],[-1,-2],[ 2, 1]],
        "2>1": [[ 0,0],[ 1,0],[-2,0],[ 1, 2],[-2,-1]],
        "2>3": [[ 0,0],[ 2,0],[-1,0],[ 2,-1],[-1, 2]],
        "3>2": [[ 0,0],[-2,0],[ 1,0],[-2, 1],[ 1,-2]],
        "3>0": [[ 0,0],[ 1,0],[-2,0],[ 1, 2],[-2,-1]],
        "0>3": [[ 0,0],[-1,0],[ 2,0],[-1,-2],[ 2, 1]],
    };
    const key = `${fromRotation}>${toRotation}`;
    return shape === "I" ? iKicks[key] : jlstzKicks[key];
}

document.addEventListener("keydown", (key) => {
    if (key.key === "ArrowLeft") {
        if (currentPeice.checkCollision(currentPeice.x - 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.x -= 1;
        currentPeice.resetLockDelay();
        currentPeice.updateCells();
        playField.drawCells();
        playField.drawActivePiece(currentPeice);
    }
    
    if (key.key === "ArrowRight") {
        if (currentPeice.checkCollision(currentPeice.x + 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.x += 1;
        currentPeice.resetLockDelay();
        currentPeice.updateCells();
        playField.drawCells();
        playField.drawActivePiece(currentPeice);
    }
    
    if (key.key === "ArrowDown") {
        if (!currentPeice.active) return;

        const newRotation = (currentPeice.rotation - 1 + currentPeice.rotationNumber) % currentPeice.rotationNumber;
        const kickOffsets = getSRSKicks(currentPeice.shape, currentPeice.rotation, newRotation);
        if (!kickOffsets) return;

        for (const [offsetX, offsetY] of kickOffsets) {
            const testX = currentPeice.x + offsetX;
            const testY = currentPeice.y + offsetY;
            
            if (!currentPeice.checkCollision(testX, testY, newRotation)) {
                currentPeice.clearCells();
                currentPeice.x = testX;
                currentPeice.y = testY;
                currentPeice.rotation = newRotation;
                currentPeice.resetLockDelay();
                currentPeice.updateCells();
                playField.drawCells();
                playField.drawActivePiece(currentPeice);
                return;
            }
        }
    }

    if (key.key === "ArrowUp") {
        if (!currentPeice.active) return;

        const newRotation = (currentPeice.rotation + 1) % currentPeice.rotationNumber;
        const kickOffsets = getSRSKicks(currentPeice.shape, currentPeice.rotation, newRotation);
        if (!kickOffsets) return;

        for (const [offsetX, offsetY] of kickOffsets) {
            const testX = currentPeice.x + offsetX;
            const testY = currentPeice.y + offsetY;
            
            if (!currentPeice.checkCollision(testX, testY, newRotation)) {
                currentPeice.clearCells();
                currentPeice.x = testX;
                currentPeice.y = testY;
                currentPeice.rotation = newRotation;
                currentPeice.resetLockDelay();
                currentPeice.updateCells();
                playField.drawCells();
                playField.drawActivePiece(currentPeice);
                return;
            }
        }
    }

    if (key.key === " ") {
        currentPeice.hardDrop();
    }

    if (key.key === "c" || key.key === "C") {
        holdPiece();
    }

});
    