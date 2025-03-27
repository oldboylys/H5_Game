// 游戏状态常量
const GAME_STATES = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

// 玩家常量
const PLAYERS = {
    RED: 'red',
    BLACK: 'black'
};

// 棋子类型
const PIECE_TYPES = {
    KING: 'king',      // 将/帅
    ADVISOR: 'advisor', // 士/仕
    ELEPHANT: 'elephant', // 象/相
    HORSE: 'horse',    // 马
    CHARIOT: 'chariot', // 车
    CANNON: 'cannon',   // 炮
    PAWN: 'pawn'       // 兵/卒
};

class ChessGame {
    constructor() {
        this.state = GAME_STATES.WAITING;
        this.currentPlayer = PLAYERS.RED;
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.moveHistory = [];
        this.setupEventListeners();
    }

    initializeBoard() {
        const board = Array(10).fill().map(() => Array(9).fill(null));

        // 初始化红方棋子
        this.initializePieces(board, PLAYERS.RED);

        // 初始化黑方棋子
        this.initializePieces(board, PLAYERS.BLACK);

        return board;
    }

    initializePieces(board, player) {
        const isRed = player === PLAYERS.RED;
        const row = isRed ? 9 : 0;
        const pawnRow = isRed ? 6 : 3;

        // 布置车
        board[row][0] = { type: PIECE_TYPES.CHARIOT, player };
        board[row][8] = { type: PIECE_TYPES.CHARIOT, player };

        // 布置马
        board[row][1] = { type: PIECE_TYPES.HORSE, player };
        board[row][7] = { type: PIECE_TYPES.HORSE, player };

        // 布置象
        board[row][2] = { type: PIECE_TYPES.ELEPHANT, player };
        board[row][6] = { type: PIECE_TYPES.ELEPHANT, player };

        // 布置士
        board[row][3] = { type: PIECE_TYPES.ADVISOR, player };
        board[row][5] = { type: PIECE_TYPES.ADVISOR, player };

        // 布置将
        board[row][4] = { type: PIECE_TYPES.KING, player };

        // 布置炮
        const cannonRow = isRed ? row - 2 : row + 2;
        board[cannonRow][1] = { type: PIECE_TYPES.CANNON, player };
        board[cannonRow][7] = { type: PIECE_TYPES.CANNON, player };

        // 布置兵
        for (let i = 0; i < 9; i += 2) {
            board[pawnRow][i] = { type: PIECE_TYPES.PAWN, player };
        }
    }

    setupEventListeners() {
        const chessboard = document.getElementById('chessboard');
        chessboard.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
        debugger
        if (this.state !== GAME_STATES.PLAYING) return;

        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 使用更精确的坐标计算
        const cellWidth = rect.width / 9;
        const cellHeight = rect.height / 10;
        const col = Math.min(Math.max(Math.floor(x / cellWidth), 0), 8);
        const row = Math.min(Math.max(Math.floor(y / cellHeight), 0), 9);

        // 防止重复点击处理
        if (this._lastClickTime && Date.now() - this._lastClickTime < 200) {
            return;
        }
        this._lastClickTime = Date.now();

        this.handleMove(row, col);
    }

    handleMove(row, col) {
        const piece = this.board[row][col];

        // 清除之前的高亮
        this.clearHighlights();

        // 如果点击的是己方棋子，选中该棋子
        if (piece && piece.player === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
            this.highlightValidMoves(row, col);
            return;
        }

        // 如果已经选中棋子，尝试移动
        if (this.selectedPiece) {
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.switchPlayer();
                this.checkGameStatus();
            } else {
                // 如果移动无效，取消选中状态
                this.selectedPiece = null;
            }
        }
    }


isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    // 检查目标位置是否有己方棋子
    const targetPiece = this.board[toRow][toCol];
    if (targetPiece && targetPiece.player === piece.player) return false;

    // 根据不同棋子类型检查走法
    switch (piece.type) {
        case PIECE_TYPES.KING:
            return this.isValidKingMove(fromRow, fromCol, toRow, toCol, piece.player);
        case PIECE_TYPES.ADVISOR:
            return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.player);
        case PIECE_TYPES.ELEPHANT:
            return this.isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.player);
        case PIECE_TYPES.HORSE:
            return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
        case PIECE_TYPES.CHARIOT:
            return this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
        case PIECE_TYPES.CANNON:
            return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
        case PIECE_TYPES.PAWN:
            return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.player);
        default:
            return false;
    }
}

