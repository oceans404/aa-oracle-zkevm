// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@api3/contracts/v0.8/interfaces/IProxy.sol";

error StalePrice();
error NoValue();

contract Stable is ERC20Burnable, Ownable {
    address public proxyAddress;

    constructor() ERC20("Stable", "STA") {}

    // Updating the proxy contract address is a security-critical
    // action. In this example, only the owner is allowed to do so.
    function setProxyAddress(address _proxyAddress) public onlyOwner {
        proxyAddress = _proxyAddress;
    }

    function readDataFeed() public view returns (uint256, uint256) {
        (int224 value, uint256 timestamp) = IProxy(proxyAddress).read();
        //convert price to UINT256
        uint256 price = uint224(value);
        return (price, timestamp);
    }

    //Mint
    function depositCollateral() external payable {
        if (msg.value == 0) revert NoValue();
        (uint256 price, uint256 time) = readDataFeed();
        // if(time < (block.timestamp - 1 minutes)) revert StalePrice();
        uint256 amount = (msg.value * price) / (1e18);
        _mint(msg.sender, amount);
    }

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
