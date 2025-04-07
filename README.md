# Secure File Notarization Using Blockchain and Zero-Knowledge Proofs

This project provides a secure, privacy-preserving file notarization system leveraging Ethereum blockchain, IPFS, and Zero-Knowledge Proofs (ZKPs). It ensures that files can be verified for integrity without 
revealing their contents, making it ideal for applications requiring privacy, such as confidential documents.

## Key Features

- Ensures file notarization without revealing the file content using Zero-Knowledge Proofs.
- Stores encrypted files on IPFS for decentralized and tamper-proof access.
- Records proof, CID, and timestamp immutably on the blockchain.
- Detects any file tampering during the verification process.
- Verifies authenticity without requiring access to the actual file content.
- Prevents hash leakage by using ZKP instead of storing raw hashes.
- Works for any file type, making it suitable for legal and confidential documents.
- Provides a secure and transparent system for file validation and trust.

## Tech Stack

### Frontend
- React.js
- Web3.js / ethers.js for blockchain interaction
- File encryption using crypto-js

### Backend
- Node.js, Express
- IPFS HTTP Client for IPFS uploads
- ZKP verification logic
- MongoDB (for temporary ZKP and CID storage during development)
- Ethereum Sepolia Testnet (via MetaMask and Alchemy)
- Solidity Smart Contracts
- Hardhat for smart contract development
- snarkjs / circom for Zero-Knowledge Proof generation and verification

## How It Works

### Upload Phase:

- User uploads a file.
- File is encrypted and stored on IPFS and CID is generated.
- A unique Verification Key of the file is generated. 
- Hash of the encrypted file is generated.
- A Zero-Knowledge Proof of the hash is created.
- Real filename, CID, ZKP, Verification Key and timestamp are stored on the Ethereum smart contract.

### Verification Phase:

- User enters the Verification Key for verification.
- The system fetches the stored CID, ZKP and timestamp from the blockchain based on the Verification Key.
- It downloads the encrypted file from IPFS, rehashes it, and verifies the ZKP.
- Displays whether the file is valid or tampered.

## Installations

### **1. Install Node.js**
Required for frontend, backend scripts, and tooling.

```bash
# Recommended (Node.js 18+)
https://nodejs.org/en/download/
```

Verify installation:
```bash
node -v
npm -v
```

---

### **2. Install Hardhat (for smart contract development)**

```bash
npm install --save-dev hardhat
```

Create a Hardhat project (if not done):
```bash
npx hardhat
```

---

### **3. Install IPFS**

```bash
npm install -g ipfs
ipfs init
ipfs daemon
```


---

### **4. Install Circom and SnarkJS (for ZK Proofs)**

#### **Install Circom**
Clone and build:
```bash
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
```

Add to PATH:
```bash
export PATH=$PATH:/path/to/circom/target/release
```

#### **Install SnarkJS**
```bash
npm install -g snarkjs
```

---

### **5. Install Dependencies for Project**

#### **Backend & Smart Contracts**
```bash
cd SafeNotary
npm install
```

#### **Frontend**
```bash
cd frontend
npm install
```

---

### **6. Install and Configure ZKP Setup Files**
Download Powers of Tau (e.g., `pot12_final.ptau`):
```bash
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau
```

Place this in your `/circuits` folder.

---

### **7. Optional: MetaMask + Ganache (for local testing)**
- Install **MetaMask** browser extension.
- Run local Ethereum node using `npx hardhat node`.


## **Conclusion**

This project presents a privacy-preserving solution for secure file notarization using blockchain and Zero-Knowledge Proofs (ZKPs). By combining IPFS for decentralized storage, ZKPs for private validation, and blockchain for immutable timestamping, the system ensures tamper resistance, content confidentiality, and verifiability without revealing the actual file contents. It effectively addresses critical challenges such as content integrity, proof of existence, and privacy in digital document handling.


## **Future Scope**

1. **Integration with Real-World Legal Platforms**  
   Extend the system to integrate with legal or governmental document verification portals for real-time notarization services.

2. **Support for Multiple File Formats**  
   Add support for validating file type and format (e.g., legal contracts, images, PDFs) using ZKP circuits.

3. **Off-Chain Verification System**  
   Implement lightweight off-chain verifiers that allow fast proof checking without blockchain interactions.

4. **Advanced ZKP Optimization**  
   Explore advanced ZKP systems like zk-STARKs or Bulletproofs to reduce trusted setup and improve performance.

5. **User Authentication Layer**  
   Add user identity or wallet-based access control to manage document verification permissions securely.

6. **Mobile/Web Extension**  
   Develop a browser extension or mobile app for quick notarization and verification directly from user devices.

7. **Audit Trail & Logs**  
   Provide an optional logging mechanism (on-chain or off-chain) for proof-of-access and verification history.
