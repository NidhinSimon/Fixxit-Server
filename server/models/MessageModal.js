import mongoose from "mongoose";


const MessageSchema = mongoose.Schema({
chatId:{
    type:String
},
senderId:{
    type:String
},
text:{
    type:String
},
isRead: {
    type: Boolean,
    default: false, 
  },
}, {
    timestamps: true
})

const Messages = mongoose.model('Message', MessageSchema)
export default Messages