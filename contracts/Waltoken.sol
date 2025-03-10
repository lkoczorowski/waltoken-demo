// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Waltoken is ERC20, Ownable {
    // When this contract is deployed, it will mint the initial supply to the deployer
    constructor(uint256 initialSupply) ERC20("Waltoken", "WALT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** decimals())); 
    }

    // This function allows the owner to mint tokens to a specific address
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // This function allows the owner to burn tokens from the contract
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}