import React, { useState } from "react";
import { ethers } from "ethers";

function SwapPanel({ router, factory, signer, weth }) {
    const [amountIn, setAmountIn] = useState("");
    const [tokenIn, setTokenIn] = useState("");
    const [tokenOut, setTokenOut] = useState("");

    async function handleSwap() {
        try {
            const user = await signer.getAddress();
            const deadline = Math.floor(Date.now() / 1000) + 60*10;

            let path = [];

            // ETH/Token Swaps
            if (tokenIn === "ETH") {
                path = [weth, tokenOut];
                const tx = await router.swapExactETHForTokens(
                    0,
                    path,
                    user,
                    deadline,
                    { value: ethers.parseEther(amountIn) }
                );
                await tx.wait();
                alert("ETH -> Token swap successful!");
                return;
            }

            if (tokenOut === "ETH") {
                const tokenContract = new ethers.Contract(tokenIn, router.interface.fragments, signer);
                await tokenContract.approve(router.target, ethers.parseUnits(amountIn, 18));
                path = [tokenIn, weth];
                const tx = await router.swapExactTokensForETH(
                    ethers.parseUnits(amountIn, 18),
                    0,
                    path,
                    user,
                    deadline
                );
                await tx.wait();
                alert("Token -> ETH swap successful!");
                return;
            }

            const directPair = await factory.getPair(tokenIn, tokenOut);
            if (directPair !== ethers.ZeroAddress) {
                path = [tokenIn, tokenOut];
            } else {
                const pairA = await factory.getPair(tokenIn, weth);
                const pairB = await factory.getPair(tokenOut, weth);
                if (pairA !== ethers.ZeroAddress && pairB !== ethers.ZeroAddress){
                    path = [tokenIn, weth, tokenOut];
                } else {
                    alert("No valid swap path found");
                    return;
                }
            }

            const tokenContract = new ethers.Contract(tokenIn, router.interface.fragments, signer);
            await tokenContract.approve(router.target, ethers.parseUnits(amountIn, 18));
            const tx = await router.swapExactTokensForTokens(
                ethers.parseUnits(amountIn, 18),
                0,
                path,
                user,
                deadline
            );
            await tx.wait();
            alert("Token -> Token swap successful");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    return (
        <div className="border p-4 rounded space-y-2">
            <h2 className="font-bold">Swap Tokens</h2>
            <input
                placeholder="Token In (ETH or address)"
                value={tokenIn}
                onChange={(e) => setTokenIn(e.target.value)}
                className="border p-1 w-full"
            />
            <input
                placeholder="Token Out (ETH or address)"
                value={tokenOut}
                onChange={(e) => setTokenOut(e.target.value)}
                className="border p-1 w-full"
            />
            <input
                placeholder="Amount"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="border p-1 w-full"
            />
            <button
                onClick={handleSwap}
                className="bg-blue-500 text-white px-3 py-1 rounded"
            >
                Swap
            </button>
        </div>
    )
}

export default SwapPanel;