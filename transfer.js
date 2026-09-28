const assetBtn = document.getElementById("assetBtn");
const menu = document.getElementById("assetMenu");
const nameEl = document.getElementById("assetName");
const codeEl = document.getElementById("assetCode");
const amountCode = document.getElementById("amountCode");
const amount = document.getElementById("amount");
const receive = document.getElementById("receive");
const balance = document.getElementById("balance");

const assetOptions = {
  USDT: { key: 'usdt', label: 'Tether', symbol: '$' },
  BTC: { key: 'btc', label: 'Bitcoin', symbol: '₿' },
  ETH: { key: 'eth', label: 'Ethereum', symbol: 'Ξ' },
  USDC: { key: 'usdc', label: 'USD Coin', symbol: '$' }
};

let selectedAsset = 'USDT';

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

function getCurrentUserAccount() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('investCurrentUser') || 'null');
    const users = JSON.parse(localStorage.getItem('investUsers') || '[]');
    if (!currentUser?.email) return null;
    return users.find((user) => user.email === currentUser.email) || null;
  } catch {
    return null;
  }
}

function getBalanceForAsset(assetCode) {
  const account = getCurrentUserAccount();
  const key = assetOptions[assetCode]?.key || 'usdt';
  return Number(account?.cryptoBalances?.[key]) || 0;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 8, minimumFractionDigits: 0 });
}

function updateAssetSelection(assetCode) {
  const asset = assetOptions[assetCode] || assetOptions.USDT;
  selectedAsset = assetCode;
  nameEl.textContent = asset.label;
  codeEl.textContent = assetCode;
  amountCode.textContent = assetCode;
  assetBtn.querySelector('.coin').textContent = asset.symbol;
  balance.textContent = `${formatNumber(getBalanceForAsset(assetCode))} ${assetCode}`;
  menu.classList.remove('open');
  update();
}

assetBtn.onclick = () => {
  menu.classList.toggle('open');
};

document.querySelectorAll('#assetMenu button').forEach((btn) => {
  btn.onclick = () => {
    updateAssetSelection(btn.dataset.code || 'USDT');
  };
});

function update() {
  const value = Number(amount.value) || 0;
  receive.textContent = `${value.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${codeEl.textContent}`;
}

amount.oninput = update;

document.getElementById('max').onclick = () => {
  amount.value = getBalanceForAsset(selectedAsset);
  update();
};

document.getElementById('paste').onclick = async () => {
  try {
    document.getElementById('recipient').value = await navigator.clipboard.readText();
  } catch (error) {
    console.log(error);
  }
};

document.getElementById('submit').onclick = () => {
  const recipient = document.getElementById('recipient').value.trim();
  const value = Number(amount.value);
  const status = document.getElementById('status');

  if (!recipient || !value) {
    status.textContent = 'Enter a recipient address and transfer amount.';
    status.style.background = '#241d10';
    status.style.borderColor = '#49391a';
    status.style.color = '#c9ad70';
    status.classList.add('show');
    return;
  }

  const account = getCurrentUserAccount();
  if (!account) {
    status.textContent = 'Please log in to create a transfer request.';
    status.style.background = '#241d10';
    status.style.borderColor = '#49391a';
    status.style.color = '#c9ad70';
    status.classList.add('show');
    return;
  }

  const request = {
    id: `transfer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'transaction',
    status: 'pending',
    userName: account.name || 'User',
    userEmail: account.email,
    details: {
      coin: selectedAsset,
      amount: value,
      recipient,
      note: 'Transfer request'
    },
    createdAt: new Date().toISOString()
  };

  const requests = readJson('investRequests', []);
  requests.push(request);
  localStorage.setItem('investRequests', JSON.stringify(requests));

  account.requests = Array.isArray(account.requests) ? account.requests : [];
  account.requests.push({ ...request, details: { ...request.details } });
  const users = JSON.parse(localStorage.getItem('investUsers') || '[]');
  const index = users.findIndex((user) => user.email === account.email);
  if (index !== -1) {
    users[index] = account;
    localStorage.setItem('investUsers', JSON.stringify(users));
  }

  status.textContent = 'Transfer request submitted and is waiting for admin approval.';
  status.style.background = '#12251a';
  status.style.borderColor = '#294433';
  status.style.color = '#72d18d';
  status.classList.add('show');
  amount.value = '';
  document.getElementById('recipient').value = '';
  updateAssetSelection(selectedAsset);
};

applyTheme();
updateAssetSelection(selectedAsset);