// 获取画布和上下文
const gameArea = document.getElementById('gameArea');
const gameCtx = gameArea.getContext('2d');
const nextPiece = document.getElementById('nextPiece');
const nextCtx = nextPiece.getContext('2d');

// 游戏配置
const GRID_SIZE = 30;
const COLS = 10;
const ROWS = 20;
const PREVIEW_SIZE = 4;

// 设置画布大小
gameArea.width = COLS * GRID_SIZE;
gameArea.height = ROWS * GRID_SIZE;
nextPiece.width = PREVIEW_SIZE * GRID_SIZE;
nextPiece.height = PREVIEW_SIZE * GRID_SIZE;

// 方块形状定义
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// 方块颜色
const COLORS = [
    '#00f0f0', // cyan
    '#f0f000', // yellow
    '#a000f0', // purple
    '#f0a000', // orange
    '#0000f0', // blue
    '#00f000', // green
    '#f00000'  // red
];

// 游戏状态
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let nextPieceShape = null;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let isPaused = false;

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 创建新方块
function createPiece() {
    const index = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[index],
        color: COLORS[index],
        x: Math.floor((COLS - SHAPES[index][0].length) / 2),
        y: 0
    };
}

// 绘制方块
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 1, 2);
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, 2, GRID_SIZE - 1);
}

// 绘制游戏区域
function drawBoard() {
    gameCtx.clearRect(0, 0, gameArea.width, gameArea.height);
    
    // 绘制已固定的方块
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(gameCtx, x, y, COLORS[board[y][x] - 1]);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    drawBlock(gameCtx, currentPiece.x + dx, currentPiece.y + dy, currentPiece.color);
                }
            });
        });
    }
}

// 绘制预览区域
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextPiece.width, nextPiece.height);
    if (nextPieceShape) {
        const shape = SHAPES[nextPieceShape];
        const color = COLORS[nextPieceShape];
        const offsetX = Math.floor((PREVIEW_SIZE - shape[0].length) / 2);
        const offsetY = Math.floor((PREVIEW_SIZE - shape.length) / 2);
        
        shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    drawBlock(nextCtx, offsetX + dx, offsetY + dy, color);
                }
            });
        });
    }
}

// 碰撞检测
function isCollision(piece, offsetX = 0, offsetY = 0) {
    return piece.shape.some((row, dy) => {
        return row.some((value, dx) => {
            if (!value) return false;
            const newX = piece.x + dx + offsetX;
            const newY = piece.y + dy + offsetY;
            return newX < 0 || newX >= COLS || newY >= ROWS ||
                   (newY >= 0 && board[newY][newX]);
        });
    });
}

// 固定方块到游戏区域
function lockPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                const y = currentPiece.y + dy;
                const x = currentPiece.x + dx;
                if (y >= 0) {
                    board[y][x] = SHAPES.findIndex(shape => 
                        shape === currentPiece.shape) + 1;
                }
            }
        });
    });
}

// 消除完整的行
function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        score += [40, 100, 300, 1200][linesCleared - 1] * level;
        level = Math.floor(lines / 10) + 1;
        updateScore();
    }
}

// 旋转方块
function rotatePiece() {
    const newShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i]));
    const oldShape = currentPiece.shape;
    currentPiece.shape = newShape;
    
    if (isCollision(currentPiece)) {
        currentPiece.shape = oldShape;
    }
}

// 游戏主循环
function gameStep() {
    if (isPaused) return;
    
    if (currentPiece) {
        if (!isCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            lockPiece();
            clearLines();
            currentPiece = null;
        }
    }
    
    if (!currentPiece) {
        if (nextPieceShape === null) {
            nextPieceShape = Math.floor(Math.random() * SHAPES.length);
        }
        currentPiece = {
            shape: SHAPES[nextPieceShape],
            color: COLORS[nextPieceShape],
            x: Math.floor((COLS - SHAPES[nextPieceShape][0].length) / 2),
            y: 0
        };
        nextPieceShape = Math.floor(Math.random() * SHAPES.length);
        drawNextPiece();
        
        if (isCollision(currentPiece)) {
            gameOver();
            return;
        }
    }
    
    drawBoard();
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    alert(`游戏结束！\n得分：${score}\n消除行数：${lines}\n等级：${level}`);
    document.getElementById('startScreen').style.display = 'flex';
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentPiece = null;
    nextPieceShape = null;
    score = 0;
    level = 1;
    lines = 0;
    isPaused = false;
    updateScore();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 1000 / level);
    
    document.getElementById('startScreen').style.display = 'none';
    gameStep();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!currentPiece || isPaused) return;
    
    switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            if (!isCollision(currentPiece, -1, 0)) {
                currentPiece.x--;
                drawBoard();
            }
            break;
        case 'arrowright':
        case 'd':
            if (!isCollision(currentPiece, 1, 0)) {
                currentPiece.x++;
                drawBoard();
            }
            break;
        case 'arrowdown':
        case 's':
            if (!isCollision(currentPiece, 0, 1)) {
                currentPiece.y++;
                drawBoard();
            }
            break;
        case 'arrowup':
        case 'w':
            rotatePiece();
            drawBoard();
            break;
        case ' ':
            while (!isCollision(currentPiece, 0, 1)) {
                currentPiece.y++;
            }
            drawBoard();
            break;
        case 'p':
            isPaused = !isPaused;
            if (isPaused) {
                clearInterval(gameLoop);
            } else {
                gameLoop = setInterval(gameStep, 1000 / level);
            }
            break;
    }
});

// 绑定开始按钮事件
document.getElementById('startBtn').addEventListener('click', startGame);