// import { ethers, keccak256 } from "ethers";
import hre from "hardhat";

async function main() {
    // Load contract factory for pair contract
    const Pair = await hre.ethers.getContractFactory("DEXPair");
    const bytecode = Pair.bytecode;

    // Calculate init code hash and log
    const initCodeHash = hre.ethers.keccak256(bytecode);
    console.log("Pair Init Code Hash: ", initCodeHash);
}

main().catch((error) => {
        console.error(error);
        process.exit(1);
    });