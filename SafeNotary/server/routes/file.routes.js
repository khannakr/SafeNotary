const express = require('express');
const router = express.Router();
const FileController = require('../controllers/file.controller');

// Route to fetch an encrypted file from IPFS
router.get('/file/:filename', FileController.getEncryptedFile);

// Route to fetch the decryption key from MongoDB
router.get('/key/:filename', FileController.getDecryptionKey);

module.exports = router;