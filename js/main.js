// js/main.js
// ONE FILE. FRONT-END BRAIN FOR ALL PAGES. NO PAYPAL, NO BACKEND YET.

// =========================
// GLOBAL STATE
// =========================
const AppState = {
  user: null,
  prizes: [],
  suggestions: [],
  votes: [],
  donations: [],
  winners: [],
  settings: {
    sound: false,
    animations: true
  }
};

// =========================
// SESSION
// =========================
const Session = {
  load() {
    const data = localStorage.getItem("giveaway_user");
    if (data) AppState.user = JSON.parse(data);
  },
  save(user) {
    AppState.user = user;
    localStorage.setItem("giveaway_user", JSON.stringify(user));
  },
  logout() {
    AppState.user = null;
    localStorage.removeItem("giveaway_user");
  }
};

// =========================
// EVENT BUS
// =========================
const EventBus = {
  events: {},
  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  },
  emit(event, data) {
    if (this.events[event]) this.events[event].forEach(h => h(data));
  }
};

// =========================
// PRIZE ENGINE (FAKE DATA FOR NOW)
// =========================
const PrizeEngine = {
  async loadPrizes() {
    AppState.prizes = [
      { id: 1, name: "AirPods Pro", value: 250, winnerNumber: 10, img: "https://via.placeholder.com/200" },
      { id: 2, name: "PS5 Controller", value: 70, winnerNumber: 20, img: "https://via.placeholder.com/200" },
      { id: 3, name: "Custom Hoodie", value: 60, winnerNumber: 30, img: "https://via.placeholder.com/200" },
      { id: 4, name: "Gift Card $100", value: 100, winnerNumber: 40, img: "https://via.placeholder.com/200" }
    ];
    return AppState.prizes;
  }
};

// =========================
// DONATION ENGINE (NO PAYPAL YET)
// =========================
const DonationEngine = {
  tiers: [10, 20, 30, 40, 50],
  createDonation(tier) {
    const donation = {
      id: Date.now(),
      userId: AppState.user?.id || null,
      amount: tier,
      timestamp: new Date().toISOString()
    };
    AppState.donations.push(donation);
    EventBus.emit("donation:created", donation);
    return donation;
  }
};

