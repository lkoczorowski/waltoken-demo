const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Waltoken Deployment", function () {
    let Waltoken, waltoken, owner, addr1, addr2;

    beforeEach(async function () {
        // Get signers (test accounts)
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy Waltoken contract with initial supply
        const initialSupply = 1_000_000; //ethers.parseEther("1000000"); // 1M tokens in Wei
        Waltoken = await ethers.getContractFactory("Waltoken");
        waltoken = await Waltoken.deploy(initialSupply);
        await waltoken.waitForDeployment();
    });

    it("Should assign the total supply to the owner", async function () {
        const ownerBalance = await waltoken.balanceOf(owner.address);
        const totalSupply = await waltoken.totalSupply();

        // Check if the owner's balance matches the total supply
        expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should have the correct total supply", async function () {
        const totalSupply = await waltoken.totalSupply();

        // Expect total supply to be exactly 1,000,000 tokens (in Wei)
        expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should transfer tokens correctly", async function () {
        // Transfer 1000 tokens from owner to addr1
        await waltoken.transfer(addr1.address, ethers.parseEther("1000"));

        // Check balances after transfer
        expect(await waltoken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
        expect(await waltoken.balanceOf(owner.address)).to.equal(ethers.parseEther("999000"));
    });

    it("Should not allow transfers exceeding balance", async function () {
        await expect(
            waltoken.connect(addr1).transfer(owner.address, ethers.parseEther("2000"))
        ).to.be.revertedWithCustomError(waltoken, "ERC20InsufficientBalance");
    });
});
