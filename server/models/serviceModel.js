import mongoose from "mongoose";

const serviceSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    image: {
        type: String,
    }

}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
