const tg = window.Telegram.WebApp;
tg.expand(); tg.enableClosingConfirmation();

const API = "https://zazu-backend-1.onrender.com";

const els = {
  screens: { w: document.getElementById('welcome'), wal: document.getElementById('wallet'), p: document.getElementById('player') },
  greet: document.getElementById('greet'), bal: document.getElementById('bal-val'), vid: document.getElementById('vid'), wm: document.getElementById('wm')
};
let hls = null, userData = null;

function show(key) { Object.values(els.screens).forEach(s => s.classList.remove('active')); els.screens[key].classList.add('active'); }

async function init() {
  const u = tg.initDataUnsafe?.user;
  if (!u) return els.greet.textContent = "⚠️ Please open in Telegram.";
  els.greet.textContent = `Welcome, ${u.first_name || 'Zazu Citizen'}!`;
  
  try {
    const res = await fetch(`${API}/api/user/${u.id}`, { headers: { Authorization: `Bearer ${tg.initData}` } });
    if (res.ok) userData = await res.json();
    els.bal.textContent = (userData?.balance_kobo ? (userData.balance_kobo/100).toFixed(2) : "0.00");
    show('wal');
  } catch (e) { show('w'); }
}

// Make all channel buttons work
document.querySelectorAll('.channel-btn').forEach(btn => {
  btn.onclick = () => {
    const url = btn.getAttribute('data-url');
    if (url) startStream(url);
  };
});

document.getElementById('btn-back').onclick = () => show('w');
document.getElementById('btn-stop').onclick = () => { if(hls) hls.destroy(); hls=null; els.vid.src=''; show('wal'); };

function startStream(streamUrl) {
  show('p');
  const updateWm = () => els.wm.textContent = `ZAZU:${tg.initDataUnsafe.user.id}|${new Date().toLocaleTimeString()} `;
  updateWm(); setInterval(updateWm, 1500);

  const src = streamUrl;
  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker: true, lowLatencyMode: false });
    hls.loadSource(src); hls.attachMedia(els.vid);
    hls.on(Hls.Events.MANIFEST_PARSED, () => els.vid.play().catch(()=>{}));
  } else if (els.vid.canPlayType('application/vnd.apple.mpegurl')) {
    els.vid.src = src; els.vid.play();
  }
}

document.addEventListener('DOMContentLoaded', init);
