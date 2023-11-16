import express from 'express'
import { addMessage, getMessages } from '../controller/messageController.js'


const messageRouter = express()


messageRouter.post('/messages', addMessage)
messageRouter.get('/message/:chatId', getMessages)


export default messageRouter 