//SPDX-License-Identifier: MIT
pragma solidity =0.8.19;


import "/Users/Manan/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "/Users/Manan/node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract powerToken is ERC20, Ownable {
    constructor() ERC20("PowerToken", "PWR") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
    