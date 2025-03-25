const mongoose = require("mongoose");

// Define schema for storing file details
const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  ipfsHash: { type: String, required: true, unique: true },
  uploadedAt: { type: Date, default: Date.now },
  zkp: {type: String, }
  
});

// Create and export the File model
const File = mongoose.model("File", fileSchema);
module.exports = File;
