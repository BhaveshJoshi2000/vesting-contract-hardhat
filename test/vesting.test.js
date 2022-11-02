const { assert, expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Vesting", function () {
      let vesting, accounts, deployer;

      beforeEach(async function () {
        accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["vesting"]);

        vesting = await ethers.getContract("Vesting");
      });

      describe("Constructor", function () {
        it("Initializes the variables correctly", async function () {
          const startTime = await vesting.getStartTime();
          const beneficiary = await vesting.getBeneficiary(0);

          assert(startTime != 0);
          assert.equal(beneficiary, deployer.address);
        });
      });

      describe("addBeneficiary", function () {
        it("reverts when maximum numbers of beneficiaries are reached", async function () {
          for (var i = 0; i < 9; i++) {
            await vesting.addBeneficiery(accounts[i + 1].address);
          }

          await expect(
            vesting.addBeneficiery(accounts[10].address)
          ).to.be.revertedWith("MAX_BENEFICIERIES_REACHED()");
        });

        it("adds new beneficiary to the list", async function () {
          await vesting.addBeneficiery(accounts[1].address);

          const newBeneficiary = await vesting.getBeneficiary(1);

          assert.equal(newBeneficiary, accounts[1].address);
        });

        it("increments the value of current Beneficiary", async function () {
          const initialCount = await vesting.getTotalBeneficiaries();
          await vesting.addBeneficiery(accounts[1].address);
          const finalCount = await vesting.getTotalBeneficiaries();

          assert.equal(finalCount.toNumber(), initialCount.toNumber() + 1);
        });
      });

      describe("releasableAmount", function () {
        it("correctly calculates the unreleased amount per minute", async function () {
          await network.provider.send("evm_increaseTime", [6500]);

          const startTime = await vesting.getStartTime();
          const unreleasedAmount = await vesting.releasableAmount();

          assert(unreleasedAmount);
          console.log(startTime);
          console.log(unreleasedAmount);
        });
      });
    });
