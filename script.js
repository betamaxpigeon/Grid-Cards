const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const suits = ["♠","♥","♦","♣"];

let deck = [];
let grid = [];
let currentPlayer = 1;
let hands = {1: [], 2: []};
let selectedCardIndex = null;
let hasDrawn = false;

//document.getElementById("drawBtn").addEventListener("click", drawCard);
window.onload = function() {
    document.getElementById("drawBtn").addEventListener("click", drawCard);
}

//Create Deck
function createDeck() {
    let d = [];
    for (let suit of suits) {
        for (let i = 0; i < ranks.length; i++) {
            d.push({rank: ranks[i], value: i + 1, suit});
        }
    }
    return shuffle(d);
}

//Shuffle Deck
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

//Initialize Grid
function initGrid() {
    const gridEl = document.getElementById("grid");
    gridEl.innerHTML = "";
    grid = [];

    for (let i = 0; i < 32; i++) {
        const card = deck.pop();
        grid.push({ ...card, revealed: false});

        const div = document.createElement("div");
        div.className = "card";
        div.dataset.index = i;

        div.onclick = () => placeCard(i);

        gridEl.appendChild(div);
    }
}

//Render Grid
function renderGrid() {
    const cards = document.querySelectorAll("#grid .card");
    cards.forEach((div, i) => {
        const card = grid[i];
        if (card.revealed) {
            div.classList.add("revealed");
            div.textContent = card.rank + card.suit;
        } else {
            div.classList.remove("revealed");
            div.textContent = "";
        }
    });
}

//Render Hand
function renderHand() {
    const handEl = document.createElement("div");
    handEl.innerHTML = "";
    
    hands[currentPlayer].forEach((card, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = card.rank + card.suit;

        div.onclick = () => {
            selectedCardIndex = index;
            highlightSelection();
        };

        handEl.appendChild(div);
    })
}

function highlightSelection() {
    const cards = document.querySelectorAll("#hand .card");
    cards.forEach((c, i) => {
        c.style.border = i === selectedCardIndex ? "3px solid red" : "1px solid black";
    });
}

//Draw Card
function drawCard() {
    if (hasDrawn) return alert("You already drew this turn!");
    hands[currentPlayer].push(deck.pop());
    hasDrawn = true;
    renderHand();
}

//Place Card
function placeCard(index) {
    if (selectedCardIndex === null) return alert("Select a card first!");
    if (!hasDrawn) return alert("You must  draw first!");
    if (grid[index].revealed) return;

    //Replace hidden card with played card
    grid[index] = {
        ...hands[currentPlayer][selectedCardIndex],
        revealed = true
    };

    hands[currentPlayer].splice(selectedCardIndex, 1);
    selectedCardIndex = null;

    checkPatterns();

    endTurn();
}

//Pattern Check
function checkPatterns() {
    let score = 0;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 7; col++) {
            let i = row * 8 + col;
            let a = grid[i];
            let b = grid[i + 1];

            if (a.revealed && b.revealed && a.rank === b.rank) {
                score++;
            }
        }
    }

    alert(`Player ${currentPlayer} patterns found: ${score}`);
}

//End Turn
function endTurn() {
    hasDrawn = false;

    //Ensure 2 Cards
    while (hands[currentPlayer].length < 2) {
        hands[currentPlayer].push(deck.pop());
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;

    document.getElementById("turn").textContent = `Player ${currentPlayer}'s Turn`;

    renderGrid();
    renderHand();
}

//Start Game
function initGame() {
    deck = createDeck();
    hands[1] = [deck.pop(), deck.pop()];
    hands[2] = [deck.pop(), deck.pop()];

    initGrid();
    renderGrid();
    renderHand();
}

initGame();