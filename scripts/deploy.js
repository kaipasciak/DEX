import hre from "hardhat";
import fs from "fs";
import path from "path";
const { ethers } = hre;
import { fileURLToPath } from "url";

async function main () {
    // First account from ganache network will deploy contracts and mint mock ERC20 tokens
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts and minting tokens with: ", deployer.address);
    console.log("Deployer balance: ", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy WETH
    const WETH = await ethers.deployContract("MockWETH");
    await WETH.waitForDeployment();
    let WETHAddr = await WETH.getAddress();
    console.log("WETH deployed at: ", WETHAddr);

    // Deploy mock tokens
    const TokenA = await ethers.deployContract("MockERC20", [
        "Token A",
        "AAA",
        18,
        100000
    ]);
    await TokenA.waitForDeployment();
    let TokenAAddr = await TokenA.getAddress();
    console.log("Test Token deployed at: ", TokenAAddr);

    const TokenB = await ethers.deployContract("MockERC20", [
        "Token B",
        "BBB",
        18,
        100000
    ]);
    await TokenB.waitForDeployment();
    let TokenBAddr = await TokenB.getAddress();
    console.log("Test Token deployed at: ", TokenBAddr);

    const TokenC = await ethers.deployContract("MockERC20", [
        "Token C",
        "CCC",
        18,
        100000
    ]);
    await TokenC.waitForDeployment();
    let TokenCAddr = await TokenC.getAddress();
    console.log("Test Token deployed at: ", TokenCAddr);

    // Deploy factory contract
    const Factory = await hre.ethers.deployContract("DEXFactory");
    await Factory.waitForDeployment();
    let FactoryAddr = await Factory.getAddress();
    console.log("Factory deployed at: ", FactoryAddr);


    // Deploy router
    const Router = await hre.ethers.deployContract("DEXRouter", [
        await Factory.getAddress(),
        await WETH.getAddress()
    ]);
    await Router.waitForDeployment();
    let RouterAddr = await Router.getAddress();
    console.log("Router deployed at: ", RouterAddr);

    // Save addresses to frontend
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendDir = path.join(__dirname, "../frontend/src/artifacts");
    const addressesFile = path.join(frontendDir, "addresses.json");

    const addresses = {
        WETH: WETHAddr, 
        tokenA: TokenAAddr,
        tokenB: TokenBAddr,
        tokenC: TokenCAddr,
        factory: FactoryAddr,
        router: RouterAddr
    };

    fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
    console.log("Contract addresses saved to frontend/src/addresses.json");

    // Copy ABIs to frontend
    const artifactsDir = path.join(__dirname, "../artifacts/contracts");
    const abisDir = path.join(frontendDir, "abis");

    if (!fs.existsSync(abisDir)) {
        fs.mkdirSync(abisDir, { recursive: true });
    }

    const contractsToCopy = [
        "token/MockWETH.sol/MockWETH.json",
        "token/MockERC20.sol/MockERC20.json",
        "core/DEXFactory.sol/DEXFactory.json",
        "periphery/DEXRouter.sol/DEXRouter.json"
    ];

    contractsToCopy.forEach(file => {
        const srcPath = path.join(artifactsDir, file);
        const destPath = path.join(abisDir, path.basename(file));
        fs.copyFileSync(srcPath, destPath);
    });

    console.log("ABIs copied to frontend/src/abis");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});