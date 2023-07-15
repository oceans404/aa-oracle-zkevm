// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@api3/contracts/v0.8/interfaces/IProxy.sol";

/// Stable Token Exchange
/// @dev Contract to exchange between ETH and a stable ERC20 token, using an external data feed for price.
error StalePrice();
error NoValue();

contract TokenExchange is ERC20Burnable, Ownable {
    
    /// @notice Address of the external data feed proxy
    address public proxyAddress;

    /// @dev Constructor initializes ERC20 token with name and symbol
    constructor() ERC20("Stable", "STA") {}

    /// @notice Set the address of the data feed proxy contract
    /// @dev Only callable by the contract owner
    /// @param _proxyAddress The address of the data feed proxy
    function setProxyAddress(address _proxyAddress) public onlyOwner {
        proxyAddress = _proxyAddress;
    }

    /// @notice Reads the data from the proxy contract
    /// @return price The price from the data feed
    /// @return timestamp The timestamp of the last update from the data feed
    function readDataFeed() public view returns (uint256 price, uint256 timestamp) {
        (int224 value, uint256 timestamp) = IProxy(proxyAddress).read();
        //convert price to UINT256
        uint256 price = uint224(value);
        return (price, timestamp);
    }

    /// @notice Deposit ETH and mint equivalent Stable tokens
    /// @dev The amount of tokens minted is based on the current price feed
    function depositCollateral() external payable {
        if (msg.value == 0) revert NoValue();
        (uint256 price, uint256 time) = readDataFeed();
        // if(time < (block.timestamp - 1 minutes)) revert StalePrice();
        uint256 amount = (msg.value * price) / (1e18);
        _mint(msg.sender, amount);
    }

    /// @notice Burn Stable tokens and reclaim equivalent ETH
    /// @dev The amount of ETH sent is based on the current price feed
    /// @param _amount The amount of Stable tokens to burn
    function reclaimEth(uint256 _amount) external {
        if (_amount == 0) revert NoValue();
        (uint256 price, uint256 time) = readDataFeed();
        // if(time < (block.timestamp - 1 minutes)) revert StalePrice();
        uint256 ethAmount = (_amount * 1e18) / price;
        _burn(msg.sender, _amount);
        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "Failed refund eth");
    }
}
