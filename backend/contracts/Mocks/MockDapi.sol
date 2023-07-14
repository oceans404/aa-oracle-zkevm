// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title This is a mock contract to simulate a dAPI Proxy Contract.

contract MockDapiProxy {

    int224 public value;
    uint32 public timestamp;

    function setDapiValues(int224 _value, uint32 _timestamp) external {
        value = _value;
        timestamp = _timestamp;
    }

    function read()
        external
        view
        returns (int224 _value, uint32 _timestamp)
    {
        _value = value;
        _timestamp = timestamp;
    }
}