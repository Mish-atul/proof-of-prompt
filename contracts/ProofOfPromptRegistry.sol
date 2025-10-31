// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofOfPromptRegistry {
    struct Proof {
        address owner;
        uint256 timestamp;
        string metadataCID;
    }

    mapping(bytes32 => Proof) public proofs;

    event ProofRegistered(
        bytes32 indexed fingerprint,
        address indexed owner,
        uint256 timestamp,
        string metadataCID
    );

    function registerProof(bytes32 fingerprint, string calldata metadataCID) external {
        require(proofs[fingerprint].timestamp == 0, "Already registered");
        proofs[fingerprint] = Proof(msg.sender, block.timestamp, metadataCID);
        emit ProofRegistered(fingerprint, msg.sender, block.timestamp, metadataCID);
    }

    function getProof(bytes32 fingerprint)
        external
        view
        returns (
            address owner,
            uint256 timestamp,
            string memory metadataCID
        )
    {
        Proof memory p = proofs[fingerprint];
        return (p.owner, p.timestamp, p.metadataCID);
    }
}
