import mongoose from "mongoose";


const categorySchema = mongoose.Schema({
    categoryimage:
    {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,

    }


})


const category = mongoose.model("category", categorySchema)
export default category