// 游戏配置
const BOARD_SIZE = 600;
const MARBLE_RADIUS = 20;
const BOARD_PADDING = 50;
const COLORS = {
    player1: '#ff69b4',  // 粉色
    player2: '#4169e1',  // 蓝色
    player3: '#ffd700',  // 黄色
    player4: '#32cd32',  // 绿色
    player5: '#ff4500',  // 橙色
    player6: '#9370db',  // 紫色
    empty: 'rgba(255, 255, 255, 0.2)'
};

// 游戏状态
let canvas, ctx;
let board = [];
let selectedMarble = null;
let currentPlayer = 1;
let gameStarted = false;
let validMoves = [];

// 初始化游戏
function initGame() {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    canvas.width = BOARD_SIZE;
    canvas.height = BOARD_SIZE;

    // 设置高DPI支持
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = BOARD_SIZE + 'px';
    canvas.style.height = BOARD_SIZE + 'px';
    canvas.width = BOARD_SIZE * dpr;
    canvas.height = BOARD_SIZE * dpr;
    ctx.scale(dpr, dpr);

    initBoard();
    addEventListeners();
    draw();
}

// 初始化棋盘
function initBoard() {
    board = [];
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    const hexRadius = (BOARD_SIZE - BOARD_PADDING * 2) / 12;

    // 创建六角星形状的棋盘
    for (let q = -4; q <= 4; q++) {
        for (let r = -4; r <= 4; r++) {
            const s = -q - r;
            if (Math.abs(s) <= 4) {
                const x = centerX + hexRadius * (3/2 * q);
                const y = centerY + hexRadius * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
                
                let color = COLORS.empty;
                // 设置初始棋子颜色
                if (r <= -2 && q >= 0) color = COLORS.player1;
                else if (r <= -2 && q < 0) color = COLORS.player2;
                else if (r > -2 && r < 2 && q <= -2) color = COLORS.player3;
                else if (r > -2 && r < 2 && q >= 2) color = COLORS.player4;
                else if (r >= 2 && q < 0) color = COLORS.player5;
                else if (r >= 2 && q >= 0) color = COLORS.player6;

                board.push({
                    q, r, s,
                    x, y,
                    color
                });
            }
        }    
    }
}

// 绘制棋盘
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制所有位置
    board.forEach(pos => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, MARBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = pos.color;
        ctx.fill();
        
        // 添加玻璃效果
        const gradient = ctx.createRadialGradient(
            pos.x - MARBLE_RADIUS/3, pos.y - MARBLE_RADIUS/3,
            MARBLE_RADIUS/10,
            pos.x, pos.y,
            MARBLE_RADIUS
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制选中效果
        if (selectedMarble && pos.q === selectedMarble.q && pos.r === selectedMarble.r) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // 绘制有效移动位置提示
        if (validMoves.some(move => move.q === pos.q && move.r === pos.r)) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });
}

// 事件监听
function addEventListeners() {
    canvas.addEventListener('click', handleClick);
    document.getElementById('startBtn').addEventListener('click', startGame);
}

// 开始游戏
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    currentPlayer = 1;
    updateGameStatus();
}

// 处理点击事件
function handleClick(event) {
    if (!gameStarted) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const clickedPos = board.find(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= MARBLE_RADIUS;
    });

    if (!clickedPos) return;

    if (!selectedMarble) {
        // 选择棋子
        if (isCurrentPlayerMarble(clickedPos)) {
            selectedMarble = clickedPos;
            validMoves = getValidMoves(clickedPos);
            draw();
        }
    } else {
        // 移动棋子
        if (isValidMove(clickedPos)) {
            moveMarble(selectedMarble, clickedPos);
            selectedMarble = null;
            validMoves = [];
            currentPlayer = currentPlayer % 6 + 1;
            updateGameStatus();
            
            if (checkWin()) {
                gameStarted = false;
                showWinMessage();
            }
        } else if (isCurrentPlayerMarble(clickedPos)) {
            // 重新选择棋子
            selectedMarble = clickedPos;
            validMoves = getValidMoves(clickedPos);
        } else {
            // 取消选择
            selectedMarble = null;
            validMoves = [];
        }
        draw();
    }
}

// 检查是否是当前玩家的棋子
function isCurrentPlayerMarble(pos) {
    const playerColor = COLORS[`player${currentPlayer}`];
    return pos.color === playerColor;
}

// 获取有效移动位置
function getValidMoves(pos) {
    const moves = [];
    const directions = [
        {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
        {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
    ];

    // 检查相邻移动
    directions.forEach(dir => {
        const newPos = board.find(p =>
            p.q === pos.q + dir.q && p.r === pos.r + dir.r
        );
        if (newPos && newPos.color === COLORS.empty) {
            moves.push(newPos);
        }
    });

    // 检查跳跃移动
    directions.forEach(dir => {
        const jumpOver = board.find(p =>
            p.q === pos.q + dir.q && p.r === pos.r + dir.r
        );
        if (jumpOver && jumpOver.color !== COLORS.empty) {
            const landing = board.find(p =>
                p.q === pos.q + dir.q * 2 && p.r === pos.r + dir.r * 2
            );
            if (landing && landing.color === COLORS.empty) {
                moves.push(landing);
            }
        }
    });

    return moves;
}

// 检查是否是有效移动
function isValidMove(pos) {
    return validMoves.some(move => move.q === pos.q && move.r === pos.r);
}

// 移动棋子
function moveMarble(from, to) {
    const fromColor = from.color;
    from.color = COLORS.empty;
    to.color = fromColor;
}

// 更新游戏状态
function updateGameStatus() {
    document.getElementById('currentPlayer').textContent = `玩家${currentPlayer}`;
    document.getElementById('gameStatus').textContent = '游戏进行中';
}

// 检查胜利条件
function checkWin() {
    // 检查每个玩家的棋子是否都到达对面的目标区域
    const targetAreas = {
        1: (pos) => pos.r >= 2 && pos.q < 0,  // 玩家1的目标区域（玩家5的起始区域）
        2: (pos) => pos.r >= 2 && pos.q >= 0,  // 玩家2的目标区域（玩家6的起始区域）
        3: (pos) => pos.r <= -2 && pos.q >= 0, // 玩家3的目标区域（玩家1的起始区域）
        4: (pos) => pos.r <= -2 && pos.q < 0,  // 玩家4的目标区域（玩家2的起始区域）
        5: (pos) => pos.r > -2 && pos.r < 2 && pos.q >= 2, // 玩家5的目标区域（玩家4的起始区域）
        6: (pos) => pos.r > -2 && pos.r < 2 && pos.q <= -2  // 玩家6的目标区域（玩家3的起始区域）
    };

    for (let player = 1; player <= 6; player++) {
        const playerColor = COLORS[`player${player}`];
        const playerMarbles = board.filter(pos => pos.color === playerColor);
        if (!playerMarbles.every(pos => targetAreas[player](pos))) {
            return false;
        }
    }
    return true;
}

// 显示胜利消息
function showWinMessage() {
    document.getElementById('gameStatus').textContent = `玩家${currentPlayer}获胜！`;
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);