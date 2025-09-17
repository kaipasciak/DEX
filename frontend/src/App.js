import './App.css';
import React, { useState } from "react";
import { ethers } from "ethers";

// Import artifacts
import RouterArtifact from "./artifacts/abis/DEXRouter.json";
import FactoryArtifact from "./artifacts/abis/DEXFactory.json";
import addresses from "./artifacts/addresses.json";

// Import child panels
import SwapPanel from "./components/SwapPanel.js";
import LiquidityPanel from "./components/LiquidityPanel.js";
import PairLookup from "./components/PairLookup.js";

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [router, setRouter] = useState(null);
  const [factory, setFactory] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setAccount(address);
    setSigner(signer);

    const routerContract = new ethers.Contract(
      addresses.router,
      RouterArtifact.abi,
      signer
    );
    setRouter(routerContract);

    const factoryContract = new ethers.Contract(
      addresses.factory,
      FactoryArtifact.abi,
      signer
    );
    setFactory(factoryContract);
  }

  return (
    <div className="App">
      <h1 className="test-2xl font-bold mb-4">KaiSwap</h1>
      {!account ? (
        <button
          onClick={connectWallet}
          className="border px-4 py-2 rounded hover:bg-gray-200"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="mb-4">Connected as: {account}</p>
      )}

      {account && router && factory && signer && (
        <div className="space-y-6">
          <SwapPanel router={router} factory={factory} signer={signer} weth={addresses.WETH}/>
          <LiquidityPanel router={router} />
          <PairLookup factory={factory} />
          </div>
      )}
    </div>
  );
}

export default App;
