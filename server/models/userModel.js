import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    profileimage: {
        type: String,
        default: 'https://img.freepik.com/premium-vector/man-character_665280-46970.jpg?w=740'
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    addresses: [
        {
            address: String,
            longitude: Number,
            latitude: Number
        }
    ],
    cart: [
        {
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
            quantity: { type: Number, required: true, default: 1 },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            _id: false
        },
    ],
    Wallet: {
        type: Number,
        default: 0
    },
    EndOtp:{
        type:Number
    },
    role:{
        type:String,

    },
    wishlist: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
      ],




}, {
    timestamps: true
})

const User = mongoose.model('Users', userSchema
)
export default User