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

          assert(startTime != 0);
        });
      });

      describe("addBeneficiary", function () {
        it("reverts when maximum numbers of beneficiaries are reached", async function () {
          for (var i = 0; i < 10; i++) {
            await vesting.addBeneficiery(accounts[i + 1].address);
          }

          await expect(
            vesting.addBeneficiery(accounts[11].address)
          ).to.be.revertedWith("MAX_BENEFICIERIES_REACHED()");
        });

        it("adds new beneficiary to the list", async function () {
          await vesting.addBeneficiery(accounts[1].address);

          const newBeneficiary = await vesting.getBeneficiary(0);

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
          await ethers.provider.send("evm_increaseTime", [60]);
          await ethers.provider.send("evm_mine", []);

          const unreleasedAmount = await vesting.releasableAmount();

          await ethers.provider.send("evm_increaseTime", [60]);
          await ethers.provider.send("evm_mine", []);

          const unreleasedAmount1 = await vesting.releasableAmount();

          assert.equal(
            unreleasedAmount.mul(2).toString(),
            unreleasedAmount1.toString()
          );

          //   console.log(unreleasedAmount.mul(2).toString());
          //   console.log(unreleasedAmount1.toString());
        });
      });

      describe("vestedAmount", function () {
        it("correctly calculates the vested amount", async function () {
          const vestedAmount = await vesting.vestedAmount();
          console.log(vestedAmount.toString());
          assert(vestedAmount);
        });

        it("checks the proper distribution of tokens", async function () {
          await vesting.addBeneficiery(accounts[1].address);
          await ethers.provider.send("evm_increaseTime", [60]);
          await ethers.provider.send("evm_mine", []);

          const unreleasedAmount = await vesting.releasableAmount();

          console.log("releasing...");
          await vesting.releaseAllTokens();

          const released = await vesting.getReleased();

          const vestedAmount = await vesting.vestedAmount();
          assert.equal(unreleasedAmount.toString(), released.toString());
          assert.equal(vestedAmount.toString(), "100000000000000000000000000");
        });
      });

      describe("releaseAllToken", function () {
        it("evenly distributes the token to all the beneficiaries", async function () {
          for (var i = 0; i < 10; i++) {
            await vesting.addBeneficiery(accounts[i + 1].address);
          }

          await ethers.provider.send("evm_increaseTime", [600]);
          await ethers.provider.send("evm_mine", []);

          const unreleasedAmount = await vesting.releasableAmount();

          await vesting.releaseAllTokens();

          const individualRelease = unreleasedAmount.div(10);
          const beneficiary = await vesting.getBeneficiary(3);
          const beneficiaryBalance = await vesting.balanceOf(beneficiary);

          assert.equal(
            individualRelease.toString(),
            beneficiaryBalance.toString()
          );
        });
      });
    });
