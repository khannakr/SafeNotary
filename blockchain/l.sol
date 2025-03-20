// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string public message = "Hello, Solidity!";

    function setMessage(string memory _message) public {
        message = _message;
    }
}
