const input = document.getElementById('longUrl');
const shortenBtn = document.getElementById('shortenBtn');
const statusEl = document.getElementById('status');
const result = document.getElementById('result');
const shortLink = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const qrOption = document.getElementById('qrOption');
const qrWrap = document.getElementById('qrWrap');
const qrImage = document.getElementById('qrImage');

function showStatus(message, isError = true) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ffb4b4' : '#7de2bf';
}
function validUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}
async function shorten() {
  const url = input.value.trim();
  result.classList.add('hidden');
  qrWrap.classList.add('hidden');
  if (!url) return showStatus('Please paste a URL first.');
  if (!validUrl(url)) return showStatus('Enter a valid URL beginning with https:// or http://');
  shortenBtn.disabled = true;
  shortenBtn.textContent = 'Shortening…';
  showStatus('Creating your short link. Please wait.', false);
  try {
    // Public endpoint from is.gd. Availability and browser CORS policy may vary.
    const endpoint = 'https://linkpulse-api.yogeshbhatt309.workers.dev/api/shorten';

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ url })
});

const data = await response.json();

if (!response.ok || !data.shorturl) {
  throw new Error(data.error || 'Could not shorten URL');
}
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('The shortening service did not respond.');
    const data = await response.json();
    if (!data.shorturl) throw new Error(data.errormessage || 'Could not shorten this URL. Try another link.');
    shortLink.href = data.shorturl;
    shortLink.textContent = data.shorturl;
    result.classList.remove('hidden');
    if (qrOption.checked) {
      qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(data.shorturl);
      qrWrap.classList.remove('hidden');
    }
    showStatus('Your short link is ready!', false);
  } catch (err) {
    showStatus('Could not create a link from this browser. The public API may be unavailable or block this request. For a reliable production launch, connect a backend API.');
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.innerHTML = 'Shorten link <span>→</span>';
  }
}
shortenBtn.addEventListener('click', shorten);
input.addEventListener('keydown', e => { if (e.key === 'Enter') shorten(); });
qrOption.addEventListener('change', () => {
  if (!qrOption.checked) qrWrap.classList.add('hidden');
  else if (!result.classList.contains('hidden') && shortLink.href) {
    qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(shortLink.href);
    qrWrap.classList.remove('hidden');
  }
});
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shortLink.href);
    copyBtn.textContent = 'Copied ✓';
    setTimeout(() => copyBtn.textContent = 'Copy link', 1500);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(shortLink);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    showStatus('Select and copy the link manually.', false);
  }
});
document.getElementById('menuBtn').addEventListener('click', () => document.querySelector('.nav-links').classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.querySelector('.nav-links').classList.remove('open')));
