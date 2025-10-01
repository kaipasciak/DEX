import React, { useState } from "react";
import { ethers } from "ethers";
import FactoryArtifact from "../artifacts/abis/DEXFactory.json";
import PairArtifact from "../artifacts/abis/DEXPair.json";
import addresses from "../artifacts/addresses.json";

function PairLookup({ signer }) {
    const [tokenA, setTokenA] = useState("");
    const [tokenB, setTokenB] = useState("");
    const [pairAddress, setPairAddress] = useState("");
    const [balance, setBalance] = useState("");

    const factory = new ethers.Contract(addresses.factory, FactoryArtifact.abi, signer);

    const handleLookup = async () => {
        if (!tokenA || !tokenB) return;
        
        // Set pair address
        try {
            const pairAddressTemp = await factory.getPair(tokenA, tokenB);
            setPairAddress(pairAddressTemp);

        } catch (err) {
            console.error("Error fetching pair: ", err);
            setPairAddress("Error");
        }

        // Set user balance of specified pair's liquidity tokens
        try {
            const pair = new ethers.Contract(pairAddress, PairArtifact.abi, signer);
            const balanceTemp = await pair.balanceOf(await signer.getAddress());
            setBalance(ethers.formatEther(balanceTemp));
        } catch (err) {
            console.error("Error retrieving balance: ", err);
            setBalance("Error");
        }
    };

    return (
        <div className="p-4 border rounded">
            <h2 className="Component-header">Pair Lookup</h2>

            <div className="mb-2">
                <input
                    placeholder="Token A Address"
                    value={tokenA}
                    onChange={(e) => setTokenA(e.target.value)}
                    className="border p-1 w-full"
                />
                <input
                    placeholder="Token B Address"
                    value={tokenB}
                    onChange={(e) => setTokenB(e.target.value)}
                    className="border p-1 w-full"
                />
                <button
                    onClick={handleLookup}
                    className="button-style"
                >
                    Lookup Pair
                </button>
            </div>

            {pairAddress && (
                <p className="mt-2 break-all">
                    Pair Address:{" "}
                    <span className="font-mono">{pairAddress}</span>
                </p>
            )}

            {balance && (
                <p className="mt-2 break-all">
                    Liquidity Token Balance:{" "}
                    <span className="font-mono">{balance}</span>
                </p>
            )}
        </div>
    );
}

export default PairLookup;