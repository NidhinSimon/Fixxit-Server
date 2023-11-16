import Chat from "../models/ChatModel.js";
import Provider from "../models/providerModel.js";
import User from "../models/userModel.js";
// const accessChat = async (req, res) => {
//     try {
//         const { providerId } = req.body;

//         if (!providerId) {
//             console.log("Provider ID not provided.");
//             return res.sendStatus(400);
//         }

//         // Check if a chat between the current user and the provider already exists
//         const isChat = await Chat.findOne({
//             "users.user": req.user._id,
//             "users.provider": providerId,
//         });

//         if (isChat) {
//             // Chat already exists, send the existing chat data
//             const populatedChat = await Chat.populate(isChat, {
//                 path: "users.user users.provider latestMessage.sender",
//                 select: "name profileimage email",
//             });

//             res.send(populatedChat);
//         } else {
//             // Create a new chat if it doesn't exist
//             const chatData = {
//                 chatName: "sender",
//                 users: [{ user: req.user._id, provider: providerId }],
//             };

//             const createChat = await Chat.create(chatData);

//             // Populate the chat data before sending it
//             const fullChat = await Chat.populate(createChat, {
//                 path: "users.user users.provider latestMessage.sender",
//                 select: "name profileimage email",
//             });

//             res.status(200).send(fullChat);
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// };



// const FetchChat = async (req, res) => {
//     try {
//         Chat.find({
//             "users.user": req.user._id,
//         })
//             .populate({
//                 path: "users.user",
//                 select: "name profileimage email",
//             })
//             .populate({
//                 path: "users.provider",
//                 select: "name profileimage email",
//             })
//             .populate('latestMessage')
//             .sort({ updatedAt: -1 })
//             .then(async (results) => {
//                 results = await User.populate(results, {
//                     path: "latestMessage.sender",
//                     select: "name profileimage email",
//                 });
//                 res.json(results)
//                 console.log(results,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>)")
//             });

//     } catch (error) {
//         console.log(error.message);
//     }
// }




const createChat = async (req, res) => {
    const { userId, providerId } = req.body;
  
    try {
     
      const existingChat = await Chat.findOne({
        members: { $all: [userId, providerId] },
      });
  
      if (existingChat) {
       
        res.json(existingChat);
      } else {
 
        const newChat = new Chat({
          members: [userId, providerId],
        });
        const result = await newChat.save();
        res.json(result);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Chat creation failed" });
    }
  };
  


const userChat = async (req, res) => {
    try {
        const chat = await Chat.find({
            members: { $in: [req.params.userId] }
        })
        res.json(chat)
    } catch (error) {
        console.log(error.message)
    }
}


const findChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            members: { $all: [req.params.firstId, req.params.secondId] }
        })
        res.json(chat)
    } catch (error) {
        console.log(error.message)
    }
}


const getuserData = async (req, res) => {
    const { id } = req.params;

    try {

        const isUser = await User.findById(id);
        const isProvider = await Provider.findById(id);

        if (isUser) {

            const userData = await User.findById(id);
            res.json(userData);
        } else if (isProvider) {

            const providerData = await Provider.findById(id);
            res.json(providerData);
        } else {
            res.status(404).json({ error: "User or Provider not found" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export {
    createChat,
    userChat,
    findChat,
    getuserData
}