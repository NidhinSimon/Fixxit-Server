import Message from "../models/MessageModal.js";




export const addMessage=async(req,res)=>{
const {chatId,senderId,text}=req.body

const message=new Message({
    chatId,
    senderId,
    text
})

try {
    const result=await message.save()
    res.json(result)
} catch (error) {
   console.log(error.message) 
}
}



export const getMessages=async(req,res)=>{
    const {chatId}=req.params


    try {
        const result=await Message.find({chatId})
        res.json(result)
    } catch (error) {
        console.log(error.message)
    }
}