const PowerToken = artifacts.require("powerToken");
const BatterySwapContract = artifacts.require("swap");

module.exports = function(deployer) {
  deployer.deploy(PowerToken).then(function() {
    return deployer.deploy(BatterySwapContract, PowerToken.address);
  });
};