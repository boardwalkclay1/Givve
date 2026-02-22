// js/main.js
// ONE FILE: prize reel + PayPal tiers + real donation call

const API_BASE = '/api';
let selectedTier = null;

// ----------------------
// PRIZE REEL (index.html)
// ----------------------
async function initPrizeReel() {
  const reel = document.getElementById('prize-reel');
  if (!reel) return;

  try {
    const res = await fetch(`${API_BASE}/prizes`);
    const prizes = await res.json();

    if (!Array.isArray(prizes) || !prizes.length) {
      reel.innerHTML = `<p>No prizes loaded yet.</p>`;
      return;
    }

    reel.innerHTML = prizes.map(p => `
      <div class="prize-card ${p.status === 'won' ? 'prize-card--won' : ''}">
        <img src="${p.imageUrl || 'https://via.placeholder.com/200'}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p class="prize-value">Value: $${p.value}</p>
        <p class="winner-number">🎯 Winner: donor #${p.winnerNumber || p.winner_number}</p>
        ${p.status === 'won'
          ? `<p class="prize-won">Already Won 🎉</p>`
          : `<div class="prize-shop-links">
               <a href="${p.amazonUrl}" target="_blank" rel="noopener noreferrer" class="shop-btn shop-btn--amazon">🛒 Amazon</a>
               <a href="${p.walmartUrl}" target="_blank" rel="noopener noreferrer" class="shop-btn shop-btn--walmart">🛍️ Walmart</a>
             </div>`
        }
      </div>
    `).join('');

    // Pass prizes to the floating background renderer.
    initFloatingPrizes(prizes);
  } catch (err) {
    console.error(err);
    reel.innerHTML = `<p>Error loading prizes.</p>`;
  }
}

// ----------------------
// FLOATING BACKGROUND PRIZES
// ----------------------
const FLOAT_COUNT = 18;

function initFloatingPrizes(prizes) {
  const layer = document.getElementById('confetti-layer');
  if (!layer || !prizes.length) return;

  const emojis = ['🎁', '🏆', '🎀', '⭐', '🎊', '🎈', '💝', '🌟'];

  for (let i = 0; i < FLOAT_COUNT; i++) {
    const el = document.createElement('span');
    el.className = 'prize-float';
    el.textContent = emojis[i % emojis.length];
    el.style.left = `${Math.random() * 96}%`;
    el.style.animationDuration = `${8 + Math.random() * 14}s`;
    el.style.animationDelay = `${Math.random() * 10}s`;
    el.style.fontSize = `${1.2 + Math.random() * 1.8}rem`;
    layer.appendChild(el);
  }
}

// ----------------------
// PAYPAL + TIERS (app.html)
// ----------------------
function initTierButtons() {
  const buttons = document.querySelectorAll('.tier-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('tier-btn--active'));
      btn.classList.add('tier-btn--active');
      selectedTier = Number(btn.dataset.tier);
      renderPayPalButton();
      const msg = document.getElementById('entry-message');
      if (msg) msg.textContent = `You selected the $${selectedTier} tier. Complete payment below.`;
    });
  });
}

function renderPayPalButton() {
  const container = document.getElementById("paypal-button-container");
  if (!container || typeof paypal === 'undefined') return;

  container.innerHTML = "";

  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: { value: String(selectedTier) }
        }]
      });
    },

    onApprove: async (data, actions) => {
      const details = await actions.order.capture();
      const paymentId = details.id;

      try {
        const res = await fetch(`${API_BASE}/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: window.currentUserId || null,
            amount: selectedTier,
            tier: selectedTier,
            paymentId
          })
        });

        const result = await res.json();
        const msg = document.getElementById('entry-message');

        if (!res.ok) {
          if (msg) msg.textContent = `Error: ${result.error || 'Donation failed.'}`;
          return;
        }

        if (result.isWinner && result.prize) {
          if (msg) {
            msg.innerHTML = `🏆 <strong>WINNER!</strong> You are donor #${result.donation.globalDonationIndex} and you won: <em>${result.prize.name}</em>!<br>
              <a href="${result.prize.amazonUrl}" target="_blank" rel="noopener noreferrer" class="shop-btn shop-btn--amazon">🛒 View on Amazon</a>
              <a href="${result.prize.walmartUrl}" target="_blank" rel="noopener noreferrer" class="shop-btn shop-btn--walmart">🛍️ View on Walmart</a>`;
          }
          burstConfetti();
        } else {
          if (msg) {
            msg.textContent = `Donation complete! You are donor #${result.donation.globalDonationIndex}. Keep donating — you could be next! 🎉`;
          }
        }
      } catch (err) {
        console.error(err);
        const msg = document.getElementById('entry-message');
        if (msg) msg.textContent = 'Error sending donation to server.';
      }
    }
  }).render('#paypal-button-container');
}

// ----------------------
// SIMPLE CONFETTI
// ----------------------
function burstConfetti() {
  const layer = document.getElementById('confetti-layer') || document.body;
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = ['#ffd93b', '#2f6fff', '#7b3cff'][Math.floor(Math.random()*3)];
    piece.style.animationDuration = `${1 + Math.random() * 1}s`;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

// ----------------------
// PAGE ROUTER
// ----------------------
function initPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  if (path === 'index.html' || path === '') {
    initPrizeReel();
  }

  if (path === 'app.html') {
    initTierButtons();
  }
}

document.addEventListener('DOMContentLoaded', initPage);
