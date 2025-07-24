// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract WhitelistableERC20 is ERC20, Pausable, AccessControl, Ownable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bool public isWhitelistingEnabled;
    mapping(address => bool) public whitelistedAddresses;

    event WhitelistingEnabled(bool enabled);
    event WhitelistAddressAdded(address indexed account);
    event WhitelistAddressRemoved(address indexed account);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10 ** decimals());
        _grantRole(MINTER_ROLE, msg.sender);
        isWhitelistingEnabled = true;
        whitelistedAddresses[msg.sender] = true;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        if (isWhitelistingEnabled) {
            require(
                whitelistedAddresses[from] || whitelistedAddresses[to],
                "Sender && Receiver are not whitelisted to execute transfer"
            );
        }
        super._beforeTokenTransfer(from, to, amount);
    }

    // Function to enable or disable whitelisting functionality
    function toggleWhitelisting(bool enabled) external onlyOwner {
        isWhitelistingEnabled = enabled;
        emit WhitelistingEnabled(enabled);
    }

    // Function to add an address to the whitelist
    function addAddressToWhitelist(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(!whitelistedAddresses[account], "Address is already whitelisted");
        whitelistedAddresses[account] = true;
        emit WhitelistAddressAdded(account);
    }

    // Function to remove an address from the whitelist
    function removeAddressFromWhitelist(address account) external onlyOwner {
        require(whitelistedAddresses[account], "Address is not whitelisted");
        whitelistedAddresses[account] = false;
        emit WhitelistAddressRemoved(account);
    }

    
}
