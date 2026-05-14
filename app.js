const tg = window.Telegram.WebApp;
tg.expand(); tg.enableClosingConfirmation();

const API = "https://zazu-backend-1.onrender.com";

const els = {
  wallet: document.getElementById('wallet'),
  player: document.getElementById('player'),
  bal: document.getElementById('bal-val'),
  vid: document.getElementById('vid'),
  wm: document.getElementById('wm')
};
let hls = null, userData = null;

// Show wallet immediately
async function init() {
  const u = tg.initDataUnsafe?.user;
  if (!u) {
    els.bal.textContent = "0.00";
    return;
  }
  try {
    const res = await fetch(`${API}/api/user/${u.id}`, { headers: { Authorization: `Bearer ${tg.initData}` } });
    if (res.ok) {
      userData = await res.json();
      els.bal.textContent = (userData?.balance_kobo ? (userData.balance_kobo/100).toFixed(2) : "0.00");
    }
  } catch (e) {}
}
init();

function startStream(url) {
  els.wallet.classList.add('hidden');
  els.player.classList.remove('hidden');
  const updateWm = () => els.wm.textContent = `ZAZU:${tg.initDataUnsafe.user.id}|${new Date().toLocaleTimeString()} `;
  updateWm(); setInterval(updateWm, 1500);

  if (url.endsWith('.mp4')) {
    els.vid.src = url;
    els.vid.play().catch(()=>{});
    return;
  }
  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker: true });
    hls.loadSource(url); hls.attachMedia(els.vid);
    hls.on(Hls.Events.MANIFEST_PARSED, () => els.vid.play().catch(()=>{}));
  } else if (els.vid.canPlayType('application/vnd.apple.mpegurl')) {
    els.vid.src = url; els.vid.play();
  }
}

document.getElementById('btn-play-bunny').onclick = () => startStream('https://www.w3schools.com/html/mov_bbb.mp4');
document.getElementById('btn-play-aljazeera').onclick = () => startStream('https://live-hls-web-aje.getaj.net/AJE/index.m3u8');
document.getElementById('btn-stop').onclick = () => {
  if(hls) hls.destroy(); hls=null; els.vid.src='';
  els.wallet.classList.remove('hidden');
  els.player.classList.add('hidden');
};
