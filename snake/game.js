const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let gridSize;
// 设置画布大小
const setCanvasSize = () => {
    const size = Math.min(window.innerWidth - 40, window.innerHeight - 200);
    canvas.width = size;
    canvas.height = size;
    gridSize = Math.floor(size / 20); // 动态计算网格大小
};

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// 游戏变量
let snake = [
    { x: 10, y: 10 }
];
let food = null;
let direction = 'right';
let nextDirection = 'right';
let score = 0;
// let gameLoop = null;
let touchStartX = 0;
let touchStartY = 0;

// 生成食物
const generateFood = () => {
    const maxPos = Math.floor(canvas.width / gridSize) - 1;
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * maxPos),
            y: Math.floor(Math.random() * maxPos)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
};

// 更新分数
const updateScore = () => {
    score += 10;
    scoreElement.textContent = `分数: ${score}`;
};

// 检查碰撞
const checkCollision = (head) => {
    const maxPos = Math.floor(canvas.width / gridSize);
    // 检查边界碰撞
    if (head.x < 0 || head.x >= maxPos || head.y < 0 || head.y >= maxPos) {
        return true;
    }
    // 检查自身碰撞
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
};

// 游戏结束
const gameOver = () => {
    clearInterval(gameInterval);
    gameInterval = null;
    alert(`游戏结束！得分：${score}\n点击确定重新开始`);
    startGame();
};
// 游戏更新
const update = () => {
    direction = nextDirection;
    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    if (checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (food && head.x === food.x && head.y === food.y) {
        generateFood();
        updateScore();
    } else {
        snake.pop();
    }
};

// 绘制游戏
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
    });

    // 绘制食物
    if (food) {
        ctx.fillStyle = '#F44336';
        ctx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
    }
};

// 游戏循环
const gameLoop = () => {
    update();
    draw();
};

let gameInterval = null;
// 开始游戏
const startGame = () => {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = '分数: 0';
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 150);
};


// 键盘控制
document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'arrowdown':
        case 's':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'arrowleft':
        case 'a':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'arrowright':
        case 'd':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 触摸控制
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (dx < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        if (dy > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (dy < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
});

// 方向按钮控制
document.getElementById('upBtn').addEventListener('click', () => {
    if (direction !== 'down') nextDirection = 'up';
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (direction !== 'up') nextDirection = 'down';
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (direction !== 'right') nextDirection = 'left';
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (direction !== 'left') nextDirection = 'right';
});

// 开始页面逻辑
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    startGame();
});

// 游戏结束时显示开始页面
const showStartScreen = () => {
    startScreen.style.display = 'flex';
    startBtn.textContent = '重新开始';
};


// 不自动启动游戏，等待点击开始按钮
// startGame();