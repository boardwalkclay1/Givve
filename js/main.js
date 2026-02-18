// Prize reel animation engine
export function initPrizeReel() {
  const reel = document.getElementById('prize-reel');
  if (!reel) return;

  reel.classList.add('reel-animate');

  // Fake placeholder items until backend is wired
  const samplePrizes = [
    { name: "AirPods Pro", value: 250, img: "https://via.placeholder.com/200" },
    { name: "PS5 Controller", value: 70, img: "https://via.placeholder.com/200" },
    { name: "Custom Hoodie", value: 60, img: "https://via.placeholder.com/200" },
    { name: "Gift Card $100", value: 100, img: "https://via.placeholder.com/200" }
  ];

  reel.innerHTML = samplePrizes.map(p => `
    <div class="prize-card glass-card">
      <img src="${p.img}" />
      <h3>${p.name}</h3>
      <p>Value: $${p.value}</p>
    </div>
  `).join('');
}

initPrizeReel();
