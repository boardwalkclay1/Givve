// js/main.js
// ONE FILE: prize reel + PayPal tiers + real donation call

// IMPORTANT: point this to your Express backend on Railway
const API_BASE = 'https://<your-express-backend>.up.railway.app/api';

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
      <div class="prize-card">
        <img src="${p.image || 'https://via.placeholder.com/200'}" alt="${p.title}" />
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <p>Trigger: #${p.triggerNumber}</p>
        <p>Status: ${p.status}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    reel.innerHTML = `<p>Error loading prizes.</p>`;
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
            amount: selectedTier,
            paymentId
          })
        });

        const result = await res.json();
        const msg = document.getElementById('entry-message');

        if (!res.ok) {
          if (msg) msg.textContent = `Error: ${result.error || 'Donation failed.'}`;
          return;
        }

        msg.textContent = `Donation complete. You are donor #${result.donorCount}.`;

        burstConfetti();
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
