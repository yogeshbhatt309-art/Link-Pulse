
const API_ENDPOINT =
  "https://linkpulse-api.yogeshbhatt309.workers.dev/api/shorten";

const longUrlInput = document.getElementById("longUrl");
const customAliasInput = document.getElementById("customAlias");
const shortenBtn = document.getElementById("shortenBtn");
const qrOption = document.getElementById("qrOption");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");
const shortLink = document.getElementById("shortLink");
const copyBtn = document.getElementById("copyBtn");
const openLinkBtn = document.getElementById("openLinkBtn");
const qrWrap = document.getElementById("qrWrap");
const qrImage = document.getElementById("qrImage");

function setStatus(message) {
  statusBox.textContent = message;
}

function validAlias(alias) {
  return /^[a-zA-Z0-9_-]{1,30}$/.test(alias);
}

async function shortenUrl() {
  const url = longUrlInput.value.trim();
  const alias = customAliasInput.value.trim();

  resultBox.hidden = true;
  qrWrap.hidden = true;
  setStatus("");

  if (!url) {
    setStatus("Please enter the URL you want to shorten.");
    longUrlInput.focus();
    return;
  }

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setStatus("Only HTTP and HTTPS URLs are allowed.");
      return;
    }
  } catch {
    setStatus("Please enter a valid URL, including https://");
    return;
  }

  if (alias && !validAlias(alias)) {
    setStatus(
      "Alias mein sirf letters, numbers, hyphen (-) aur underscore (_) use karo."
    );
    customAliasInput.focus();
    return;
  }

  shortenBtn.disabled = true;
  shortenBtn.textContent = "Creating...";

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        alias
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Could not shorten this URL.");
    }

    if (!data.shorturl) {
      throw new Error("The server did not return a shortened URL.");
    }

    shortLink.href = data.shorturl;
    shortLink.textContent = data.shorturl;
    resultBox.hidden = false;

    if (qrOption.checked) {
      qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(data.shorturl);

      qrWrap.hidden = false;
    }

    setStatus("Your short link is ready!");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.");
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = "Shorten URL";
  }
}

shortenBtn.addEventListener("click", shortenUrl);

longUrlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") shortenUrl();
});

customAliasInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") shortenUrl();
});

copyBtn.addEventListener("click", async () => {
  const value = shortLink.href;

  try {
    await navigator.clipboard.writeText(value);
    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy link";
    }, 1600);
  } catch {
    setStatus("Copy nahi ho paya. Link ko manually select karke copy karo.");
  }
});

openLinkBtn.addEventListener("click", () => {
  window.open(shortLink.href, "_blank", "noopener,noreferrer");
});
      
