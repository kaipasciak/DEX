import React, { useState } from "react";
import { ethers } from "ethers";
import FactoryArtifact from "../artifacts/abis/DEXFactory.json";
import addresses from "../artifacts/addresses.json";

function PairLookup({ signer }) {
    const [tokenA, setTokenA] = useState("");
    const [tokenB, setTokenB] = useState("");
    const [pairAddress, setPairAddress] = useState("");

    const factory = new ethers.Contract(addresses.factory, FactoryArtifact.abi, signer);

    const handleLookup = async () => {
        if (!tokenA || !tokenB) return;
        try {
            const pair = await factory.getPair(tokenA, tokenB);
            setPairAddress(pair);
        } catch (err) {
            console.error("Error fetching pair: ", err);
            setPairAddress("Error");
        }
    };

    return (
        <div className="p-4 border rounded">
            <h2 className="font-bold mb-2">Pair Lookup</h2>

            <div className="mb-2">
                <input
                    placeholder="Token A Address"
                    value={tokenA}
                    onChange={(e) => setTokenA(e.target.value)}
                    className="border p-1 w-full"
                />
            </div>

            <div className="mb-2">
                <input
                    placeholder="Token B Address"
                    value={tokenB}
                    onChange={(e) => setTokenB(e.target.value)}
                    className="border p-1 w-full"
                />
            </div>

            <button
                onClick={handleLookup}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Lookup Pair
            </button>

            {pairAddress && (
                <p className="mt-2 break-all">
                    Pair Address:{" "}
                    <span className="font-mono">{pairAddress}</span>
                </p>
            )}
        </div>
    );
}

export default PairLookup;