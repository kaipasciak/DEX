
import hre from "hardhat";

async function main () {
    // First account from ganache network will deploy contracts and mint mock ERC20 tokens
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts and minting tokens with: ", deployer.address);
    console.log("Deployer balance: ", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy WETH
    const WETH = await hre.ethers.deployContract("MockWETH");
    await WETH.waitForDeployment();
    console.log("WETH deployed at: ", await WETH.getAddress());

    // Deploy mock tokens
    const Token = await hre.ethers.deployContract("MockERC20", [
        "Test Token",
        "TT",
        18,
        hre.ethers.parseUnits("1000000", 18)
    ]);
    await Token.waitForDeployment();
    console.log("Test Token deployed at: ", await Token.getAddress());

    // Deploy factory contract
    const Factory = await hre.ethers.deployContract("DEXFactory");
    await Factory.waitForDeployment();
    console.log("Factory deployed at: ", await Factory.getAddress());


    // Deploy router
    const Router = await hre.ethers.deployContract("DEXRouter", [
        await Factory.getAddress(),
        await WETH.getAddress()
    ]);
    await Router.waitForDeployment();
    console.log("Router deployed at: ", await Router.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});