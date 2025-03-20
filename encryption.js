const crypto = require('crypto');
const fs = require('fs');

// Function to encrypt a PDF file using AES
function encryptPDF(inputPDFPath, outputPDFPath, key) {
    const iv = crypto.randomBytes(16); // Generate a random 128-bit IV
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    // Read the input PDF file
    const fileData = fs.readFileSync(inputPDFPath);
    
    // Pad the data to be a multiple of AES block size (16 bytes)
    const padLength = 16 - (fileData.length % 16);
    const paddedData = Buffer.concat([fileData, Buffer.alloc(padLength, padLength)]);
    
    // Encrypt the data
    const encryptedData = Buffer.concat([cipher.update(paddedData), cipher.final()]);
    
    // Write the IV and encrypted data to the output file
    fs.writeFileSync(outputPDFPath, Buffer.concat([iv, encryptedData]));
    
    console.log(`PDF file '${inputPDFPath}' encrypted successfully and saved as '${outputPDFPath}'`);
}

// Example usage
const key = crypto.randomBytes(32); // 256-bit AES key (32 bytes) - Save this key somewhere
const inputPDF = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary\\prj\\input.pdf';
const outputPDF = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary\\prj\\output.pdf';

encryptPDF(inputPDF, outputPDF, key);

// Save the key securely, as you'll need it for decryption!
fs.writeFileSync('encryption_key.key', key);
