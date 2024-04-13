const PowerToken = artifacts.require("powerToken");
const BatterySwapContract = artifacts.require("swap");

module.exports = async function(deployer) {
  await deployer.deploy(PowerToken);
  const powerToken = await PowerToken.deployed();
  // Deploy BatterySwapContract with the address of the deployed powerToken contract
  await deployer.deploy(BatterySwapContract, powerToken.address);
  const swapInstance = await BatterySwapContract.deployed();
  // Transfer ownership of the PowerToken to the Swap contract
  await powerToken.transferOwnership(swapInstance.address);
};