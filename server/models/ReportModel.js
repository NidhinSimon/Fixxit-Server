import mongoose from "mongoose";



const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    reportReason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "blocked", "rejected"],
        default: "pending"

    }
})

const Report = mongoose.model('Report', reportSchema)
export default Report