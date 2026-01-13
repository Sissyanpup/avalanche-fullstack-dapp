const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

const AVALANCHE_FUJI_CHAIN_ID = "0xa869";
let isConnected = false;

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}

function shortenAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  try {
    statusEl.textContent = "Connecting...";

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];
    addressEl.textContent = shortenAddress(address);

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected ✅";
      statusEl.style.color = "#4cd137";

      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      networkEl.textContent = "Wrong Network ❌";
      statusEl.textContent = "Please switch to Avalanche Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
    }

    // Update button state
    isConnected = true;
    connectBtn.textContent = "Disconnect";
    connectBtn.classList.add("connected");
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed ❌";
  }
}

function disconnectWallet() {
  isConnected = false;
  connectBtn.textContent = "Connect Wallet";
  addressEl.textContent = "-";
  networkEl.textContent = "-";
  balanceEl.textContent = "-";
  statusEl.textContent = "Disconnected";
  statusEl.style.color = "#95a5a6";

  connectBtn.classList.remove("connected")
}

async function updateUI() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    
    if (accounts.length === 0) {
      disconnectWallet();
      return;
    }

    const address = accounts[0];
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    addressEl.textContent = shortenAddress(address);
    isConnected = true;
    connectBtn.textContent = "Disconnect";

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "✅ Avalanche Fuji";
      statusEl.textContent = "Connected";
      statusEl.style.color = "#4cd137";

      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      networkEl.textContent = "❌ Wrong Network";
      statusEl.textContent = "Please switch to Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
    }
  } catch (error) {
    console.error("Update UI Error:", error);
  }
}

// Event listeners for account and chain changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      updateUI();
    }
  });

  window.ethereum.on("chainChanged", () => {
    updateUI();
  });
}

// Toggle connect/disconnect
connectBtn.addEventListener("click", () => {
  if (isConnected) {
    disconnectWallet();
  } else {
    connectWallet();
  }
});

// Check on page load if already connected
window.addEventListener("load", updateUI);