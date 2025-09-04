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

    // Address declarations
    let TokenAAddr, TokenBAddr, WETHAddr, FactoryAddr, RouterAddr;


    before(async function() {
        
        // Assignments
        // Signers
        [deployer, alice, bob] = await ethers.getSigners();

        // Tokens
        TokenA = await ethers.deployContract("MockERC20", [
            "Token A",
            "AAA",
            18,
            ethers.parseUnits("1000000", 18)
        ], { signer: deployer });
        await TokenA.waitForDeployment();
        TokenAAddr = await TokenA.getAddress();
        console.log("TokenA deployed at: ", TokenAAddr);

        TokenB = await ethers.deployContract("MockERC20", [
            "Token B",
            "BBB",
            18,
            ethers.parseUnits("1000000", 18)
        ], { signer: deployer });
        await TokenB.waitForDeployment();
        TokenBAddr = await TokenB.getAddress();
        console.log("TokenB deployed at: ", TokenBAddr);

        WETH = await hre.ethers.deployContract("MockWETH");
        await WETH.waitForDeployment();
        WETHAddr = await WETH.getAddress();
        console.log("WETH deployed at: ", WETHAddr);

        // Contracts
        Factory = await hre.ethers.deployContract("DEXFactory", { signer: deployer });
        await Factory.waitForDeployment();
        FactoryAddr = await Factory.getAddress();
        console.log("Factory deployed at: ", FactoryAddr);

        Router = await hre.ethers.deployContract("DEXRouter", [
            await Factory.getAddress(),
            await WETH.getAddress()
        ]);
        await Router.waitForDeployment();
        RouterAddr = await Router.getAddress();
        console.log("Router deployed at: ", RouterAddr);
    });

    // Adding liquidity
    // Removing liquidity
    describe("Token/token liquidity functions", function() {
        let aliceLpBalance;

        it("Should allow a user to add liquidity to a token/token pair contract not yet created", async function() {
            await TokenA.connect(alice).mint(alice.address, ethers.parseUnits("1500", 18));
            await TokenB.connect(alice).mint(alice.address, ethers.parseUnits("1500", 18));
            const latestBlock = await ethers.provider.getBlock("latest");
            const deadline = latestBlock.timestamp + 10000;
            // Alice has to approve funds for Router before adding liquidity
            await TokenA.connect(alice).approve(RouterAddr, ethers.parseUnits("120", 18));
            await TokenB.connect(alice).approve(RouterAddr, ethers.parseUnits("120", 18));
            await Router.connect(alice).addLiquidity(TokenAAddr, TokenBAddr, ethers.parseUnits("100", 18), 
            ethers.parseUnits("100", 18), ethers.parseUnits("90", 18), ethers.parseUnits("90", 18), alice.address, deadline);
            
            // Get pair address and check Alice balance
            const pairAddr = await Factory.getPair(TokenAAddr, TokenBAddr);
            const pair = await ethers.getContractAt("DEXPair", pairAddr);
            aliceLpBalance = await pair.balanceOf(alice.address);
            expect(aliceLpBalance).to.be.gt(0n);
        });

        it("Should allow a user to add liquidity to existing token/token pair contract", async function() {
            const latestBlock = await ethers.provider.getBlock("latest");
            const deadline = latestBlock.timestamp + 10000;
            await TokenA.connect(deployer).approve(RouterAddr, ethers.parseUnits("120", 18));
            await TokenB.connect(deployer).approve(RouterAddr, ethers.parseUnits("120", 18));
            await Router.connect(deployer).addLiquidity(TokenAAddr, TokenBAddr, ethers.parseUnits("100", 18), 
            ethers.parseUnits("100", 18), ethers.parseUnits("90", 18), ethers.parseUnits("90", 18), deployer.address, deadline);
            // Get pair address and check Alice balance
            const pairAddr = await Factory.getPair(TokenAAddr, TokenBAddr);
            const pair = await ethers.getContractAt("DEXPair", pairAddr);
            const lpBalance = await pair.balanceOf(deployer.address);
            expect(lpBalance).to.be.gt(0n);
        });

        it("Should allow a user to remove liquidity", async function() {
            let aliceStartingBalance = await TokenA.balanceOf(alice.address);
            const latestBlock = await ethers.provider.getBlock("latest");
            const deadline = latestBlock.timestamp + 10000;
            await Router.connect(alice).removeLiquidity(TokenAAddr, TokenBAddr, aliceLpBalance, ethers.parseUnits("90", 18),
            ethers.parseUnits("90", 18), alice.address, deadline);
            let aliceEndingBalance = await TokenA.balanceOf(alice.address);
            expect(aliceEndingBalance).to.be.gt(aliceStartingBalance);
            console.log("Starting balance: ", ethers.formatUnits(aliceStartingBalance));
            console.log("Ending balance: ", ethers.formatUnits(aliceEndingBalance));
        });
    })

    describe("Token/ETH liquidity functions", function() {
        let aliceLpBalance;

        it("Should allow a user to add liquidity to a token/eth pair contract not yet created", async function() {
            
            // Add liquidity
            const latestBlock = await ethers.provider.getBlock("latest");
            const deadline = latestBlock.timestamp + 10000;

            await TokenA.connect(alice).approve(RouterAddr, ethers.parseUnits("100", 18));
            await Router.connect(alice).addLiquidityETH(TokenAAddr, ethers.parseUnits("90", 18),
            ethers.parseUnits("80", 18), ethers.parseEther("0.9"), alice.address, deadline, { value: ethers.parseEther("1.0")});

            // Check existence of pair contract and Alice's balance
            // Get pair address and check Alice balance
            const pairAddr = await Factory.getPair(TokenAAddr, WETHAddr);
            const pair = await ethers.getContractAt("DEXPair", pairAddr);
            aliceLpBalance = await pair.balanceOf(alice.address);
            expect(aliceLpBalance).to.be.gt(0n);
            
        });

        it("test", async function() {
            const pairAddr = await Factory.getPair(TokenAAddr, WETHAddr);
            const pair = await ethers.getContractAt("DEXPair", pairAddr);
            const [reserveA, reserveWETH] = await pair.getReserves();
            console.log([ethers.formatEther(reserveA.toString()), ethers.formatEther(reserveWETH.toString())]);
        });

        it("Should allow a user to add liquidity to existing token/eth pair contract", async function() {
            
            // Add liquidity from deployer address
            const latestBlock = await ethers.provider.getBlock("latest");
            const deadline = latestBlock.timestamp + 1000;

            await TokenA.connect(deployer).approve(RouterAddr, ethers.parseUnits("100", 18));
            await Router.connect(deployer).addLiquidityETH(TokenAAddr, ethers.parseUnits("90", 18),
            ethers.parseUnits("10", 18), ethers.parseEther("1.0"), deployer.address, deadline, { value: ethers.parseEther("1.0") });

            // Get pair address and check deployer's balance
            const pairAddr = await Factory.getPair(TokenAAddr, WETHAddr);
            const pair = await ethers.getContractAt("DEXPair", pairAddr);
            let lpBalance = await pair.balanceOf(deployer.address);
            expect(lpBalance).to.be.gt(0n);
        });

        it("Should allow a user to remove liquidity", async function() {
            let aliceStartingBalance = await TokenA.balanceOf(alice.address);
            const latestBlock = await ethers.provider.getBlock("latest");
            const deadline = latestBlock.timestamp + 1000;

            await Router.connect(alice).removeLiquidityETH(TokenAAddr, aliceLpBalance, ethers.parseUnits("85", 18), ethers.parseEther("0.9"), alice.address, deadline);
            let aliceEndingBalance = await TokenA.balanceOf(alice.address);
            console.log("Alice starting balance: ", aliceStartingBalance);
            console.log("Alice ending balance: ", aliceEndingBalance);
            expect(aliceEndingBalance).to.be.gt(aliceStartingBalance);
        
        });
    })


    // Swap: TokenA and TokenB will have a pair contract. TokenA and TokenC will not, and will require
    // multiple hops to swap

    // Swap token for token
    // Swap ETH for token
    // Swap token for ETH
    // Multihop swap

    

});