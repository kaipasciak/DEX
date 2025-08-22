import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Mock ERC20 and Mock WETH Test", function() {
    // Signer declarations
    let deployer, alice, bob;

    // Token declarations
    let TokenA, WETH;


    before(async function() {
        [deployer, alice, bob] = await ethers.getSigners();
    });

    describe("ERC20", function() {

        before(async function() {
            // Contract factory not needed in hardhat ethers
            TokenA = await ethers.deployContract("MockERC20", [
                "Token A",
                "AAA",
                18,
                ethers.parseUnits("1000000", 18)
            ], { signer: deployer });
            await TokenA.waitForDeployment();
            console.log("TokenA deployed at: ", await TokenA.getAddress());
        });
        
        it("Should allow users to mint tokens", async function() {
            await TokenA.connect(alice).mint(alice.address, ethers.parseUnits("1000", 18));
            expect(await TokenA.balanceOf(alice.address)).to.equal(ethers.parseUnits("1000",18));
        });

        it("Should allow Alice to send tokens to Bob", async function() {
            await (TokenA.transfer(bob.address, ethers.parseUnits("500", 18)));
            expect(await TokenA.balanceOf(bob.address)).to.equal(ethers.parseUnits("500", 18));
        });
    });

    describe("WETH", function() {
        before(async function() {
            WETH = await ethers.deployContract("MockWETH");
            await WETH.waitForDeployment();
            console.log("WETH deployed at: ", await WETH.getAddress());
        });

        it("Should allow Alice to deposit WETH", async function() {
            await WETH.connect(alice).deposit({ value: ethers.parseUnits("2", 18) });
            expect(await WETH.balanceOf(alice.address)).to.equal(ethers.parseUnits("2", 18));
        });

        it("Should allow Alice to withdraw ether", async function() {
            await WETH.connect(alice).withdraw(ethers.parseUnits("1", 18));
            expect(await WETH.balanceOf(alice.address)).to.equal(ethers.parseUnits("1", 18));
        });

        it("should allow Alice to approve Bob to spend 1 WETH", async function() {
            await WETH.connect(alice).approve(bob.address, ethers.parseUnits("1", 18));
            expect (await WETH.allowance(alice.address, bob.address)).to.equal(ethers.parseUnits("1", 18));
        });

        it("Should allow Bob to spend Alice's WETH at specified allowance", async function() {
            await WETH.connect(bob).transferFrom(alice.address, bob.address, ethers.parseUnits("1", 18));
            expect(await WETH.balanceOf(bob.address)).to.equal(ethers.parseUnits("1", 18));
        }); 
    });
});