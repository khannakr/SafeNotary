# Secure File Notarization Using Blockchain and Zero-Knowledge Proofs

This project provides a secure, privacy-preserving file notarization system leveraging Ethereum blockchain, IPFS, and Zero-Knowledge Proofs (ZKPs). It ensures that files can be verified for integrity without 
revealing their contents, making it ideal for applications requiring privacy, such as legal or confidential documents.

## Key Features

- File Encryption: Files are encrypted client-side before upload, ensuring data privacy.
- IPFS Integration: Encrypted files are stored on IPFS, providing decentralized and tamper-proof storage.
- Hashing & ZKP: The encrypted file’s hash is generated, and a zero-knowledge proof is created to prove ownership and integrity without revealing the actual hash.
- Smart Contract Storage: The file’s CID, ZKP of the hash, real filename, and timestamp are stored on the Ethereum blockchain.
- Integrity Verification: Anyone can verify a file’s integrity by retrieving data from the blockchain, downloading the encrypted file via CID, hashing it again, and verifying the ZKP.

## Tech Stack

# Blockchain & ZKP
- Ethereum Sepolia Testnet (via MetaMask and Alchemy)
- Solidity Smart Contracts
- Hardhat for smart contract development
- snarkjs / circom for Zero-Knowledge Proof generation and verification

# Frontend
- React.js
- Web3.js / ethers.js for blockchain interaction
- File encryption using crypto-js

# Backend
- Node.js, Express
- IPFS HTTP Client for IPFS uploads
- ZKP verification logic
- MongoDB (for temporary ZKP and CID storage during development)
