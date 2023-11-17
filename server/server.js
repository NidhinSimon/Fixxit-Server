import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import cors from 'cors';
import cloudinary from 'cloudinary';
import serviceRoute from './routes/providerRoute.js';
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";


import Booking from './models/BookingModel.js';

import { init } from './controller/providerController.js';

import chatRoute from './routes/chatRoute.js';
import messageRouter from './routes/MessgaeRoute.js';
import bookingRoute from './routes/bookingRoute.js';
import { hai } from './controller/bookingController.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';


const port = process.env.PORT;

dotenv.config();

connectDB();


const app = express();

const server = app.listen(port, () => {
  console.log(`server started on http://localhost:${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "https://fixxit-user.vercel.app",
  }
});


let activeUsers = []
io.on("connection", (socket) => {


  // socket.on('test',(data)=>{
  //   console.log(data,"??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????")
  // })

  // socket.join(`provider_${socket.id}`);






  socket.on('test-message', (data) => {
    console.log('Received test message from client:', data);
    socket.emit('test-message-response', 'Message received on the server');

  });

  socket.emit("test","dkdkdkdkdkhd")
  socket.on('join-provider-room', (providerId) => {
    socket.join(`provider_${providerId}`);
    console.log(`${providerId} provider joined the room`)
  });

  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id
      })

    }
    console.log("connencted", activeUsers)
    io.emit('get-users', activeUsers)
  })


  socket.on("send-message", (data) => {
    const { receiverId } = data
    const user = activeUsers.find((user) => user.userId === receiverId)
    console.log(user, ">>>>>>sendinf from socket ", receiverId)
    console.log("data", data)
    if (user) {
      io.to(user.socketId).emit("receive-message", data)
    }

  })



  // socket.on('joinChatRoom', ({ userId, providerId, bookingId }) => {
  //   const roomId = `chat_${bookingId}`;
  //   socket.join(roomId);
  //   io.to(providerId).emit('userJoined', userId);

  //   socket.on('chat message', (msg) => {

  //     io.to(roomId).emit('chat message', msg);
  //   });
  // });



  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
   
    io.emit('get-users', activeUsers)
  });
});



init(io)
hai(io)


// app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "500mb" }));


app.use(cors());


app.use(cookieParser());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  },
}))


cloudinary.v2.config({
  cloud_name: "dj8z6xx94",
  api_key: '215584545747347',
  api_secret: "3FPTZutia3Qu1cxCVRT7YcuJaBw",
  max_file_size: 50000000
});

app.use('/users', userRoutes);
app.use('/admin', adminRoute);
app.use(serviceRoute);
app.use(chatRoute)
app.use(messageRouter)
app.use(bookingRoute)

app.use(notFound)
app.use(errorHandler)




app.get('/bookings-by-month', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { month: { $month: { $dateFromString: { dateString: '$date' } } }, year: { $year: { $dateFromString: { dateString: '$date' } } } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          count: 1,
        },
      },
    ];

    const bookingsByMonth = await Booking.aggregate(pipeline);

    res.json(bookingsByMonth);
  } catch (error) {
    console.error('Error fetching booking data: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});











app.use('/', (req, res) => {
  res.json({ message: 'server ready' });
});



