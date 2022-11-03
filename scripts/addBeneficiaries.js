const { ethers } = require("hardhat");

const counter = 1;

async function main() {
  const accounts = await ethers.getSigners();
  const player = accounts[counter].address;
  counter++;
  const vesting = await ethers.getContract("Vesting");
  await vesting.addBeneficiery(player);
  const currentBeneficiaries = (
    await vesting.getTotalBeneficiaries()
  ).toString();
  console.log(currentBeneficiaries);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
