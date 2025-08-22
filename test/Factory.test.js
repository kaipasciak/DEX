import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("DEX Factory Functionality", function() {
    // Signer declarations
    let deployer, alice, bob;

    // DEX contract declarations
    let Factory, Router;

    // Token declarations
    let TokenA, TokenB, WETH;


    this.beforeEach(async function() {
        
        // Assignments

        // Signers

        [deployer, alice, bob] = await ethers.getSigners();

        // Tokens

        TokenA = await ethers.deployContract("MockERC20", [
            "Token A",
            "AAA",
            18,
            ethers.parseUnits("1000000", 18)
        ]);
        await TokenA.waitForDeployment();
        console.log("TokenA deployed at: ", await TokenA.getAddress());

        TokenB = await ethers.deployContract("MockERC20", [
            "Token B",
            "BBB",
            18,
            ethers.parseUnits("1000000", 18)
        ]);
        await TokenB.waitForDeployment();
        console.log("TokenB deployed at: ", await TokenB.getAddress());

        WETH = await hre.ethers.deployContract("MockWETH");
        await WETH.waitForDeployment();
        console.log("WETH deployed at: ", await WETH.getAddress());

        // Contracts

        Factory = await hre.ethers.deployContract("DEXFactory");
        await Factory.waitForDeployment();
        console.log("Factory deployed at: ", await Factory.getAddress());

        Router = await hre.ethers.deployContract("DEXRouter", [
            await Factory.getAddress(),
            await WETH.getAddress()
        ]);
        await Router.waitForDeployment();
        console.log("Router deployed at: ", await Router.getAddress());
    });

    

});