const assetButton = document.getElementById("assetButton");
const assetMenu = document.getElementById("assetMenu");
const assetName = document.getElementById("assetName");
const assetCode = document.getElementById("assetCode");
const coinIcon = document.getElementById("coinIcon");
const balance = document.getElementById("balance");
const balanceAsset = document.getElementById("balanceAsset");
const amountAsset = document.getElementById("amountAsset");
const feeAsset = document.getElementById("feeAsset");
const receiveAsset = document.getElementById("receiveAsset");
const amount = document.getElementById("amount");
const fee = document.getElementById("fee");
const receive = document.getElementById("receive");
const status = document.getElementById("status");
const address = document.getElementById("address");
const network = document.getElementById("network");

const assetOptions = {
    USDT: { key: 'usdt', fee: 1, symbol: '₮', label: 'Tether' },
    BTC: { key: 'btc', fee: 0.0001, symbol: '₿', label: 'Bitcoin' },
    ETH: { key: 'eth', fee: 0.001, symbol: 'Ξ', label: 'Ethereum' },
    USDC: { key: 'usdc', fee: 1, symbol: '$', label: 'USD Coin' }
};

function readJson(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        return value && typeof value === 'object' ? value : fallback;
    } catch {
        return fallback;
    }
}

function isDarkTheme() {
    return localStorage.getItem('currentTheme') === 'dark-theme';
}

function applyTheme() {
    document.body.classList.toggle('dark-theme', isDarkTheme());
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
    const assetKey = assetOptions[assetCode]?.key || 'usdt';
    if (!account) return 0;
    return Number(account.cryptoBalances?.[assetKey]) || 0;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 8, minimumFractionDigits: 0 });
}

function updateAssetSelection(assetCode) {
    const selected = assetOptions[assetCode] || assetOptions.USDT;
    const currentBalance = getBalanceForAsset(assetCode);
    selectedAsset = assetCode;
    assetName.textContent = selected.label;
    assetCodeField.textContent = assetCode;
    coinIcon.textContent = selected.symbol;
    balanceAsset.textContent = assetCode;
    amountAsset.textContent = assetCode;
    feeAsset.textContent = assetCode;
    receiveAsset.textContent = assetCode;
    balance.textContent = formatNumber(currentBalance);
    amount.value = '';
    updateCalculation();
    assetMenu.classList.remove('show');
}

let selectedAsset = 'USDT';
const assetCodeField = document.getElementById('assetCode');

if (assetButton) {
    assetButton.addEventListener('click', () => {
        assetMenu.classList.toggle('show');
    });
}

document.querySelectorAll('#assetMenu button').forEach((button) => {
    button.addEventListener('click', () => {
        updateAssetSelection(button.dataset.asset || 'USDT');
    });
});

function getFee(asset) {
    return assetOptions[asset]?.fee || 0;
}

function updateCalculation() {
    const value = Number(amount.value) || 0;
    const networkFee = getFee(selectedAsset);
    fee.textContent = formatNumber(networkFee);
    receive.textContent = formatNumber(Math.max(value - networkFee, 0));
}

amount.addEventListener('input', updateCalculation);

document.getElementById('maxButton').addEventListener('click', () => {
    const currentBalance = getBalanceForAsset(selectedAsset);
    const networkFee = getFee(selectedAsset);
    amount.value = Math.max(currentBalance - networkFee, 0);
    updateCalculation();
});

document.getElementById('pasteButton').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        address.value = text;
    } catch {
        status.textContent = 'Unable to access clipboard. Please paste manually.';
    }
});

document.getElementById('withdrawForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const withdrawalAmount = Number(amount.value);
    const recipient = address.value.trim();
    const selectedNetwork = network.value;
    const currentBalance = getBalanceForAsset(selectedAsset);
    const networkFee = getFee(selectedAsset);

    if (!recipient) {
        status.textContent = 'Please enter a withdrawal address.';
        return;
    }

    if (!withdrawalAmount || withdrawalAmount <= 0) {
        status.textContent = 'Please enter a valid withdrawal amount.';
        return;
    }

    if (withdrawalAmount + networkFee > currentBalance) {
        status.textContent = `Insufficient ${selectedAsset} balance.`;
        return;
    }

    const account = getCurrentUserAccount();
    if (!account) {
        status.textContent = 'Please log in to create a withdrawal request.';
        return;
    }

    const request = {
        id: `withdraw-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'transaction',
        status: 'pending',
        userName: account.name || 'User',
        userEmail: account.email,
        details: {
            coin: selectedAsset,
            amount: withdrawalAmount,
            recipient,
            network: selectedNetwork,
            note: 'Withdrawal request'
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

    status.textContent = 'Withdrawal request submitted. It is pending admin approval.';
    amount.value = '';
    address.value = '';
    updateAssetSelection(selectedAsset);
});

applyTheme();
updateAssetSelection(selectedAsset);

            // Update local balance

            balances[selectedAsset] -=
                withdrawalAmount + networkFee;


            balance.textContent =
                formatNumber(
                    balances[selectedAsset]
                );


            amount.value = "";

            address.value = "";

            updateCalculation();


        } catch (error) {

            status.textContent =
                error.message;

        }

    });


// =========================
// FORMAT NUMBER
// =========================

function formatNumber(value) {

    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }
    );
}