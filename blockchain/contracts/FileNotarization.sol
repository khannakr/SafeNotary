// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FileNotarization {
    struct NotarizedFile {
        string cid;       // IPFS CID
        string zkp;       // Zero-Knowledge Proof
        uint256 timestamp; // Timestamp of notarization
    }

    mapping(string => NotarizedFile) public notarizedFiles;

    event FileNotarized(string indexed cid, string zkp, uint256 timestamp);

    function storeProof(string memory _cid, string memory _zkp, uint256 _timestamp) public {
        require(bytes(notarizedFiles[_cid].cid).length == 0, "File already notarized");

        notarizedFiles[_cid] = NotarizedFile(_cid, _zkp, _timestamp);
        emit FileNotarized(_cid, _zkp, _timestamp);
    }

    function getFileProof(string memory _cid) public view returns (string memory, string memory, uint256) {
        NotarizedFile memory file = notarizedFiles[_cid];
        return (file.cid, file.zkp, file.timestamp);
    }
}
