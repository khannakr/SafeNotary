const crypto = require('crypto');
const fs = require('fs');

// Function to decrypt an encrypted PDF file using AES
function decryptPDF(inputPDFPath, outputPDFPath, key) {
    // Read the encrypted file (with IV included)
    const encryptedData = fs.readFileSync(inputPDFPath);

    // Extract the IV from the first 16 bytes
    const iv = encryptedData.slice(0, 16);
    const encryptedFileData = encryptedData.slice(16);

    // Create AES cipher using CBC mode
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // Decrypt the data
    let decryptedData = Buffer.concat([decipher.update(encryptedFileData), decipher.final()]);

    // Remove PKCS7 padding
    const padLength = decryptedData[decryptedData.length - 1];
    decryptedData = decryptedData.slice(0, -padLength);

    // Write the decrypted data to the output PDF file
    fs.writeFileSync(outputPDFPath, decryptedData);
    
    console.log(`Encrypted PDF file '${inputPDFPath}' decrypted successfully and saved as '${outputPDFPath}'`);
}

// Read the key from the saved file
const key = fs.readFileSync('encryption_key.key'); // This should be the same 32-byte key used during encryption

// Example usage
const inputPDF = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary\\prj\\output.pdf';
const outputPDF = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary\\prj\\output2.pdf';

decryptPDF(inputPDF, outputPDF, key);
