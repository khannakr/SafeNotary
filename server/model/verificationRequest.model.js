import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    requesterId: {
        type: String,
        required: true
    },
    requesterName: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    },
    verificationKey: {
        type: String,
        default: null
    }
}, { timestamps: true });

const VerificationRequest = mongoose.model("VerificationRequest", verificationRequestSchema);

export default VerificationRequest;
