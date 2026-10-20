
const input = document.getElementById('longUrl');
const shortenBtn = document.getElementById('shortenBtn');
const statusEl = document.getElementById('status');
const result = document.getElementById('result');
const shortLink = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const qrOption = document.getElementById('qrOption');
const qrWrap = document.getElementById('qrWrap');
const qrImage = document.getElementById('qrImage');

const API_ENDPOINT =
  'https://linkpulse-api.yogeshbhatt309.workers.dev/api/shorten';

function showStatus(message, isError = true) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ffb4b4' : '#7de2bf';
}

function validUrl(value) {
  try {
    const u = new URL(value);
    return (
      (u.protocol === 'http:' || u.protocol === 'https:') &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}

async function shorten() {
  const url = input.value.trim();

  result.classList.add('hidden');
  qrWrap.classList.add('hidden');
  shortLink.removeAttribute('href');

  if (!url) {
    showStatus('Please paste a URL first.');
    return;
  }

  if (!validUrl(url)) {
    showStatus(
      'Enter a valid URL beginning with https:// or http://'
    );
    return;
  }

  shortenBtn.disabled = true;
  shortenBtn.textContent = 'Shortening…';

  showStatus('Creating your short link. Please wait.', false);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        'Backend returned an invalid response. Check your Worker code.'
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || `Server error: ${response.status}`
      );
    }

    if (!data.shorturl) {
      throw new Error(
        data.error || 'The backend did not return a short URL.'
      );
    }

    shortLink.href = data.shorturl;
    shortLink.textContent = data.shorturl;

    result.classList.remove('hidden');

    if (qrOption.checked) {
      qrImage.src =
        'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
        encodeURIComponent(data.shorturl);

      qrWrap.classList.remove('hidden');
    }

    showStatus('Your short link is ready!', false);

  } catch (err) {
    console.error('URL shortening error:', err);

    if (err instanceof TypeError) {
      showStatus(
        'Cannot connect to the backend. Check the Worker URL, CORS settings and deployment.'
      );
    } else {
      showStatus(
        err.message || 'Could not create your short link. Please try again.'
      );
    }

  } finally {
    shortenBtn.disabled = false;
    shortenBtn.innerHTML = 'Shorten link <span>→</span>';
  }
}

shortenBtn.addEventListener('click', shorten);

input.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    shorten();
  }
});

qrOption.addEventListener('change', () => {
  if (!qrOption.checked) {
    qrWrap.classList.add('hidden');
    return;
  }

  if (
    !result.classList.contains('hidden') &&
    shortLink.href
  ) {
    qrImage.src =
      'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
      encodeURIComponent(shortLink.href);

    qrWrap.classList.remove('hidden');
  }
});

copyBtn.addEventListener('click', async () => {
  if (!shortLink.href) return;

  try {
    await navigator.clipboard.writeText(shortLink.href);

    copyBtn.textContent = 'Copied ✓';

    setTimeout(() => {
      copyBtn.textContent = 'Copy link';
    }, 1500);

  } catch {
    const range = document.createRange();
    range.selectNodeContents(shortLink);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    showStatus(
      'Select the short link and copy it manually.',
      false
    );
  }
});

document.getElementById('menuBtn').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});
