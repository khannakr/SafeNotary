// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FileNotarization {
    struct NotarizedFile {
        string fileName;      // File name
        string cid;           // IPFS CID
        string zkp;           // Zero-Knowledge Proof
        uint256 timestamp;    // Timestamp of notarization
        string verificationKey; // Verification key for the file
    }

    mapping(string => NotarizedFile) public notarizedFiles;
    mapping(string => string) public verificationKeyToFileName; // Map verification keys to file names

    event FileNotarized(string indexed fileName, string cid, string zkp, uint256 timestamp, string verificationKey);

    // Store proof function with verification key
    function storeProof(
        string memory _fileName,
        string memory _cid,
        string memory _zkp,
        uint256 _timestamp,
        string memory _verificationKey
    ) public {
        // Ensure inputs are not empty
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(bytes(_verificationKey).length > 0, "Verification key cannot be empty");
        
        // Ensure the file is not already notarized by filename
        require(bytes(notarizedFiles[_fileName].fileName).length == 0, "File already notarized");
        
        // Ensure the verification key is not already used
        require(bytes(verificationKeyToFileName[_verificationKey]).length == 0, "Verification key already used");

        // Store the file data using the filename as the key
        notarizedFiles[_fileName] = NotarizedFile(_fileName, _cid, _zkp, _timestamp, _verificationKey);
        
        // Map verification key to file name
        verificationKeyToFileName[_verificationKey] = _fileName;
        
        emit FileNotarized(_fileName, _cid, _zkp, _timestamp, _verificationKey);
    }

    // Retrieve file proof by filename
    function getFileProof(string memory _fileName) public view returns (
        string memory fileName,
        string memory cid,
        string memory zkp,
        uint256 timestamp,
        string memory verificationKey
    ) {
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(notarizedFiles[_fileName].fileName).length != 0, "File not found");
        
        NotarizedFile memory file = notarizedFiles[_fileName];
        return (file.fileName, file.cid, file.zkp, file.timestamp, file.verificationKey);
    }

    // Retrieve file proof by verification key
    function getFileProofByVerificationKey(string memory _verificationKey) public view returns (
        string memory fileName,
        string memory cid,
        string memory zkp,
        uint256 timestamp,
        string memory verificationKey
    ) {
        require(bytes(_verificationKey).length > 0, "Verification key cannot be empty");
        
        string memory fileNameVal = verificationKeyToFileName[_verificationKey];
        require(bytes(fileNameVal).length != 0, "No file found with this verification key");
        
        NotarizedFile memory file = notarizedFiles[fileNameVal];
        return (file.fileName, file.cid, file.zkp, file.timestamp, file.verificationKey);
    }

    // Retrieve file details by filename (same as getFileProof but with a require)
    function getFileDetails(string memory _fileName) public view returns (
        string memory fileName,
        string memory cid,
        string memory zkp,
        uint256 timestamp,
        string memory verificationKey
    ) {
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(notarizedFiles[_fileName].fileName).length != 0, "File not found");

        NotarizedFile memory file = notarizedFiles[_fileName];
        return (file.fileName, file.cid, file.zkp, file.timestamp, file.verificationKey);
    }
}
