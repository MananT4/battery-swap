// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./powerToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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

contract swap is Ownable {
  /*Order Layout for contract:
  *Type declarations
  *State variables
  *Events
  *Errors
  *Modifiers
  *Methods
  */

  bool private initialized = false; //Only used for init
  uint256 public nextBatteryId = 1; //Only used for init
  powerToken public token;
  address payable public swapOwner;
  address payable contractAddress;
  uint256 public tokenPrice = 400; //400 wei per token
  bool internal reentrancyLock = false; //Reentrancy guard

  //Enum for battery location
  enum batLocation {
    VEHICLE,
    STATION
  }

  //Enum for user state
  enum userState {
    SPENT,
    DEPOSITED,
    COLLECTED
  }

  mapping(address => userState) public userStates; //Mapping to track user state during the swap process

  //Battery structure to maintain the state of the battery
  struct battery {
    uint256 id;
    uint256 percent;
    //address lastUser;
    batLocation location;
  }

  mapping (uint256 => battery) public batteryMap; //Mapping ID to Battery

  mapping (address => battery) public userBattery; //Mapping user to battery

  //Constructor to deploy the contract with the token's address
  //Transfer ownership of the token to this contract
  constructor(address _tokenAddress) payable onlyOwner(){
    swapOwner = payable(msg.sender); //Set the owner of the contract to the EOA that deployed the contract
    contractAddress = payable(address(this));
    token = powerToken(_tokenAddress); //Deploy the contract with the token's address
  }

  //Modifier ownerOnly to restrict access to the owner
  modifier ownerOnly() {
    require(msg.sender == swapOwner, "Only the owner can call this function");
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
    require(msg.value > tokenPrice * 100, "A minimum of 40000 wei is required to buy a minimum of 100 tokens");
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

  // Users deposit tokens to initiate the swap process
  function depositTokens(address _user) public reentrancyGuard(){
    require(token.balanceOf(_user) >= 100, "Insufficient token balance");
    require(token.transferFrom(_user, contractAddress, 100), "Token transfer failed");
    userStates[_user] = userState.SPENT; //Update user state
  }

  //Function to deposit the battery
  function depoistBattery(uint256 _batId, address _user) public reentrancyGuard(){
    //Ensure battery ID belongs to the user
    require(userBattery[_user].id == _batId, "Battery is not in user's possession");
    //Ensure battery is in the vehicle
    require(batteryMap[_batId].location == batLocation.VEHICLE, "Battery is not in a vehicle");
    //Modify the battery location to the battery station
    batteryMap[_batId].location = batLocation.STATION;
    //Update the user state
    userStates[_user] = userState.DEPOSITED;
  }

  // Once verified, the user can collect a charged battery
  function collectBattery(uint256 _batId, address _user) public reentrancyGuard(){
    //Ensure battery ID belongs to the station
    require(batteryMap[_batId].location == batLocation.STATION, "Battery is not at the station");
    //Ensure battery is charged
    require(batteryMap[_batId].percent >=80, "Battery is not charged enough");
    //Modify the battery location to the vehicle
    batteryMap[_batId].location = batLocation.VEHICLE;
    //Modify the last user to the calling user
    userBattery[_user] = batteryMap[_batId];
    //Update the user state
    userStates[_user] = userState.COLLECTED;
    //Burn tokens from contract
    token.burn(contractAddress, 100);
  }
  

  //Get Balance of the calling user
  function getBalance(address _user) public view returns (uint256) {
    return token.balanceOf(_user);
  }

  //Returns total Supply
  function totalSupply() public view returns (uint256) {
    return token.totalSupply();
  }

  //Function to let contract owner to withdraw ether
  function withdraw() public ownerOnly {
    uint amount = address(this).balance;
    require(amount > 0, "No Ether left to withdraw");

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Failed to send Ether");
  }

  //Function to pass ownership of the token to the contract
  //Add this in test
  function transferTokenOwnership() public onlyOwner {
    token.transferOwnership(contractAddress);
  }

  // Function to initialize the contract
    function init(address[] calldata userAddresses) external onlyOwner {
        require(!initialized, "Already initialized");
        initialized = true;

        // Create 12 batteries belonging to the station
        for (uint i = 0; i < 12; i++) {
            batteryMap[nextBatteryId] = battery(nextBatteryId, 100, batLocation.STATION); // Fully charged
            nextBatteryId++;
        }

        // Create three batteries belonging to users
        for (uint i = 0; i < userAddresses.length; i++) {
            batteryMap[nextBatteryId] = battery(nextBatteryId, 20, batLocation.VEHICLE); // Assuming 20% charge
            userBattery[userAddresses[i]] = batteryMap[nextBatteryId];
            nextBatteryId++;
        }

        // Any additional setup can be added here
    }
}
