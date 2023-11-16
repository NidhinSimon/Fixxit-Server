import mongoose from "mongoose";

const providerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,

    },
    mobile: {
        type: Number,
        required: true,

    },
    age: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    license: {
        type: String,
        required: true,

    },
    licenseimage: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    },
    status: {
        type: String,
        enum: ["verified", "rejected", "pending"],
        default: "pending"
    },
    profileimage: {
        type: String,
        required: true

    },
    pincode: {
        type: Number,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    location:{
        type:Array,

    },
    longitude:{
        type:Number
    },
    latitude:{
        type:Number
    },
    address:{
        type:String
    },
    socketId:{
        type:String
    },
    Wallet: {
        type: Number,
        default: 0
    },
    role:{
        type:String,

    },
}, {
    timestamps: true
});

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;
