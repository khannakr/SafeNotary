// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FileNotarization {
    struct NotarizedFile {
        string fileName;      // File name
        string cid;           // IPFS CID
        string zkp;           // Zero-Knowledge Proof
        uint256 timestamp;    // Timestamp of notarization
    }

    mapping(string => NotarizedFile) public notarizedFiles;

    event FileNotarized(string indexed fileName, string cid, string zkp, uint256 timestamp);

    // Store proof function
    function storeProof(
        string memory _fileName,
        string memory _cid,
        string memory _zkp,
        uint256 _timestamp
    ) public {
        // Ensure the file is not already notarized by filename
        require(bytes(notarizedFiles[_fileName].fileName).length == 0, "File already notarized");

        // Store the file data using the filename as the key
        notarizedFiles[_fileName] = NotarizedFile(_fileName, _cid, _zkp, _timestamp);
        emit FileNotarized(_fileName, _cid, _zkp, _timestamp);

        // Ensure the CID is not already used (optional check)
        require(bytes(notarizedFiles[_cid].cid).length == 0, "CID already notarized");

        // Store the same data with the CID as the key
        notarizedFiles[_cid] = NotarizedFile(_fileName, _cid, _zkp, _timestamp);
        emit FileNotarized(_fileName, _cid, _zkp, _timestamp);
    }

    // Retrieve file proof by filename
    function getFileProof(string memory _fileName) public view returns (
        string memory fileName,
        string memory cid,
        string memory zkp,
        uint256 timestamp
    ) {
        NotarizedFile memory file = notarizedFiles[_fileName];
        return (file.fileName, file.cid, file.zkp, file.timestamp);
    }

    // Retrieve file proof by CID
    function getFileProofByCID(string memory _cid) public view returns (
        string memory fileName,
        string memory cid,
        string memory zkp,
        uint256 timestamp
    ) {
        NotarizedFile memory file = notarizedFiles[_cid];
        return (file.fileName, file.cid, file.zkp, file.timestamp);
    }

    // Retrieve all file details by filename
    function getFileDetails(string memory _fileName) public view returns (
        string memory fileName,
        string memory cid,
        string memory zkp,
        uint256 timestamp
    ) {
        require(bytes(notarizedFiles[_fileName].fileName).length != 0, "File not found");

        NotarizedFile memory file = notarizedFiles[_fileName];
        return (file.fileName, file.cid, file.zkp, file.timestamp);
    }
}
