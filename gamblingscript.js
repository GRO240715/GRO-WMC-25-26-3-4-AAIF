const geldCounter = document.getElementById('geld-counter');
const startBlackjackButton = document.getElementById('startblackjack');
const handRow = document.getElementById('hand-row');
const actionButtons = document.getElementById('action-buttons');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerSumEl = document.getElementById('dealer-sum');
const playerSumEl = document.getElementById('player-sum');
let geld = 0;
let playerCards = [];
let dealerCards = [];

function updategeldCounter() {
    if (!geldCounter) return;
    geldCounter.textContent = `geld: ${geld}`;
}

function randomCard() {
    return Math.floor(Math.random() * 9) + 2;
}

function handSum(cards) {
    return cards.reduce((sum, card) => sum + card, 0);
}

function renderHand(cards, listElement, sumElement) {
    if (!listElement || !sumElement) return;
    listElement.innerHTML = '';
    cards.forEach((card, index) => {
        const item = document.createElement('div');
        item.textContent = `${index + 1}. Karte: ${card}`;
        listElement.appendChild(item);
    });
    sumElement.textContent = `Summe: ${handSum(cards)}`;
}

function setActionButtonsEnabled(enabled) {
    if (hitButton) hitButton.disabled = !enabled;
    if (standButton) standButton.disabled = !enabled;
}

function resetGameScreen() {
    if (!handRow || !actionButtons || !startBlackjackButton) return;
    handRow.style.display = 'none';
    actionButtons.style.display = 'none';
    handRow.classList.add('hidden');
    actionButtons.classList.add('hidden');
    startBlackjackButton.style.display = 'inline-block';
    startBlackjackButton.textContent = '50 Geld zum spiel starten';
    playerCards = [];
    dealerCards = [];
    setActionButtonsEnabled(true);
}

function endRound(win) {
    if (!dealerCardsEl || !playerCardsEl) return;
    if (win) {
        geld += 100;
        updategeldCounter();
    }
    setActionButtonsEnabled(false);
    const color = win ? 'rgba(0, 170, 0, 0.25)' : 'rgba(170, 0, 0, 0.25)';
    dealerCardsEl.style.backgroundColor = color;
    playerCardsEl.style.backgroundColor = color;

    setTimeout(() => {
        dealerCardsEl.style.backgroundColor = '';
        playerCardsEl.style.backgroundColor = '';
        resetGameScreen();
    }, 1200);
}

function checkPlayerBust() {
    const sum = handSum(playerCards);
    if (sum > 21) {
        endRound(false);
        return true;
    }
    return false;
}

function checkDealerResult() {
    const playerSum = handSum(playerCards);
    let dealerSum = handSum(dealerCards);
    while (dealerSum < 17) {
        dealerCards.push(randomCard());
        dealerSum = handSum(dealerCards);
    }
    renderHand(dealerCards, dealerCardsEl, dealerSumEl);
    if (dealerSum > 21 || playerSum > dealerSum) {
        endRound(true);
    } else {
        endRound(false);
    }
}

function showBlackjackHands() {
    if (!handRow || !actionButtons || !dealerCardsEl || !playerCardsEl) return;
    playerCards = [randomCard(), randomCard()];
    dealerCards = [randomCard(), randomCard()];
    renderHand(playerCards, playerCardsEl, playerSumEl);
    renderHand(dealerCards, dealerCardsEl, dealerSumEl);

    handRow.classList.remove('hidden');
    handRow.style.display = 'flex';
    actionButtons.classList.remove('hidden');
    actionButtons.style.display = 'flex';
}

function setupBlackjackButton() {
    if (!startBlackjackButton) return;
    startBlackjackButton.addEventListener('click', () => {
        if (geld < 50) {
            startBlackjackButton.textContent = 'Noch nicht genug Geld';
            startBlackjackButton.disabled = true;
            setTimeout(() => {
                startBlackjackButton.disabled = false;
                startBlackjackButton.textContent = '50 Geld zum spiel starten';
            }, 1200);
            return;
        }

        geld -= 50;
        updategeldCounter();
        startBlackjackButton.style.display = 'none';
        showBlackjackHands();
    });
}

function setupActionButtons() {
    if (hitButton) {
        hitButton.addEventListener('click', () => {
            playerCards.push(randomCard());
            renderHand(playerCards, playerCardsEl, playerSumEl);
            checkPlayerBust();
        });
    }
    if (standButton) {
        standButton.addEventListener('click', () => {
            checkDealerResult();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updategeldCounter();
    setupBlackjackButton();
    setupActionButtons();
    resetGameScreen();
    setInterval(() => {
        geld += 1;
        updategeldCounter();
    }, 1000);
});


