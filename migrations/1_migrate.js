const PowerToken = artifacts.require("powerToken");
const BatterySwapContract = artifacts.require("swap");

module.exports = async function(deployer) {
  await deployer.deploy(PowerToken);
  const powerToken = await PowerToken.deployed();
  // Deploy BatterySwapContract with the address of the deployed powerToken contract
  await deployer.deploy(BatterySwapContract, powerToken.address);
};