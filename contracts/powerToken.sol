//SPDX-License-Identifier: MIT
pragma solidity <=0.8.19;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract powerToken is ERC20, Ownable {
    constructor(address _initialOwner) ERC20("PowerToken", "PWR") {
        Ownable(_initialOwner);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public {
        _burn(_from, _amount);
    }
}
    