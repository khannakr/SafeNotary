import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    pdf_url: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    encryptedFileCID: {
        type: String,        // CID from IPFS
        required: true
    },
    decryptionKey: {
        type: String,        
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    zkp: {
        type: String
    },
    verificationKey: {
        type: String
    },
}, { timestamps: true });   // Adds createdAt and updatedAt fields automatically

// Create the model named "File"
const File = mongoose.model("File", fileSchema);

export default File;
