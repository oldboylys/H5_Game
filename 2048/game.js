// 游戏状态管理
let grid = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let isGameOver = false;
let touchStartX = 0;
let touchStartY = 0;

// 初始化游戏
function initGame() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    isGameOver = false;
    updateScore();
    addNewTile();
    addNewTile();
    renderGrid();
}

// 开始游戏
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    initGame();
}

// 重置游戏
function resetGame() {
    initGame();
}

// 更新分数
function updateScore(addedScore) {
    document.getElementById('score').textContent = score;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('bestScore').textContent = bestScore;
    }
    
    if (addedScore) {
        const scoreChange = document.createElement('div');
        scoreChange.className = 'score-change';
        scoreChange.textContent = '+' + addedScore;
        scoreChange.style.left = document.getElementById('score').getBoundingClientRect().left + 'px';
        scoreChange.style.top = document.getElementById('score').getBoundingClientRect().top + 'px';
        document.body.appendChild(scoreChange);
        setTimeout(() => scoreChange.remove(), 800);
    }
}

// 添加新方块
function addNewTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({x: i, y: j});
            }
        }
    }
    if (emptyCells.length > 0) {
        const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
}

// 渲染网格
function renderGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.className = grid[i][j] === 0 ? 'cell' : 'cell merge';
            cell.setAttribute('data-value', grid[i][j]);
            cell.textContent = grid[i][j] || '';
            gridElement.appendChild(cell);
        }
    }
}

// 移动和合并方块
function moveTiles(direction) {
    if (isGameOver) return;

    const oldGrid = JSON.stringify(grid);
    let moved = false;

    // 移动和合并逻辑
    switch(direction) {
        case 'ArrowLeft':
            moved = moveLeft();
            break;
        case 'ArrowRight':
            moved = moveRight();
            break;
        case 'ArrowUp':
            moved = moveUp();
            break;
        case 'ArrowDown':
            moved = moveDown();
            break;
    }

    if (moved) {
        addNewTile();
        renderGrid();
        checkGameOver();
    }
}

// 向左移动
function moveLeft() {
    let moved = false;
    for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(cell => cell !== 0);
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                const mergeValue = row[j] * 2;
                row[j] = mergeValue;
                score += mergeValue;
                row.splice(j + 1, 1);
                updateScore(mergeValue);
                moved = true;
            }
        }
        while (row.length < 4) row.push(0);
        if (row.join(',') !== grid[i].join(',')) moved = true;
        grid[i] = row;
    }
    updateScore();
    return moved;
}

// 向右移动
function moveRight() {
    let moved = false;
    for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(cell => cell !== 0);
        for (let j = row.length - 1; j > 0; j--) {
            if (row[j] === row[j - 1]) {
                const mergeValue = row[j] * 2;
                row[j] = mergeValue;
                score += mergeValue;
                row.splice(j - 1, 1);
                row.unshift(0);
                updateScore(mergeValue);
                moved = true;
            }
        }
        while (row.length < 4) row.unshift(0);
        if (row.join(',') !== grid[i].join(',')) moved = true;
        grid[i] = row;
    }
    updateScore();
    return moved;
}

// 向上移动
function moveUp() {
    let moved = false;
    for (let j = 0; j < 4; j++) {
        let column = [];
        for (let i = 0; i < 4; i++) {
            if (grid[i][j] !== 0) column.push(grid[i][j]);
        }
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                const mergeValue = column[i] * 2;
                column[i] = mergeValue;
                score += mergeValue;
                column.splice(i + 1, 1);
                updateScore(mergeValue);
                moved = true;
            }
        }
        while (column.length < 4) column.push(0);
        for (let i = 0; i < 4; i++) {
            if (grid[i][j] !== column[i]) moved = true;
            grid[i][j] = column[i];
        }
    }
    updateScore();
    return moved;
}

// 向下移动
function moveDown() {
    let moved = false;
    for (let j = 0; j < 4; j++) {
        let column = [];
        for (let i = 0; i < 4; i++) {
            if (grid[i][j] !== 0) column.push(grid[i][j]);
        }
        for (let i = column.length - 1; i > 0; i--) {
            if (column[i] === column[i - 1]) {
                const mergeValue = column[i] * 2;
                column[i] = mergeValue;
                score += mergeValue;
                column.splice(i - 1, 1);
                column.unshift(0);
                updateScore(mergeValue);
                moved = true;
            }
        }
        while (column.length < 4) column.unshift(0);
        for (let i = 0; i < 4; i++) {
            if (grid[i][j] !== column[i]) moved = true;
            grid[i][j] = column[i];
        }
    }
    updateScore();
    return moved;
}

// 检查游戏是否结束
function checkGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) return;
            if (i < 3 && grid[i][j] === grid[i + 1][j]) return;
            if (j < 3 && grid[i][j] === grid[i][j + 1]) return;
        }
    }
    isGameOver = true;
    setTimeout(() => {
        alert('游戏结束！最终得分：' + score);
    }, 300);
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        moveTiles(e.key);
    }
});

// 触摸事件监听
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            moveTiles('ArrowRight');
        } else {
            moveTiles('ArrowLeft');
        }
    } else {
        if (deltaY > 0) {
            moveTiles('ArrowDown');
        } else {
            moveTiles('ArrowUp');
        }
    }

    touchStartX = null;
    touchStartY = null;
});

// 初始化最高分显示
document.getElementById('bestScore').textContent = bestScore;