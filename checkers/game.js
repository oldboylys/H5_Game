// 游戏状态常量
const GameState = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

// 玩家常量
const Player = {
    RED: 'red',
    BLUE: 'blue'
};

class CheckersGame {
    // 添加分数记录
    scores = {
        [Player.RED]: 0,
        [Player.BLUE]: 0
    };

    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        this.currentPlayer = Player.RED;
        this.gameState = GameState.WAITING;
        this.selectedPiece = null;
        this.board = this.initializeBoard();
        this.validMoves = [];

        // 设置画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // 绑定事件监听器
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    }

    resizeCanvas() {
        const container = document.getElementById('board');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.cellSize = Math.min(this.canvas.width, this.canvas.height) / 10;
        this.draw();
    }

    initializeBoard() {
        const board = Array(10).fill().map(() => Array(10).fill(null));
        
        // 初始化红方棋子（上方）
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 10; col++) {
                if ((row + col) % 2 === 0) {
                    board[row][col] = Player.RED;
                }
            }
        }

        // 初始化蓝方棋子（下方）
        for (let row = 6; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if ((row + col) % 2 === 0) {
                    board[row][col] = Player.BLUE;
                }
            }
        }

        return board;
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.gameState = GameState.PLAYING;
        this.updateStatus();
    }

    updateStatus() {
        document.getElementById('currentPlayer').textContent = 
            this.currentPlayer === Player.RED ? '红方' : '蓝方';
        document.getElementById('gameStatus').textContent = 
            this.gameState === GameState.PLAYING ? '游戏进行中' : '游戏结束';
    }

    handleClick(event) {
        if (this.gameState !== GameState.PLAYING) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row < 0 || row >= 10 || col < 0 || col >= 10) return;

        if (!this.selectedPiece) {
            // 选择棋子
            if (this.board[row][col] === this.currentPlayer) {
                this.selectedPiece = {row, col};
                this.validMoves = this.getValidMoves(row, col);
                this.draw();
            }
        } else {
            // 移动棋子
            const move = this.validMoves.find(m => m.row === row && m.col === col);
            if (move) {
                this.movePiece(this.selectedPiece, move);
                this.selectedPiece = null;
                this.validMoves = [];
                this.currentPlayer = this.currentPlayer === Player.RED ? Player.BLUE : Player.RED;
                this.checkWinCondition();
                this.updateStatus();
                this.draw();
            } else {
                // 取消选择
                this.selectedPiece = null;
                this.validMoves = [];
                this.draw();
            }
        }
    }

    getValidMoves(row, col) {
        const moves = [];
        const directions = [
            {row: -1, col: -1}, {row: -1, col: 1},
            {row: 1, col: -1}, {row: 1, col: 1}
        ];

        // 检查普通移动和跳跃移动
        for (const dir of directions) {
            // 普通移动
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                moves.push({row: newRow, col: newCol});
            }

            // 跳跃移动
            const jumpRow = row + dir.row * 2;
            const jumpCol = col + dir.col * 2;
            if (this.isValidPosition(jumpRow, jumpCol) && 
                !this.board[jumpRow][jumpCol] && 
                this.board[row + dir.row][col + dir.col] && 
                this.board[row + dir.row][col + dir.col] !== this.currentPlayer) {
                moves.push({row: jumpRow, col: jumpCol});
            }
        }

        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 10 && col >= 0 && col < 10;
    }

    movePiece(from, to) {
        this.board[to.row][to.col] = this.board[from.row][from.col];
        this.board[from.row][from.col] = null;

        // 如果是跳跃移动，移除被跳过的棋子
        if (Math.abs(to.row - from.row) === 2) {
            const middleRow = (from.row + to.row) / 2;
            const middleCol = (from.col + to.col) / 2;
            // 记录得分
            this.scores[this.currentPlayer]++;
            // 更新分数显示
            document.getElementById('redScore').textContent = this.scores[Player.RED];
            document.getElementById('blueScore').textContent = this.scores[Player.BLUE];
            this.board[middleRow][middleCol] = null;
        }
    }

    checkWinCondition() {
        let redWin = true;
        let blueWin = true;

        // 检查红方是否所有棋子都到达蓝方起始位置
        for (let row = 6; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if ((row + col) % 2 === 0 && this.board[row][col] !== Player.RED) {
                    redWin = false;
                }
            }
        }

        // 检查蓝方是否所有棋子都到达红方起始位置
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 10; col++) {
                if ((row + col) % 2 === 0 && this.board[row][col] !== Player.BLUE) {
                    blueWin = false;
                }
            }
        }

        if (redWin || blueWin) {
            this.gameState = GameState.GAME_OVER;
            document.getElementById('gameStatus').textContent = 
                `游戏结束 - ${redWin ? '红方' : '蓝方'}获胜！`;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制棋盘格子
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;

                // 创建水晶效果的渐变背景
                const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
                if ((row + col) % 2 === 0) {
                    gradient.addColorStop(0, 'rgba(74, 74, 74, 0.8)');
                    gradient.addColorStop(1, 'rgba(74, 74, 74, 0.6)');
                } else {
                    gradient.addColorStop(0, 'rgba(42, 42, 42, 0.8)');
                    gradient.addColorStop(1, 'rgba(42, 42, 42, 0.6)');
                }
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // 添加水晶边框效果
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                // 绘制棋子
                if (this.board[row][col]) {
                    // 绘制水晶风格的棋子
                    const centerX = x + this.cellSize / 2;
                    const centerY = y + this.cellSize / 2;
                    const radius = this.cellSize * 0.4;
                    
                    // 创建径向渐变
                    const gradient = this.ctx.createRadialGradient(
                        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
                        centerX, centerY, radius
                    );
                    
                    if (this.board[row][col] === Player.RED) {
                        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                        gradient.addColorStop(0.3, 'rgba(255, 68, 68, 0.8)');
                        gradient.addColorStop(1, 'rgba(200, 0, 0, 0.6)');
                    } else {
                        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                        gradient.addColorStop(0.3, 'rgba(68, 68, 255, 0.8)');
                        gradient.addColorStop(1, 'rgba(0, 0, 200, 0.6)');
                    }
                    
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                    
                    // 添加高光效果
                    this.ctx.beginPath();
                    this.ctx.arc(
                        centerX - radius * 0.3,
                        centerY - radius * 0.3,
                        radius * 0.2,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    this.ctx.fill();
                }
            }
        }

        // 绘制选中的棋子
        if (this.selectedPiece) {
            const x = this.selectedPiece.col * this.cellSize;
            const y = this.selectedPiece.row * this.cellSize;
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);

            // 绘制有效移动位置
            for (const move of this.validMoves) {
                const moveX = move.col * this.cellSize;
                const moveY = move.row * this.cellSize;
                this.ctx.beginPath();
                this.ctx.arc(
                    moveX + this.cellSize / 2,
                    moveY + this.cellSize / 2,
                    this.cellSize * 0.15,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                this.ctx.fill();
            }
        }
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', () => {
    new CheckersGame();
});