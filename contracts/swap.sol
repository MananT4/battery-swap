// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

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
  uint256 public tokenSupply; //Keeps track of total tokens in circulation


  constructor(address _tokenAddress) payable {
    owner = payable(msg.sender);
    contractAddress = payable(address(this));
    token = powerToken(_tokenAddress); //Deploy the contract with the token's address
    token.transferOwnership(address(this)); //Transfer ownership of the token to this contract
  }

  //Receive function to accept ether
  receive() external payable {
    //Emit an event to log the amount of ether received
  }

  //Function to buy tokens
  function buyTokens() public payable {
    //Ensure user can buy at least one token
    require(msg.value > tokenPrice, "A minimum of 4 wei is required to buy one token");
    //Ensure user has enough balance to buy tokens
    require(msg.value < msg.sender.balance, "Insufficient balance to buy tokens");
    uint256 amount = msg.value;
    uint256 tokens = amount / tokenPrice; //Calculate the number of tokens to transfer 
    token.mint(msg.sender, tokens); //Transfer tokens to user
    tokenSupply += tokens; //Increase token supply 
  }

  //Funtion to spend tokens to use the battery swap service
  function spendTokens(uint256 _tokens) public {
    //Ensure user has enough tokens to spend
    require(token.balanceOf(msg.sender) >= _tokens, "Insufficient tokens to spend");
    token.transfer(contractAddress, _tokens); //Transfer tokens to contract

    //Perform battery swap service

    token.burn(contractAddress, _tokens); //Burn tokens
    tokenSupply -= _tokens; //Decrease token supply
  }
}
