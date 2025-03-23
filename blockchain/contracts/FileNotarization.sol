// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FileNotarization {
    struct NotarizedFile {
        string fileName;     // File name
        string cid;       // IPFS CID
        string zkp;       // Zero-Knowledge Proof
        uint256 timestamp; // Timestamp of notarization
    }

    mapping(string => NotarizedFile) public notarizedFiles;
    mapping(string => string) public fileNameToCid; 

    event FileNotarized(string indexed filName, string cid, string zkp, uint256 timestamp);

    // Store proof function
    function storeProof(string memory _cid, string memory _zkp, uint256 _timestamp) public {
        require(bytes(notarizedFiles[_cid].cid).length == 0, "File already notarized");

        notarizedFiles[_cid] = NotarizedFile(_cid, _zkp, _timestamp);
        emit FileNotarized(_cid, _zkp, _timestamp);
    }

    // Retrieve file proof by CID
    function getFileProof(string memory _cid) public view returns (string memory, string memory, uint256) {
        NotarizedFile memory file = notarizedFiles[_cid];
        return (file.cid, file.zkp, file.timestamp);
    }

    //  New function: Retrieve all file details by CID
    function getFileDetails(string memory _cid) public view returns (string memory cid, string memory zkp, uint256 timestamp) {
        require(bytes(notarizedFiles[_cid].cid).length != 0, "File not found");

        NotarizedFile memory file = notarizedFiles[_cid];
        return (file.cid, file.zkp, file.timestamp);
    }
}
