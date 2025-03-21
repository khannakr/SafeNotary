import express from 'express';
const router = express.Router();
import File from '../model/file.model.js';
router.post("/new-file", async (req, res) => {
    try{
        const { userId, pdf_url, hash, encryptedFileCID, decryptionKey, filename } = req.body;
        const newFile = new File({
            userId, 
            pdf_url,
            hash,
            encryptedFileCID,
            decryptionKey,
            filename
        })
        await newFile.save();
        
        return res.send({ok: true, file: newFile})
        
    }catch(err) {
        console.log(err);
        return res.send({
            ok: false,
            message: err.message
        });
    }
});

router.get('/get/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const response = await File.find({
            userId: userId
        })

        return res.send({ok: true, files: response})
    }catch(err) {
        console.log(err);
        return res.send({ok: false, message: err.message}) 
    }
})

router.get('/get-files/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log(userId);
    
    try {
        const response = await File.find({
            userId: userId
        })
        return res.send({ok: true, files: response})
    }catch(err) {
        console.log(err);
        return res.send({ok: false, message: err.message}) 
    }
})

export default router;