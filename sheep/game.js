// 游戏配置
const CARD_TYPES = ['image/jiyi.jpeg', 'image/jiyi2.jpeg', 'image/jiyi3.jpeg', 'image/xiaoba.jpeg', 'image/537.jpg'];

const CARD_TYPES2 = ['image/37.jpg', 'image/lh.jpg', 'image/lh2.jpg', 'image/sgz.jpg', 'image/wq.png', 'image/wq2.jpg'];
const CARDS_PER_LEVEL = 24; // 每关卡片数量（必须是3的倍数）
const MAX_LAYERS = 3; // 最大堆叠层数

// 游戏状态
let gameStarted = false;
let currentLevel = 1;
let cards = [];
let selectedCards = [];
let remainingCards = 0;

// 初始化游戏
function initGame() {
    gameStarted = true;
    currentLevel = 1;
    selectedCards = [];
    generateCards();
    layoutCards();
    updateGameStatus();
}

// 生成卡片
function generateCards() {
    cards = [];
    const cardTypes = [];
    const gameBoard = document.getElementById('gameBoard');
    
    // 确保卡片数量是3的倍数
    for (let i = 0; i < CARDS_PER_LEVEL; i += 3) {
        const type = currentCardTypes[Math.floor(Math.random() * currentCardTypes.length)];
        cardTypes.push(type, type, type);
    }
    
    // 打乱卡片顺序
    for (let i = cardTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardTypes[i], cardTypes[j]] = [cardTypes[j], cardTypes[i]];
    }
    
    // 创建卡片对象
    cardTypes.forEach((type, index) => {
        // 生成随机位置
        const left = 20 + (Math.random() * (gameBoard.clientWidth - 100));
        const top = 20 + (Math.random() * (gameBoard.clientHeight - 100));
        
        cards.push({
            id: index,
            type: type,
            layer: Math.floor(Math.random() * MAX_LAYERS),
            selected: false,
            matched: false,
            left: left,
            top: top
        });
    });
    
    remainingCards = cards.length;
}

// 布局卡片
function layoutCards() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    cards.forEach((card, index) => {
        if (!card.matched) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.style.backgroundImage = `url(${card.type})`;
            cardElement.style.backgroundSize = 'cover';
            cardElement.style.backgroundPosition = 'center';
            cardElement.style.zIndex = card.layer;
            cardElement.setAttribute('data-id', card.id);
            
            cardElement.style.left = `${card.left}px`;
            cardElement.style.top = `${card.top}px`;
            
            if (card.selected) {
                cardElement.classList.add('selected');
            }
            
            cardElement.addEventListener('click', () => handleCardClick(card));
            gameBoard.appendChild(cardElement);
        }
    });
    
    updateSelectedCardsDisplay();
}

// 处理卡片点击
function handleCardClick(card) {
    if (!gameStarted || card.matched) return;
    
    // 检查卡片是否被其他卡片覆盖
    const cardElement = document.querySelector(`div[data-id="${card.id}"]`);
    if (isCardCovered(cardElement)) return;
    
    if (card.selected) {
        // 取消选择
        card.selected = false;
        selectedCards = selectedCards.filter(c => c.id !== card.id);
    } else {
        // 选择卡片
        if (selectedCards.length < 3) {
            card.selected = true;
            selectedCards.push(card);
            
            // 检查是否匹配
            if (selectedCards.length === 3) {
                checkMatch();
            }
        }
    }
    
    layoutCards();
}

// 检查卡片是否被覆盖
function isCardCovered(cardElement) {
    const rect1 = cardElement.getBoundingClientRect();
    const cardLayer = parseInt(cardElement.style.zIndex);
    const cardId = cardElement.getAttribute('data-id');
    
    // 获取所有卡片
    const allCards = document.querySelectorAll('.card');
    
    for (const otherCard of allCards) {
        // 跳过自身和已匹配的卡片
        if (otherCard.getAttribute('data-id') === cardId || 
            cards[parseInt(otherCard.getAttribute('data-id'))].matched) {
            continue;
        }
        
        const rect2 = otherCard.getBoundingClientRect();
        const otherLayer = parseInt(otherCard.style.zIndex);
        
        // 如果另一张卡片在更上层
        if (otherLayer > cardLayer) {
            // 计算重叠区域
            const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
            const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
            const overlapArea = overlapX * overlapY;
            
            // 如果重叠区域超过卡片面积的25%，认为被覆盖
            if (overlapArea > (rect1.width * rect1.height * 0.25)) {
                return true;
            }
        }
    }
    
    return false;
}

// 检查匹配
function checkMatch() {
    if (selectedCards.length === 3) {
        const allSameType = selectedCards.every(card => card.type === selectedCards[0].type);
        
        if (allSameType) {
            // 匹配成功
            selectedCards.forEach(card => {
                card.matched = true;
                remainingCards--;
            });
            
            // 检查是否完成关卡
            if (remainingCards === 0) {
                currentLevel++;
                setTimeout(() => {
                    alert(`恭喜通过第${currentLevel - 1}关！`);
                    generateCards();
                }, 500);
            }
        }
        
        // 重置选择
        selectedCards.forEach(card => card.selected = false);
        selectedCards = [];
    }
    
    updateGameStatus();
}

// 更新选中卡片显示
function updateSelectedCardsDisplay() {
    const slots = document.querySelectorAll('.selected-slot');
    slots.forEach((slot, index) => {
        if (selectedCards[index]) {
            slot.style.backgroundImage = `url(${selectedCards[index].type})`;
            slot.style.backgroundSize = 'cover';
            slot.style.backgroundPosition = 'center';
        } else {
            slot.style.backgroundImage = '';
        }
    });
}

// 更新游戏状态
function updateGameStatus() {
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('remainingCards').textContent = remainingCards;
}

// 当前选择的卡片系列
let currentCardTypes = CARD_TYPES;

// 开始游戏
function startGame(cardTypes) {
    currentCardTypes = cardTypes;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    initGame();
}

// 初始化事件监听
document.getElementById('chiikawaSeries').addEventListener('click', () => startGame(CARD_TYPES));
document.getElementById('friendsSeries').addEventListener('click', () => startGame(CARD_TYPES2));
document.getElementById('backBtn').addEventListener('click', () => {
    // 重置游戏状态
    gameStarted = false;
    currentLevel = 1;
    selectedCards = [];
    cards = [];
    remainingCards = 0;
    
    // 切换界面显示
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
});