import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBefore() {

    // Set the price we are expecting to get from the DAPI
    const price = ethers.parseEther("1000");
    // We get the current time from Hardhat Network
    const timestamp = await time.latest();

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MockDapi = await ethers.getContractFactory("MockDapiProxy");
    const mockDapi = await MockDapi.deploy();
    await mockDapi.waitForDeployment();

    //Set our mock values for the dAPI to return
    //We can't call oracles on local node, so we are making our own
    await mockDapi.setDapiValues(price, timestamp);

    const TokenEx = await ethers.getContractFactory("TokenExchange");
    const tokenEx = await TokenEx.deploy();

    await tokenEx.waitForDeployment();

    //Set our mock Proxy address that will return static values
    await tokenEx.setProxyAddress(mockDapi.getAddress());
    
    return { tokenEx, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { tokenEx, owner } = await loadFixture(deployBefore);

      expect(await tokenEx.owner()).to.equal(owner.address);
    });
  });

  describe("Deposit", function () {
    it("Deposit Eth", async function () {
      const { tokenEx, owner } = await loadFixture(deployBefore);
      
      let [price, time] = await tokenEx.readDataFeed()
      //verify our mock values are set
      console.log("Price: ", price.toString());
      console.log("Time: ", time.toString());
      //Deposit 1 ETH to recieve tokens
      await tokenEx.depositCollateral({value: ethers.parseEther("1")});
      //Make sure we get our tokens in return
      await expect(await tokenEx.balanceOf(owner.address)).to.be.equal(ethers.parseEther("1000"));

    });
  });

  describe("Reclaim ETH", function () {
    it("Reclaim Collateral", async function () {
      const { tokenEx, owner } = await loadFixture(deployBefore);
      console.log("Balance: ", await ethers.provider.getBalance(owner.address));
      // First deposit to recieve tokens
      await tokenEx.depositCollateral({value: ethers.parseEther("1")});
      console.log("Balance: ", await ethers.provider.getBalance(owner.address));
      await tokenEx.approve(tokenEx.getAddress(), ethers.parseEther("1000"));
      //Reclaim our ETH
      await tokenEx.reclaimEth(ethers.parseEther("1000"));
      
      console.log("Balance: ", await ethers.provider.getBalance(owner.address));
      
      //Make sure we get our tokens in return
     // await expect(await tokenEx.balanceOf(owner.address)).to.be.equal(ethers.parseEther("1000"));

    });
  });

});
