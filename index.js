const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

class tetromino {
    constructor(shape, grid, color = "red", gridX, gridY, rotation = 0, texture = null) {
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

    }

    loadTexture(texture) {
        // todo: load texture
    }

    getMatrix() {
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
        ]
        }
        return shapes[this.shape][this.rotation];
    }

    updateCells() {
        this.getMatrix().forEach((row, i) => {
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
        this.getMatrix().forEach((row, i) => {
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

    stepDown() {
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

playField = new Grid(canvas.width / 2, canvas.height / 2 + 50, 20, 20, 10);
testPeice = new tetromino("T", playField, "blue", 5, 0);
testPeice.updateCells();
playField.drawGrid("#333333", 1);
playField.drawBorder("grey", 1);
playField.drawCells();
LastStepTime = Date.now();

requestAnimationFrame(gameLoop);

function gameLoop() {
    console.log("loop");
    if (Date.now() - LastStepTime > 100) {
        console.log("step");
        testPeice.stepDown();
        LastStepTime = Date.now();
    }
    

    requestAnimationFrame(gameLoop);
}