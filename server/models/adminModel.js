import mongoose from "mongoose";


const adminSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    Wallet: {
        type: Number,
        default: 0
    }
})


const admin = mongoose.model('Admin',adminSchema)

export default admin

