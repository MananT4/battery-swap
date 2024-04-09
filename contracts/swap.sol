// SPDX-License-Identifier: MIT
pragma solidity <=0.8.19;

import "./powerToken.sol";
/*Function Paramter Variables: _variableName
*Everything else in camelCase: variableName,  functionName, contractName
*Two blank lines before contracts
*One blank line before functions
*/

//Use web3.js functions to interact with the contract: getAccount, getBalane, currentProvider, getBlock, getTransaction


/*Order Layout for sol file:
*SPDX-License-Identifier
*pragma solidity
*import statements
*interfaces
*libraries
*contracts
*/

//Battery structure to maaintain the state of the battery: id, percent, lastUser, location (vehicle, batterystation)

contract swap {
  /*Order Layout for contract:
  *Type declarations
  *State variables
  *Events
  *Errors
  *Modifiers
  *Methods
  */

  powerToken public token;
  address payable public owner;
  address payable contractAddress;
  uint256 public tokenPrice = 4; //4 wei per token
  bool internal reentrancyLock = false;

  //Battery structure to maintain the state of the battery
  struct battery {
    uint256 id;
    uint256 percent;
    address lastUser;
    uint8 location; //0 for vehicle, 1 for battery station. More effeciency in gas usage than string
  }

  mapping (uint256 => battery) public batteryMap; //Mapping ID to Battery

  //Battery Station structure to maintain the state of the battery station
  struct batteryStation {
    uint256 id;
    mapping (uint256 => battery) batteries; //Maps of all batteries in the battery station
  }

  mapping (uint256 => batteryStation) public batteryStationMap; //Mapping ID to Battery Station

  //Constructor to deploy the contract with the token's address
  //Transfer ownership of the token to this contract
  constructor(address _tokenAddress) payable {
    owner = payable(msg.sender); //Set the owner of the contract to the EOA that deployed the contract
    contractAddress = payable(address(this));
    token = powerToken(_tokenAddress); //Deploy the contract with the token's address
    token.transferOwnership(address(this)); //Transfer ownership of the token to this contract
  }

  //Modifier ownerOnly to restrict access to the owner
  modifier ownerOnly() {
    require(msg.sender == owner, "Only the owner can call this function");
    _;
  }

  //Modifier for reentrancy guard
  modifier reentrancyGuard() {
    require(!reentrancyLock, "Reentrancy guard");
    reentrancyLock = true;
    _;
    reentrancyLock = false;
  }

  //Receive function to accept ether
  receive() external payable {
    //Emit an event to log the amount of ether received
  }

  //Function to buy tokens
  function buyTokens() public payable reentrancyGuard() {
    //Ensure user can buy at least one token
    require(msg.value > tokenPrice * 100, "A minimum of 400 wei is required to buy a minimum of 100 tokens");
    //Ensure user has enough balance to buy tokens
    require(msg.value < msg.sender.balance, "Insufficient ETH balance to buy tokens");
    uint256 amount = msg.value;
    uint256 tokens = amount / tokenPrice; //Calculate the number of tokens to transfer 
    uint256 cost = tokens * tokenPrice; //Calculate the cost of the tokens
    uint256 refund = amount - cost; //Calculate the refund amount
    token.mint(msg.sender, tokens); //Transfer tokens to user

    //Refund the user if they overpaid
    if (refund > 0) {
      payable(msg.sender).transfer(refund);
    }
  }

  //Funtion to spend tokens to use the battery swap service
  function spendTokens(uint256 _tokens) public reentrancyGuard() {
    //Ensure user has enough tokens to spend
    require(token.balanceOf(msg.sender) >= _tokens, "Insufficient tokens to spend");
    token.transfer(contractAddress, _tokens); //Transfer tokens to contract

    //Perform battery swap service

    token.burn(contractAddress, _tokens); //Burn tokens from contract
  }

  //Get Balance of the calling user
  function getBalance() public view returns (uint256) {
    return token.balanceOf(msg.sender);
  }

  //Returns total Supply
  function totalSupply() public view returns (uint256) {
    return token.totalSupply();
  }

  //Add a battery
  function addBattery(uint256 _id, uint256 _percent, uint8 _location) public ownerOnly {
    batteryMap[_id] = battery(_id, _percent, address(0), _location);
  }

  //Remove a battery
  function removeBattery(uint256 _id) public ownerOnly {
    delete batteryMap[_id];
  }

  //Add a battery station
  function addBatteryStation(uint256 _id) public ownerOnly {
    batteryStationMap[_id] = batteryStation(_id);
  }

  //Remove a battery station
  function removeBatteryStation(uint256 _id) public ownerOnly {
    delete batteryStationMap[_id];
  }

  //Add a battery to a battery station
  function addBatteryToStation(uint256 _stationId, uint256 _batteryId, uint256 _percent, uint8 _location) public ownerOnly {
    batteryStationMap[_stationId].batteries[_batteryId] = battery(_batteryId, _percent, address(0), _location);
  }

  //Add a battery to a battery station with ID
  function addBatteryToStation(uint256 _stationId, uint256 _batteryId) public ownerOnly {
    batteryStationMap[_stationId].batteries[_batteryId] = batteryMap[_batteryId];
  }

  //Remove a battery from a battery station
  function removeBatteryFromStation(uint256 _stationId, uint256 _batteryId) public ownerOnly {
    delete batteryStationMap[_stationId].batteries[_batteryId];
  }

  //Swap a battery from a vehicle to a battery station
  function swapToStation(uint256 _batteryId, uint256 _stationId) public {
    //Ensure battery exists
    require(batteryMap[_batteryId].id == _batteryId, "Battery does not exist");
    //Ensure battery station exists
    require(batteryStationMap[_stationId].id == _stationId, "Battery station does not exist");
    //Ensure battery is in a vehicle
    require(batteryMap[_batteryId].location == 0, "Battery is not in a vehicle");
    //Ensure battery station has space
    require(batteryStationMap[_stationId].batteries[_batteryId].id != _batteryId, "Battery station is full");

    batteryMap[_batteryId].location = 1; //Change battery location to battery station
    batteryMap[_batteryId].lastUser = msg.sender; //Set last user to the caller
    batteryStationMap[_stationId].batteries[_batteryId] = batteryMap[_batteryId]; //Add battery to battery station
    delete batteryMap[_batteryId]; //Remove battery from vehicle
  }
}
