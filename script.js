document.getElementById("reset").addEventListener("click", init);
const ROWS = 4;
const COLS = 8;

let grid = [];
let deck = [];
let scores = [0, 0];
let hands = [[], []];
let currentPlayer = 0;
let selectedCardIndex = null;
let scoredPatterns = new Set();

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck() {
    const d = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            d.push({suit, rank});
        });
    });
    return shuffle(d);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateScoreUI() {
    document.getElementById("score").textContent = `P1: ${scores[0]} | P2: ${scores[1]}`;
}

function init() {
    scores = [0, 0];
    hands = [[], []];
    currentPlayer = 0;
    deck = createDeck();

    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

    document.getElementById("reset").textContent = "Reset";

    for (let i = 0; i < 2; i++) {
        drawCard(0);
        drawCard(1);
    }

    renderGrid();
    updateTurnText();
    updateScoreUI();

    startTurn();
}

function startTurn() {
    drawCard(currentPlayer);
    renderHand();
}

function endGame() {
    let winner;

    if (scores[0] > scores[1]) winner = "Player 1 Wins!";
    else if (scores[1] > scores[0]) winner = "Player 2 Wins!";
    else winner = "It's a Tie!"

    alert(
        `Game Over!\n\nP1: ${scores[0]}\nP2: ${scores[1]}\n\n${winner}`
    );
}

function endTurn() {
    currentPlayer = (currentPlayer + 1) % 2;
    updateTurnText();
    startTurn();
}

function isGridFull() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === null) return false;
        }
    }
    return true;
}

function drawCard(player) {
    if (deck.length === 0) return;
    hands[player].push(deck.pop());
}

function renderGrid() {
    const gridEl = document.getElementById("grid");
    gridEl.innerHTML = "";

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const div = document.createElement("div");
            div.className = "card";

            if (grid[r][c]) {
                div.textContent = grid[r][c].rank + grid[r][c].suit;
                div.classList.add("revealed");
            }

            div.onclick = () => onGridClick(r, c);

            gridEl.appendChild(div);
        }
    }
}

function renderHand() {
    const handEl = document.querySelector(".hand");
    handEl.innerHTML = "";

    hands[currentPlayer].forEach((card, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = card.rank + card.suit;

        if (index === selectedCardIndex) {
            div.style.border = "3px solid yellow";
        }

        div.onclick = () => {
            selectedCardIndex = index;
            renderHand();
        };

        handEl.appendChild(div);
    });
}

function onGridClick(r, c) {
    if (selectedCardIndex === null) {
        alert("Select a card first");
        return;
    }

    if (grid[r][c] !== null) return;

    const card = hands[currentPlayer][selectedCardIndex];

    grid[r][c] = card;

    hands[currentPlayer].splice(selectedCardIndex, 1);
    selectedCardIndex = null;

    renderGrid();
    renderHand();

    let points = 0;

    try {
        points = calculateScore();
    } catch(e) {
        console.error("Scoring error:", e);
        alert("Scoring error");
    }
    
    scores[currentPlayer] += points;
    updateScoreUI();

    if (isGridFull()) {
        endGame();
        return;
    }

    endTurn();
}

function updateTurnText() {
    document.getElementById("turn").textContent =
        `Player ${currentPlayer + 1}'s Turn`;
}

function getPatterns() {
    const visited = new Set();
    const patterns = [];

    function key(r, c) {
        return `${r}, ${c}`;
    }

    function neighbors(r, c) {
        return [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
        ];
    }

    function dfs(r, c, group, positions) {
        const k = key(r, c);
        if (visited.has(k)) return;
        if (!grid[r] || !grid[r][c]) return;

        visited.add(k);
        group.push(grid[r][c]);
        positions.push([r, c]);

        neighbors(r, c).forEach(([nr, nc]) => {
            if (grid[nr] && grid[nr][nc]) {
                dfs(nr, nc, group, positions);
            }
        });
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!grid[r][c]) continue;

            const k = key(r, c);
            if (visited.has(k)) continue;

            const group = [];
            const positions = [];

            dfs(r, c, group, positions);

            if (group.length >= 2 && isValidPattern(group)) {
                patterns.push({
                    cards : group,
                    positions : positions
                });
            }
        }
    }

    return patterns;
}

function isValidPattern(cards) {
    const sameSuit = cards.every(c => c.suit === cards[0].suit);
    const sameRank = cards.every(c => c.rank === cards[0].rank);

    if (sameSuit || sameRank) return true;

    const values = cards.map(c => ranks.indexOf(c.rank)).sort((a, b) => a - b);

    for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i - 1] + 1) return false;
    }

    return true;
}

function calculateScore() {
    const patterns = getPatterns();
    let points = 0;

    patterns.forEach(pattern => {
        const signature = pattern.positions
        .map(([r, c]) => `${r}, ${c}`)
        .sort
        .join("|");

        if (!scoredPatterns.has(signature)) {
            scoredPatterns.add(signature);
            points += pattern.cards.length;
        }
    });

    return points;
}