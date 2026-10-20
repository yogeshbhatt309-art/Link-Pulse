
"use strict";

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

function isValidAlias(alias) {
  return /^[a-zA-Z0-9_-]{1,30}$/.test(alias);
}

function resetResult() {
  resultBox.hidden = true;
  qrWrap.hidden = true;
  shortLink.textContent = "";
  shortLink.removeAttribute("href");
  qrImage.removeAttribute("src");
}

async function shortenUrl() {
  const url = longUrlInput.value.trim();
  const alias = customAliasInput.value.trim();

  resetResult();
  setStatus("");

  if (!url) {
    setStatus("Please enter the URL you want to shorten.");
    longUrlInput.focus();
    return;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    setStatus("Enter a valid URL starting with https:// or http://");
    longUrlInput.focus();
    return;
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    setStatus("Only valid HTTP and HTTPS URLs are allowed.");
    return;
  }

  if (alias && !isValidAlias(alias)) {
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
      body: JSON.stringify({ url: parsedUrl.href, alias })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data && data.error
          ? data.error
          : `Server error (${response.status}). Please try again.`
      );
    }

    if (!data || typeof data.shorturl !== "string") {
      throw new Error(
        "Server response mein shorturl nahi mila. Cloudflare Worker check karo."
      );
    }

    let generatedUrl;

    try {
      generatedUrl = new URL(data.shorturl);
    } catch {
      throw new Error("Server ne invalid short URL return kiya.");
    }

    if (!["http:", "https:"].includes(generatedUrl.protocol)) {
      throw new Error("Server ne invalid short URL return kiya.");
    }

    // Show the real URL returned by the Worker.
    shortLink.href = generatedUrl.href;
    shortLink.textContent = generatedUrl.href;
    resultBox.hidden = false;

    if (qrOption.checked) {
      qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(generatedUrl.href);

      qrWrap.hidden = false;
    }

    setStatus("Your short link is ready!");

    resultBox.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    console.error("Link-Pulse error:", error);

    if (error instanceof TypeError) {
      setStatus(
        "Server se connect nahi ho pa raha. Worker URL, CORS aur internet check karo."
      );
    } else {
      setStatus(error.message || "Something went wrong. Please try again.");
    }
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

qrOption.addEventListener("change", () => {
  if (!qrOption.checked) {
    qrWrap.hidden = true;
    return;
  }

  if (shortLink.href && shortLink.textContent) {
    qrImage.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
      encodeURIComponent(shortLink.href);

    qrWrap.hidden = false;
  }
});

copyBtn.addEventListener("click", async () => {
  const value = shortLink.href;

  if (!value || !shortLink.textContent) {
    setStatus("Pehle short URL generate karo.");
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    copyBtn.textContent = "Copied!";
    setStatus("Short link copied!");

    setTimeout(() => {
      copyBtn.textContent = "Copy link";
    }, 1600);
  } catch {
    setStatus(
      "Copy nahi ho paya. Short URL ko manually select karke copy karo."
    );
  }
});

openLinkBtn.addEventListener("click", () => {
  if (shortLink.href && shortLink.textContent) {
    window.open(shortLink.href, "_blank", "noopener,noreferrer");
  }
});
            