isValidKingMove(fromRow, fromCol, toRow, toCol, player) {
    // 将帅只能在九宫格内移动
    const isRed = player === PLAYERS.RED;
    const minRow = isRed ? 7 : 0;
    const maxRow = isRed ? 9 : 2;
    const minCol = 3;
    const maxCol = 5;

    if (toRow < minRow || toRow > maxRow || toCol < minCol || toCol > maxCol) {
        return false;
    }

    // 将帅只能上下左右移动一格
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

isValidAdvisorMove(fromRow, fromCol, toRow, toCol, player) {
    // 士只能在九宫格内斜线移动
    const isRed = player === PLAYERS.RED;
    const minRow = isRed ? 7 : 0;
    const maxRow = isRed ? 9 : 2;
    const minCol = 3;
    const maxCol = 5;

    if (toRow < minRow || toRow > maxRow || toCol < minCol || toCol > maxCol) {
        return false;
    }

    // 士只能斜线移动一格
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return rowDiff === 1 && colDiff === 1;
}

isValidElephantMove(fromRow, fromCol, toRow, toCol, player) {
    // 象不能过河
    const isRed = player === PLAYERS.RED;
    if (isRed && toRow < 5) return false;
    if (!isRed && toRow > 4) return false;

    // 象走田字
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (rowDiff !== 2 || colDiff !== 2) return false;

    // 检查象眼是否被堵
    const eyeRow = (fromRow + toRow) / 2;
    const eyeCol = (fromCol + toCol) / 2;
    return !this.board[eyeRow][eyeCol];
}

isValidHorseMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // 马走日字
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
        return false;
    }

    // 检查马脚
    let legRow = fromRow;
    let legCol = fromCol;
    if (rowDiff === 2) {
        legRow = fromRow + (toRow > fromRow ? 1 : -1);
    } else {
        legCol = fromCol + (toCol > fromCol ? 1 : -1);
    }

    return !this.board[legRow][legCol];
}

isValidChariotMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    const start = fromRow === toRow ?
        Math.min(fromCol, toCol) + 1 :
        Math.min(fromRow, toRow) + 1;
    const end = fromRow === toRow ?
        Math.max(fromCol, toCol) :
        Math.max(fromRow, toRow);

    // 检查路径上是否有其他棋子
    for (let i = start; i < end; i++) {
        if (fromRow === toRow) {
            if (this.board[fromRow][i]) return false;
        } else {
            if (this.board[i][fromCol]) return false;
        }
    }

    return true;
}

isValidCannonMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    let pieceCount = 0;
    const start = fromRow === toRow ?
        Math.min(fromCol, toCol) + 1 :
        Math.min(fromRow, toRow) + 1;
    const end = fromRow === toRow ?
        Math.max(fromCol, toCol) :
        Math.max(fromRow, toRow);

    // 计算路径上的棋子数
    for (let i = start; i < end; i++) {
        if (fromRow === toRow) {
            if (this.board[fromRow][i]) pieceCount++;
        } else {
            if (this.board[i][fromCol]) pieceCount++;
        }
    }

    // 炮吃子时必须翻过一个棋子
    const targetPiece = this.board[toRow][toCol];
    if (targetPiece) {
        return pieceCount === 1;
    }

    // 不吃子时路径必须为空
    return pieceCount === 0;
}

isValidPawnMove(fromRow, fromCol, toRow, toCol, player) {
    const isRed = player === PLAYERS.RED;
    const forward = isRed ? -1 : 1;

    // 兵只能向前移动
    if (isRed && toRow > fromRow) return false;
    if (!isRed && toRow < fromRow) return false;

    // 未过河只能前进
    if ((isRed && fromRow > 4) || (!isRed && fromRow < 5)) {
        return toCol === fromCol && toRow === fromRow + forward;
    }

    // 过河后可以左右移动
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // 记录移动历史
    this.moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece,
        captured: capturedPiece
    });

    // 更新棋盘
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    this.renderBoard();
}

