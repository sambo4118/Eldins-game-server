const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

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
        if (!this.color && !this.texture) {
            this.color = this.shapeColor();
        }
    }

    loadTexture(texture) {
        // todo: load texture
    }

    get matrix() {
        const shapes = {
        O: [[
            [1, 1],
            [1, 1],
        ]],
        I: [
            [
                [1, 1, 1, 1]
            ],
            [
                [1],
                [1],
                [1],
                [1]
            ]
        ],
        T: [
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            [
                [1, 0],
                [1, 1],
                [1, 0]
            ],
            [
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1],
                [1, 1],
                [0, 1]
            ]
        ],
        L: [
            [
                [1, 0],
                [1, 0],
                [1, 1]
            ],
            [
                [0, 0, 1],
                [1, 1, 1]
            ],
            [
                [1, 1],
                [0, 1],
                [0, 1]
            ],
            [
                [1, 1, 1],
                [1, 0, 0]
            ]
        ],
        J: [
            [
                [0, 1],
                [0, 1],
                [1, 1]
            ],
            [
                [1, 1, 1],
                [0, 0, 1]
            ],
            [
                [1, 1],
                [1, 0],
                [1, 0]
            ],
            [
                [1, 0, 0],
                [1, 1, 1]
            ]
        ],
        S: [
            [
                [0, 1, 1],
                [1, 1, 0]
            ],
            [
                [1, 0],
                [1, 1],
                [0, 1]
            ]
        ],
        Z: [
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 1],
                [1, 1],
                [1, 0],
            ]
        ]
        }
        return shapes[this.shape][this.rotation];
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
        this.matrix.forEach((row, i) => {
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
        this.matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
            
                const gridX = this.x + j;
                const gridY = this.y + i;

                if (
                        gridY >= 0 &&
                        gridY < this.grid.rows &&
                        gridX >= 0 && 
                        gridX < this.grid.cols
                    ) {
                    this.grid.cells[gridY][gridX] = null;
                }
            })
        });
    }


    checkCollision(x = this.x, y = this.y) {
        for (const [i, row] of this.matrix.entries()) {
            for (const [j, cell] of row.entries()) {
                if (!cell) continue;
                const gridX = x + j;
                const gridY = y + i;
                if (gridX < 0 || gridX >= this.grid.cols || gridY < 0 || gridY >= this.grid.rows) return "grid";
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
            this.active = false;
            return;
        }

        this.clearCells();
        this.y += 1;
        this.updateCells();
        this.grid.drawCells();
        
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

    drawGrid(color = this.color, width = 1) {
        context.strokeStyle = color;
        context.lineWidth = width;

        for (let i = 1; i < this.rows; i++) {
            context.beginPath();
            context.moveTo(this.left, this.top + i * this.cellSize);
            context.lineTo(this.left + this.width, this.top + i * this.cellSize);
            context.stroke();
        }

        for (let i = 1; i < this.cols; i++) {
            context.beginPath();
            context.moveTo(this.left + i * this.cellSize, this.top);
            context.lineTo(this.left + i * this.cellSize, this.top + this.height);
            context.stroke();
        }
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

    drawCells() {
        this.drawGrid("#333333", 1);
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

function grabBagRandomShape(bag) {
    if (!bag || bag.length === 0) {
        const shapes = ["O", "I", "T", "L", "J", "S", "Z"];
        bag.push(...shapes, ...shapes);
    }

    const randomIndex = Math.floor(Math.random() * bag.length);
    
    return bag.splice(randomIndex, 1)[0];
}

playField = new Grid(canvas.width / 2, canvas.height / 2 + 50, 20, 20, 10);
playField.drawGrid("#333333", 1);
playField.drawBorder("grey", 1);
LastStepTime = Date.now();
let bag = [];

let currentPeice = new tetromino(grabBagRandomShape(bag), playField, "red", 4, 0);
currentPeice.updateCells();

requestAnimationFrame(gameLoop);

function gameLoop() {
    console.log("loop");
    if (Date.now() - LastStepTime > 500) {
        if (!currentPeice.active) {
            const shape = grabBagRandomShape(bag);
            currentPeice = new tetromino(shape, playField, null, 4, 0);
            currentPeice.updateCells();
        }
        
        currentPeice.stepDown();

        LastStepTime = Date.now();
    }
    

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (key) => {
    if (key.key === "ArrowLeft") {
        if (currentPeice.checkCollision(currentPeice.x - 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.x -= 1;
        currentPeice.updateCells();
        playField.drawCells();
    }
    
    if (key.key === "ArrowRight") {
        if (currentPeice.checkCollision(currentPeice.x + 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.x += 1;
        currentPeice.updateCells();
        playField.drawCells();
    }
    
    if (key.key === "ArrowDown") {
        if (currentPeice.checkCollision(currentPeice.x, currentPeice.y + 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.y += 1;
        currentPeice.updateCells();
        playField.drawCells();
    }

    if (key.key === "ArrowUp") {
        if (!currentPeice.active) return;
        const newRotation = (currentPeice.rotation + 1) % currentPeice.matrix.length;
        if (currentPeice.checkCollision(currentPeice.x, currentPeice.y, newRotation)) return;
        currentPeice.clearCells();
        currentPeice.rotation = newRotation;
        currentPeice.updateCells();
        playField.drawCells();
    }

});
    