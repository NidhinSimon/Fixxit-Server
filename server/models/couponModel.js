import mongoose from "mongoose";



const couponSchema = mongoose.Schema({
    couponName: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    expiresIn: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps:true
})

const coupon = mongoose.model('coupon', couponSchema)
export default coupon

