import React, { useState } from "react";
import { ethers } from "ethers";
import MockERC20Artifact from "../artifacts/abis/MockERC20.json";
import RouterArtifact from "../artifacts/abis/DEXRouter.json";
import addresses from "../artifacts/addresses.json";

function LiquidityPanel({ signer }) {
    const [tokenA, setTokenA] = useState("");
    const [tokenB, setTokenB] = useState("");
    const [amountADesired, setAmountADesired] = useState("");
    const [amountBDesired, setAmountBDesired] = useState("");
    const [liquidity, setLiquidity] = useState("");

    const router = new ethers.Contract(addresses.router, RouterArtifact.abi, signer);

    const handleAddLiquidity = async () => {
        if (!tokenA || !tokenB || !amountADesired || !amountBDesired) return;
        if (tokenA === tokenB) return;

        const amountA = ethers.parseUnits(amountADesired, 18);
        const amountB = ethers.parseUnits(amountBDesired, 18);

        if (tokenA === addresses.WETH || tokenB === addresses.WETH) {
            // For WETH transaction
            const token = tokenA === addresses.WETH ? tokenB : tokenA;
            const tokenAmount = tokenA === addresses.WETH ? amountB : amountA;
            const ethAmount = tokenA === addresses.WETH ? amountA : amountB;

            // Approve transaction
            try {
                const tokenContract = new ethers.Contract(token, MockERC20Artifact.abi, signer);
                await tokenContract.approve(router.target, ethers.parseUnits(tokenAmount.toString(), 18));

                const tx = await router.addLiquidityETH(
                    token,
                    tokenAmount,
                    0,
                    0,
                    await signer.getAddress(),
                    Math.floor(Date.now() / 1000) + 60 * 20,
                    { value: ethAmount }
                );
                await tx.wait();
                console.log("Liquidity added (ETH pair)");
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        } else {
            // For token transaction

            // Approve transaction
            try {
                const tokenAContract = new ethers.Contract(tokenA, MockERC20Artifact.abi, signer);
                await tokenAContract.approve(router.target, ethers.parseUnits(amountA.toString(), 18));

                const tokenBContract = new ethers.Contract(tokenB, MockERC20Artifact.abi, signer);
                await tokenBContract.approve(router.target, ethers.parseUnits(amountB.toString(), 18));

                const tx = await router.addLiquidity(
                    tokenA,
                    tokenB,
                    amountA,
                    amountB,
                    0,
                    0,
                    await signer.getAddress(),
                    Math.floor(Date.now() / 1000) + 60 * 20
                );
                await tx.wait();
                console.log("Liquidity added (token pair)");
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }
    };

    const handleRemoveLiquidity = async () => {
        if (!tokenA || !tokenB || !liquidity) return;
        if (tokenA || tokenB) return;

        const liquidityAmount = ethers.parseUnits(liquidity, 18);

        if (tokenA === addresses.WETH || tokenB === addresses.WETH) {
            const token = tokenA === addresses.WETH ? tokenB : tokenA;
            try {
                const tx = await router.removeLiquidityETH(
                    token,
                    liquidityAmount,
                    0,
                    0,
                    await signer.getAddress(),
                    Math.floor(Date.now() / 1000) + 60 * 20
                );
                await tx.wait();
                console.log("Liquidity removed (ETH pair)");
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        } else {
            try {
                const tx = await router.removeLiquidity(
                    tokenA,
                    tokenB,
                    liquidityAmount,
                    0,
                    0,
                    await signer.getAddress(),
                    Math.floor(Date.now() / 1000) + 60 * 20
                );
                await tx.wait();
                console.log("Liquidity removed (token pair)");
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }
    };

    return (
        <div className="p-4 border rounded">
            <h2 className="font-bold mb-2">Liquidity Panel</h2>

            <div className="mb-2">
                <input
                    placeholder="Token A address"
                    value={tokenA}
                    onChange={(e) => setTokenA(e.target.value)}
                    className="border p-1 w-full"
                />
            </div>
            <div className="mb-2">
                <input
                    placeholder="Token B address"
                    value={tokenB}
                    onChange={(e) => setTokenB(e.target.value)}
                    className="border p-1 w-full"
                />
            </div>
            <div className="mb-2">
                <input
                    placeholder="Amount A Desired"
                    value={amountADesired}
                    onChange={(e) => setAmountADesired(e.target.value)}
                    className="border p-1 w-full"
                />
            </div>
            <div className="mb-2">
                <input
                    placeholder="Amount B Desired"
                    value={amountBDesired}
                    onChange={(e) => setAmountBDesired(e.target.value)}
                    className="border p-1 w-full"
                />
            </div>

            <button
                onClick={handleAddLiquidity}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
                Add Liquidity
            </button>
            <div className="mt-4">
                <input
                    placeholder="Liquidity amount"
                    value={liquidity}
                    onChange={(e) => setLiquidity(e.target.value)}
                    className="border p-1 w-full"
                />
                <button
                    onClick={handleRemoveLiquidity}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                >
                    Remove Liquidity
                </button>
            </div>
        </div>
    ); 
}

export default LiquidityPanel;