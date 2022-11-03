const { ethers, network } = require("hardhat");
const fs = require("fs");

const FRONT_END_ADDRESSES_FILE =
  "../vesting-project-frontend/constants/contractAddresses.json";
const FRONT_END_ABI_FILE = "../vesting-project-frontend/constants/abi.json";
module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("updating frontend...");
    await updateAbi();
    await updateContractAddresses();
  }
};

async function updateAbi() {
  const vesting = await ethers.getContract("Vesting");
  fs.writeFileSync(
    FRONT_END_ABI_FILE,
    vesting.interface.format(ethers.utils.FormatTypes.json)
  );
}
async function updateContractAddresses() {
  const vesting = await ethers.getContract("Vesting");

  const chainId = network.config.chainId.toString();

  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8")
  );

  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(vesting.address)) {
      console.log("updating contract address");
      currentAddresses[chainId].push(vesting.address);
    }
  } else {
    console.log("adding new address...");
    currentAddresses[chainId] = [vesting.address];
  }

  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "frontend"];
