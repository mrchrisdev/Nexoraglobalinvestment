const assetBtn = document.getElementById("assetBtn");
const assetMenu = document.getElementById("assetMenu");
const assetName = document.getElementById("assetName");
const assetCode = document.getElementById("assetCode");
const amountCode = document.getElementById("amountCode");
const networkAsset = document.getElementById("networkAsset");
const copyBtn = document.getElementById("copyBtn");
const address = document.getElementById("depositAddress");
const status = document.getElementById("status");
const networkSelect = document.getElementById("network");
const depositForm = document.getElementById("depositForm");
const amountInput = document.getElementById("amount");

const assetOptions = {
  btc: { name: "Bitcoin", code: "BTC", symbol: "₿", network: "Bitcoin", address: "bc1q7x9m2demo8k3w4n6p0q" },
  eth: { name: "Ethereum", code: "ETH", symbol: "Ξ", network: "Ethereum (ERC20)", address: "0x7F3b9B287b6A6c4d1A4f872A7FA72ed3c6dD49e5" },
  ltc: { name: "Litecoin", code: "LTC", symbol: "Ł", network: "Litecoin", address: "LQ5sE8YkK9imw9T4b7D8mN3Qg8W9n8UdD7" },
  doge: { name: "Dogecoin", code: "DOGE", symbol: "Ð", network: "Dogecoin", address: "D9mXh3X5fH4x5pVvFBz7q8Nd2F8QHbNnWQ" },
  usdt: { name: "Tether", code: "USDT", symbol: "$", network: "Tron (TRC20)", address: "TQfRzZg5xvaG8V4mTqB2n7V8fR8pVx4fSj" },
  usdc: { name: "USD Coin", code: "USDC", symbol: "$", network: "BNB Smart Chain (BEP20)", address: "0x4E7dE3A72dA4B651480a36D5F5d11D5a9C4A7c30" }
};

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return value && typeof value === 'object' ? value : fallback;
  } catch {
    return fallback;
  }
}

function applyTheme() {
  document.body.classList.toggle('dark-theme', localStorage.getItem('currentTheme') === 'dark-theme');
}

function getDepositAddresses() {
  return {
    btc: 'bc1q7x9m2demo8k3w4n6p0q',
    eth: '0x7F3b9B287b6A6c4d1A4f872A7FA72ed3c6dD49e5',
    ltc: 'LQ5sE8YkK9imw9T4b7D8mN3Qg8W9n8UdD7',
    doge: 'D9mXh3X5fH4x5pVvFBz7q8Nd2F8QHbNnWQ',
    usdt: 'TQfRzZg5xvaG8V4mTqB2n7V8fR8pVx4fSj',
    usdc: '0x4E7dE3A72dA4B651480a36D5F5d11D5a9C4A7c30',
    ...readJson('investDepositAddresses', {})
  };
}

function getCurrentUserAccount() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("investCurrentUser") || "null");
    const users = JSON.parse(localStorage.getItem("investUsers") || "[]");
    if (!currentUser?.email) return null;
    return users.find((user) => user.email === currentUser.email) || null;
  } catch {
    return null;
  }
}

function setStatus(message, isError = false) {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("show", true);
  status.classList.toggle("error", isError);
}

function getSelectedAssetKey() {
  const asset = new URLSearchParams(window.location.search).get("asset") || "btc";
  return assetOptions[asset] ? asset : "btc";
}

function updateSelectedAsset(assetKey) {
  const asset = assetOptions[assetKey] || assetOptions.btc;
  if (!assetName || !assetCode || !amountCode || !networkAsset || !address || !assetBtn) return;

  const depositAddresses = getDepositAddresses();
  assetName.textContent = asset.name;
  assetCode.textContent = asset.code;
  amountCode.textContent = asset.code;
  networkAsset.textContent = asset.code;
  address.textContent = depositAddresses[assetKey] || asset.address;

  if (assetBtn.querySelector(".coin")) {
    assetBtn.querySelector(".coin").textContent = asset.symbol;
  }

  const selectedNetwork = networkSelect?.value || "Bitcoin";
  if (selectedNetwork.includes("Ethereum") || selectedNetwork.includes("Tron") || selectedNetwork.includes("BNB")) {
    networkAsset.textContent = asset.code;
  }
}

function storeDepositRequest(amount, assetKey) {
  const account = getCurrentUserAccount();
  if (!account) {
    setStatus("Please log in to submit a deposit request.", true);
    return false;
  }

  account.requests = Array.isArray(account.requests) ? account.requests : [];
  const asset = assetOptions[assetKey] || assetOptions.btc;
  const alreadyPending = account.requests.some((request) => request.type === "deposit" && request.status === "pending" && request.details.coin === asset.code);
  if (alreadyPending) {
    setStatus(`There is already a pending ${asset.code} deposit request.`, true);
    return false;
  }

  const request = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: "deposit",
    details: {
      coin: asset.code,
      amount,
      network: networkSelect?.value || asset.network,
      address: (address?.textContent || '').trim()
    },
    status: "pending",
    createdAt: new Date().toISOString(),
    userEmail: account.email,
    userName: account.name || 'User'
  };

  account.requests.push(request);

  const users = JSON.parse(localStorage.getItem("investUsers") || "[]");
  const userIndex = users.findIndex((user) => user.email === account.email);
  if (userIndex !== -1) {
    users[userIndex] = account;
    localStorage.setItem("investUsers", JSON.stringify(users));
  }

  const allRequests = readJson('investRequests', []);
  allRequests.push(request);
  localStorage.setItem('investRequests', JSON.stringify(allRequests));

  return true;
}

if (assetBtn) {
  assetBtn.onclick = () => {
    assetMenu?.classList.toggle("open");
  };
}

if (document.querySelectorAll) {
  document.querySelectorAll("#assetMenu button").forEach((btn) => {
    btn.onclick = () => {
      const assetNameValue = btn.dataset.name || '';
      const nextAsset = Object.keys(assetOptions).find((key) => assetOptions[key].name === assetNameValue) || getSelectedAssetKey();
      updateSelectedAsset(nextAsset);
      assetMenu?.classList.remove("open");
      const search = new URLSearchParams(window.location.search);
      search.set("asset", nextAsset);
      const nextUrl = `${window.location.pathname}?${search.toString()}`;
      window.history.replaceState({}, "", nextUrl);
    };
  });
}

networkSelect?.addEventListener("change", () => {
  const assetKey = getSelectedAssetKey();
  const asset = assetOptions[assetKey] || assetOptions.btc;
  networkAsset.textContent = asset.code;
});

copyBtn?.addEventListener("click", async () => {
  const value = (address?.textContent || "").trim();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const temp = document.createElement("textarea");
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  } catch {
    setStatus("Copy failed. Please copy the address manually.", true);
  }
});

depositForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(amountInput?.value || "");

  if (!Number.isFinite(amount) || amount <= 0) {
    setStatus("Enter a valid amount greater than zero.", true);
    return;
  }

  const assetKey = getSelectedAssetKey();
  if (storeDepositRequest(amount, assetKey)) {
    const asset = assetOptions[assetKey] || assetOptions.btc;
    setStatus(`Deposit request for ${amount} ${asset.code} is pending review. Our team will approve it shortly.`);
    depositForm.reset();
  }
});

applyTheme();
updateSelectedAsset(getSelectedAssetKey());