// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract UploadPortal {
    uint256 totalUploads;
    uint256 private seed;
    event NewUpload(address indexed from, uint256 timestamp, string message);

    struct Upload {
        address person;
        uint256 timestamp;
        string message;
    }

    Upload[] uploads;

    mapping(address => uint256) public lastUploadTime;

    constructor() payable {
        console.log("Advanced smart contract");
    }

    function upload(string memory _message) public {
        require(
            lastUploadTime[msg.sender] + 30 seconds < block.timestamp,
            "wait 30 seconds before posting again"
        );
        lastUploadTime[msg.sender] = block.timestamp;
        totalUploads += 1;
        console.log("%s just uploaded something!", msg.sender);
        uploads.push(Upload(msg.sender, block.timestamp, _message));

        uint256 randomNumber = (block.difficulty + block.timestamp + seed) %
            100;
        console.log("random # generated: %s", randomNumber);
        seed = randomNumber;

        if (randomNumber < 10) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = .0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewUpload(msg.sender, block.timestamp, _message);
    }

    function getAllUploads() public view returns (Upload[] memory) {
        return uploads;
    }

    function getTotalUploads() public view returns (uint256) {
        return totalUploads;
    }
}
