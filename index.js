const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

class tetromino {
    constructor(shape, grid, texture = null, color = "red", gridX, gridY, rotation = 1) {
        this.x = gridX;
        this.y = gridY;
        this.shape = shape;
        this.grid = grid;
        this.rotation = rotation;
        if (!texture) {
            this.color = color;
        }

    }

    load(texture) {
        // todo: load texture
    }

    updateCells() {
        
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

    draw() {
        context.strokeStyle = this.color;

        for (let i = 0; i <= this.rows; i++) {
            context.beginPath();
            context.moveTo(this.centerX - (this.cols * this.cellSize) / 2, this.centerY - (this.rows * this.cellSize) / 2 + i * this.cellSize);
            context.lineTo(this.centerX + (this.cols * this.cellSize) / 2, this.centerY - (this.rows * this.cellSize) / 2 + i * this.cellSize);
            context.stroke();
        }
        
        for (let i = 0; i <= this.cols; i++) {
            context.beginPath();
            context.moveTo(this.centerX - (this.cols * this.cellSize) / 2 + i * this.cellSize, this.centerY - (this.rows * this.cellSize) / 2);
            context.lineTo(this.centerX - (this.cols * this.cellSize) / 2 + i * this.cellSize, this.centerY + (this.rows * this.cellSize) / 2);
            context.stroke();
        }
    }

    drawTetrimino(tetromino) {
        
}

playField = new Grid(canvas.width / 2, canvas.height / 2 + 50, 20, 20, 10);
playField.draw();