undoMove() {
    if (this.moveHistory.length === 0) return;

    const lastMove = this.moveHistory.pop();
    const { from, to, piece, captured } = lastMove;

    // 恢复棋盘状态
    this.board[from.row][from.col] = piece;
    this.board[to.row][to.col] = captured;

    // 切换玩家
    this.switchPlayer();
    this.renderBoard();
}

switchPlayer() {
    this.currentPlayer = this.currentPlayer === PLAYERS.RED ? PLAYERS.BLACK : PLAYERS.RED;
    document.getElementById('gameStatus').textContent =
        `${this.currentPlayer === PLAYERS.RED ? '红' : '黑'}方回合`;
}

highlightValidMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return;

    // 高亮选中的棋子
    const selectedPiece = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (selectedPiece) {
        selectedPiece.style.boxShadow = '0 0 15px #ffff00, 0 0 5px #ff0000';
    }

    // 只为特定棋子类型显示移动提示
    const showMoveHints = [
        PIECE_TYPES.KING,
        PIECE_TYPES.ADVISOR,
        PIECE_TYPES.ELEPHANT,
        PIECE_TYPES.HORSE,
        PIECE_TYPES.PAWN
    ].includes(piece.type);

    if (!showMoveHints) return;

    // 创建一个文档片段来存储所有可移动位置的标记
    const fragment = document.createDocumentFragment();
    const validMovePositions = [];

    // 预先计算所有可能的移动位置
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 9; j++) {
            if (this.isValidMove(row, col, i, j)) {
                validMovePositions.push({ row: i, col: j });
            }
        }
    }

    // 批量创建可移动位置标记
    validMovePositions.forEach(({ row: i, col: j }) => {
        const validMove = document.createElement('div');
        validMove.className = 'valid-move';
        validMove.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: rgba(255, 255, 0, 0.3);
                border: 2px solid rgba(255, 255, 0, 0.5);
                left: ${j * 11.11 + 5.555}%;
                top: ${i * 10 + 5}%;
                transform: translate(-50%, -50%);
                pointer-events: none;
            `;
        fragment.appendChild(validMove);
    });

    // 一次性添加所有可移动位置标记
    document.getElementById('chessboard').appendChild(fragment);
}

clearHighlights() {
    // 清除棋子高亮
    const pieces = document.querySelectorAll('.chess-piece');
    pieces.forEach(piece => {
        piece.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    });

    // 清除可移动位置提示
    const validMoves = document.querySelectorAll('.valid-move');
    validMoves.forEach(move => move.remove());
}

renderBoard() {
    const chessboard = document.getElementById('chessboard');
    const existingPieces = new Map();

    // 保存现有棋子的引用
    document.querySelectorAll('.chess-piece').forEach(pieceElement => {
        const row = parseInt(pieceElement.dataset.row);
        const col = parseInt(pieceElement.dataset.col);
        existingPieces.set(`${row},${col}`, pieceElement);
    });

    // 如果棋盘为空，绘制网格
    if (!chessboard.querySelector('svg')) {
        this.drawGrid();
    }

    // 更新棋子
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = this.board[row][col];
            const key = `${row},${col}`;
            const existingPiece = existingPieces.get(key);

            if (piece) {
                if (existingPiece) {
                    // 更新现有棋子
                    existingPieces.delete(key);
                } else {
                    // 创建新棋子
                    this.drawPiece(row, col, piece);
                }
            } else if (existingPiece) {
                // 移除不存在的棋子
                existingPiece.remove();
                existingPieces.delete(key);
            }
        }
    }

    // 移除剩余的不需要的棋子
    existingPieces.forEach(piece => piece.remove());
}

drawGrid() {
    const chessboard = document.getElementById('chessboard');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // 绘制横线
    for (let i = 0; i < 10; i++) {
        const y = (i * 10) + 5;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '5%');
        line.setAttribute('y1', y + '%');
        line.setAttribute('x2', '95%');
        line.setAttribute('y2', y + '%');
        line.setAttribute('stroke', '#8b4513');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }

    // 绘制竖线
    for (let i = 0; i < 9; i++) {
        const x = (i * 11.25) + 5;
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x + '%');
        line.setAttribute('y1', '5%');
        line.setAttribute('x2', x + '%');
        line.setAttribute('y2', '95%');
        line.setAttribute('stroke', '#8b4513');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }

    // 绘制九宫格斜线
    const drawPalaceDiagonals = (startY, endY) => {
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '38.75%');
        line1.setAttribute('y1', startY + '%');
        line1.setAttribute('x2', '61.25%');
        line1.setAttribute('y2', endY + '%');
        line1.setAttribute('stroke', '#8b4513');
        line1.setAttribute('stroke-width', '1');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '61.25%');
        line2.setAttribute('y1', startY + '%');
        line2.setAttribute('x2', '38.75%');
        line2.setAttribute('y2', endY + '%');
        line2.setAttribute('stroke', '#8b4513');
        line2.setAttribute('stroke-width', '1');

        svg.appendChild(line1);
        svg.appendChild(line2);
    };

    // 绘制上方九宫格斜线
    drawPalaceDiagonals(5, 25);
    // 绘制下方九宫格斜线
    drawPalaceDiagonals(75, 95);

    chessboard.appendChild(svg);
}

drawPiece(row, col, piece) {
    const chessboard = document.getElementById('chessboard');
    const pieceElement = document.createElement('div');
    pieceElement.className = 'chess-piece';
    pieceElement.style.position = 'absolute';
    pieceElement.style.width = '11.11%';
    pieceElement.style.height = '10%';
    pieceElement.style.left = (col * 11.11 + 5.555) + '%';
    pieceElement.style.top = (row * 10 + 5) + '%';
    pieceElement.style.transform = 'translate(-50%, -50%)';
    pieceElement.style.borderRadius = '50%';
    const isRed = piece.player === PLAYERS.RED;
    pieceElement.style.background = isRed ? 'radial-gradient(circle at 30% 30%, #d4af37, #8b0000)' : 'radial-gradient(circle at 30% 30%, #1a1a1a, #000000)';
    pieceElement.style.border = `2px solid ${isRed ? '#d4af37' : '#4a4a4a'}`;
    pieceElement.style.display = 'flex';
    pieceElement.style.justifyContent = 'center';
    pieceElement.style.alignItems = 'center';
    pieceElement.style.fontSize = '2vmin';
    pieceElement.style.color = isRed ? '#fff' : '#d4af37';
    pieceElement.style.cursor = 'pointer';
    pieceElement.style.userSelect = 'none';
    pieceElement.style.boxShadow = `0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px ${isRed ? 'rgba(255,255,255,0.3)' : 'rgba(212,175,55,0.2)'}`;

    // 添加位置数据属性
    pieceElement.dataset.row = row;
    pieceElement.dataset.col = col;

    // 设置棋子文字
    const pieceText = this.getPieceText(piece);
    pieceElement.textContent = pieceText;

    chessboard.appendChild(pieceElement);
}

getPieceText(piece) {
    const isRed = piece.player === PLAYERS.RED;
    switch (piece.type) {
        case PIECE_TYPES.KING:
            return isRed ? '帥' : '將';
        case PIECE_TYPES.ADVISOR:
            return isRed ? '仕' : '士';
        case PIECE_TYPES.ELEPHANT:
            return isRed ? '相' : '象';
        case PIECE_TYPES.HORSE:
            return isRed ? '馬' : '馬';
        case PIECE_TYPES.CHARIOT:
            return isRed ? '車' : '車';
        case PIECE_TYPES.CANNON:
            return isRed ? '炮' : '炮';
        case PIECE_TYPES.PAWN:
            return isRed ? '兵' : '卒';
        default:
            return '';
    }
}

checkGameStatus() {
    // 检查是否将军或将死
    const kings = { red: null, black: null };

    // 找到双方的将帅位置
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = this.board[row][col];
            if (piece && piece.type === PIECE_TYPES.KING) {
                kings[piece.player] = { row, col };
            }
        }
    }

    // 检查是否将死
    if (!kings.red || !kings.black) {
        this.state = GAME_STATES.GAME_OVER;
        document.getElementById('gameStatus').textContent =
            `游戏结束 - ${!kings.red ? '黑' : '红'}方胜利！`;
    }
}
}

// 游戏初始化和控制函数
let game = null;

function startGame() {
    game = new ChessGame();
    game.state = GAME_STATES.PLAYING;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    game.renderBoard();
}

function resetGame() {
    game = new ChessGame();
    game.state = GAME_STATES.PLAYING;
    game.renderBoard();
}

function undoMove() {
    if (game) {
        game.undoMove();
    }
}