// =========================
// ANIMATIONS (CONFETTI, CLOWN, BALLOONS)
// =========================
function burstConfetti() {
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = ['#ffd93b', '#2f6fff', '#7b3cff'][Math.floor(Math.random()*3)];
    piece.style.animationDuration = `${1 + Math.random() * 1}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

function clownPop() {
  const clown = document.createElement('div');
  clown.className = 'clown-pop';
  clown.textContent = ['🤡','🎈','🎉','🎊'][Math.floor(Math.random()*4)];
  clown.style.left = `${10 + Math.random()*70}%`;
  clown.style.fontSize = `${2 + Math.random()*3}rem`;
  clown.style.animationDuration = `${2 + Math.random()*2}s`;
  document.body.appendChild(clown);
  setTimeout(() => clown.remove(), 4000);
}

function spawnBalloon() {
  const balloon = document.createElement('div');
  balloon.className = 'balloon';
  balloon.style.left = `${Math.random() * 90}%`;
  balloon.style.animationDuration = `${6 + Math.random() * 4}s`;
  document.body.appendChild(balloon);
  setTimeout(() => balloon.remove(), 10000);
}

// tie animations to event bus if needed
EventBus.on("confetti", burstConfetti);
EventBus.on("clown", clownPop);
EventBus.on("balloon", spawnBalloon);

// =========================
// PRIZE REEL RENDER
// =========================
async function initPrizeReel() {
  const reel = document.getElementById('prize-reel');
  if (!reel) return;

  await PrizeEngine.loadPrizes();

  reel.innerHTML = AppState.prizes.map(p => `
    <div class="prize-card">
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>Value: $${p.value}</p>
      <p class="winner-number">Winner: #${p.winnerNumber}</p>
    </div>
  `).join('');
}

// =========================
– TIER BUTTONS / DONATION FLOW (NO PAYPAL YET)
// =========================
function initTierButtons() {
  const buttons = document.querySelectorAll('.tier-btn');
  if (!buttons.length) return;

  const entryMessage = document.getElementById('entry-message');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = Number(btn.dataset.tier);
      const donation = DonationEngine.createDonation(tier);

      if (entryMessage) {
        entryMessage.textContent = `Fake donation created for $${tier}. (Real PayPal coming later.)`;
      }

      burstConfetti();
      clownPop();
    });
  });
}

// =========================
// SUGGEST FORM (FRONT-END ONLY)
// =========================
function initSuggestForm() {
  const form = document.getElementById('suggest-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const imageUrl = form.imageUrl.value.trim();

    if (!title || !description) return;

    const suggestion = {
      id: Date.now(),
      title,
      description,
      imageUrl,
      votes: 0
    };

    AppState.suggestions.push(suggestion);
    localStorage.setItem("giveaway_suggestions", JSON.stringify(AppState.suggestions));

    form.reset();
    alert("Suggestion submitted (local only for now).");
    burstConfetti();
  });

  // load existing
  const stored = localStorage.getItem("giveaway_suggestions");
  if (stored) AppState.suggestions = JSON.parse(stored);
}

// =========================
// VOTE PAGE (FRONT-END ONLY)
// =========================
function initVotePage() {
  const list = document.getElementById('suggestions-list');
  if (!list) return;

  const stored = localStorage.getItem("giveaway_suggestions");
  if (stored) AppState.suggestions = JSON.parse(stored);

  if (!AppState.suggestions.length) {
    list.innerHTML = `<p>No suggestions yet. Go suggest something first.</p>`;
    return;
  }

  list.innerHTML = AppState.suggestions.map(s => `
    <div class="card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <button data-id="${s.id}" class="vote-btn">Vote 👍</button>
      <span>${s.votes || 0} votes</span>
    </div>
  `).join('');

  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('vote-btn')) {
      const id = Number(e.target.dataset.id);
      const suggestion = AppState.suggestions.find(s => s.id === id);
      if (!suggestion) return;
      suggestion.votes = (suggestion.votes || 0) + 1;
      localStorage.setItem("giveaway_suggestions", JSON.stringify(AppState.suggestions));
      burstConfetti();
      clownPop();
      initVotePage(); // re-render
    }
  });
}

// =========================
// ACCOUNT PAGE PLACEHOLDER
// =========================
function initAccountPage() {
  const donationsList = document.getElementById('my-donations');
  const winsList = document.getElementById('my-wins');
  const badgesRow = document.getElementById('my-badges');

  if (donationsList) {
    donationsList.innerHTML = AppState.donations.length
      ? AppState.donations.map(d => `<li>$${d.amount} on ${new Date(d.timestamp).toLocaleString()}</li>`).join('')
      : `<li>No donations yet.</li>`;
  }

  if (winsList) {
    winsList.innerHTML = `<li>No wins yet. (Logic comes when backend is wired.)</li>`;
  }

  if (badgesRow) {
    badgesRow.innerHTML = `<span class="badge badge-placeholder">Badges coming soon</span>`;
  }
}

// =========================
// WINNERS PAGE PLACEHOLDER
// =========================
function initWinnersPage() {
  const winnersList = document.getElementById('winners-list');
  if (!winnersList) return;

  winnersList.innerHTML = `
    <article class="card">
      <h2>No Winners Yet</h2>
      <p>Once the first prize is won, they’ll appear here with confetti and clowns 🤡🎉</p>
    </article>
  `;
}

// =========================
// SERVICE WORKER
// =========================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.error('SW registration failed', err);
    });
  });
}

// =========================
// PAGE INIT ROUTER
// =========================
function initPage() {
  Session.load();

  const path = window.location.pathname.split('/').pop() || 'index.html';

  // global ambient animations
  setInterval(spawnBalloon, 4000);
  setInterval(clownPop, 15000);

  if (path === 'index.html' || path === '') {
    initPrizeReel();
  }

  if (path === 'app.html') {
    initTierButtons();
  }

  if (path === 'suggest.html') {
    initSuggestForm();
  }

  if (path === 'vote.html') {
    initVotePage();
  }

  if (path === 'account.html') {
    initAccountPage();
  }

  if (path === 'winners.html') {
    initWinnersPage();
  }
}

document.addEventListener('DOMContentLoaded', initPage);
