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
    origin: "https://fixxit-user.vercel.app/",
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

// app.post('/checkout', async (req, res) => {
//   console.log('inside checkout route');

//   console.log(req.body, "______------->>>>>>>>>")
//   const total = req.body.total

//   if (isNaN(total)) {
//     return res.status(400).json({ error: 'Invalid total amount' });
//   }

//   try {
//     const customer = await stripe.customers.create({
//       metadata: {
//         userId: req.body.userId,
//         cart: JSON.stringify(req.body.cart),
//         date: req.body.date,
//         address: req.body.address,
//         latitude: req.body.latitude,
//         longitude: req.body.longitude,
//         total: total,
//         name: req.body.name
//       },
//     });



//     session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       customer: customer.id,
//       line_items: [
//         {
//           price_data: {
//             currency: 'inr',
//             product_data: {
//               name: 'Total Amount',
//             },
//             unit_amount: total * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: 'http://localhost:3000/success',
//       cancel_url: 'http://localhost:3000/cancel',
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: 'An error occurred......' });
//   }
// });


// const endpointSecret = "whsec_895129302214904687488a5d9440622b6146a5307d8735ad6c4327ebbaf7b34f";

// app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {

//   const sig = req.headers['stripe-signature'];

//   try {

//     const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

//     const data = event.data.object;
//     const eventType = event.type;

//     if (eventType === 'checkout.session.completed') {
//       stripe.customers.retrieve(data.customer).then((customer) => {

//         createOrder(customer, data, io, res)
//       }).catch((err) => {
//         console.log(err.message, "______________-");
//       });
//     }

//     res.send().end();
//   } catch (err) {
//     console.log('Webhook Error:', err.message);
//     res.status(400).send(`Webhook Error: ${err.message}`);
//   }
// });



// let session


// const createOrder = async (customer, data, io, res, session) => {
//   if (customer && customer.metadata && customer.metadata.cart) {
//     try {
//       const items = JSON.parse(customer.metadata.cart);

//       const serviceNames = items.map(item => item.name);

//       console.log(serviceNames, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~+==============================================~~~")
//       const newOrder = new Booking({
//         bookingId: data._id,
//         userId: customer.metadata.userId,
//         paymentId: data.payment_intent,
//         services: items,
//         serviceName: serviceNames,
//         userName: customer.metadata.name,
//         Total: customer.metadata.total,
//         payment_status: data.payment_status,
//         address: customer.metadata.address,
//         date: customer.metadata.date,
//         latitude: customer.metadata.latitude,
//         longitude: customer.metadata.longitude,
//       });

//       newOrder.status = 'pending';
//       const newBooking = await newOrder.save();
//       console.log(newBooking, '.....---------------------------------------------------------------------')
//       const serviceId = items[0].serviceId;
//       console.log(serviceId, '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
//       const service = await Service.findById(serviceId);

//       const category = service.category;

//       const providersInCategory = await Provider.find({ category });

//       console.log(providersInCategory, "+++++++++++++++++++++++++++++++++++++++++++++++")
//       const userLocation = {
//         latitude: customer.metadata.latitude,
//         longitude: customer.metadata.longitude,
//       };
//       console.log(userLocation, ">>>>>")

//       const providersWithDistances = providersInCategory.map((provider) => {
//         const providerLocation = {
//           latitude: provider.latitude,
//           longitude: provider.longitude,
//         };
//         console.log(providerLocation, '{}{{}{}{}{}{}{}{')
//         const distance = geolib.getDistance(userLocation, providerLocation);
//         console.log(distance, "-----------------------------------------------------distance--------------------------------------------------------------");
//         return { ...provider._doc, distance };
//       });

//       providersWithDistances.sort((a, b) => a.distance - b.distance);

//       const maxDistance = 300000; //30km

//       const nearbyProviders = providersWithDistances.filter(
//         (provider) => provider.distance <= maxDistance
//       );

//       console.log(nearbyProviders, ">>>>>>>>>>>>>>>..")

//       console.log(newBooking, "Booking created");

//       nearbyProviders.forEach((provider) => {
//         console.log("ISNIDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE", `${provider._id}`);
//         io.to(`provider_${provider._id}`).emit('new-booking-for-provider', { booking: newBooking });
//       });
//       cron.schedule('*/10 * * * *', async () => {
//         const currentTime = Date.now();
//         const timeThreshold = 10 * 60 * 1000;

//         const unacceptedBookings = await Booking.find({
//           status: 'pending',
//           createdAt: { $lt: new Date(currentTime - timeThreshold) },
//         });

//         for (const booking of unacceptedBookings) {
//           const refund = booking.Total
//           console.log(refund, '>>>>>>')


//           console.log("inside cron")
//           booking.status = 'canceled'
//           const canceledBooking = await booking.save();
//           await updateUserwallet(booking.userId, refund)
//           console.log(canceledBooking, '>>>>>>>>>>>>>>>>>>>>>>')
//           io.emit('cancel-booking', { bookingId: canceledBooking._id });

//         }
//       })

//       console.log('Booking notifications sent to nearby providers');
//     } catch (error) {
//       console.log(error.message, "An error occurred in create order");
//     }
//   } else {
//     console.log('Error: customer.metadata.cart is undefined or null');
//   }
// };

// const updateUserwallet = async (userId, refund) => {
//   console.log('ssusususususuysuysuysuysuysuysuys')
//   try {
//     const user = await User.findById(userId)
//     user.Wallet += refund

//     await user.save()
//     console.log(`User ${user._id}'s wallet balance updated: $${user.Wallet}`);

//   } catch (error) {
//     console.log(error.message)
//   }
// }









// const sendNotification = async (newBooking, items,io,customer) => {

//   try {

//     const serviceId = items[0].serviceId;


//     const service = await Service.findById(serviceId);

//     const category = service.category;

//     const providersInCategory = await Provider.find({ category });


//     const userLocation = {
//       latitude: customer.metadata.latitude,
//       longitude: customer.metadata.longitude,
//     };


//     const providersWithDistances = providersInCategory.map((provider) => {
//       const providerLocation = {
//         latitude: provider.latitude,
//         longitude: provider.longitude,
//       };
//       const distance = geolib.getDistance(userLocation, providerLocation);
//       console.log(distance, "-------------------------------------------------------------------------------------------------------------------");
//       return { ...provider._doc, distance };
//     });


//     providersWithDistances.sort((a, b) => a.distance - b.distance);


//     const maxDistance = 300000; //30km

//     const nearbyProviders = providersWithDistances.filter(
//       (provider) => provider.distance <= maxDistance
//     );

//     console.log(newBooking, "Booking created");

//     nearbyProviders.forEach((provider) => {

//       io.to(`provider_${provider._id}`).emit('new-booking-for-provider', { booking: newBooking });
//     });

//     console.log('Booking notifications sent to nearby providers');

//   } catch (error) {
//     console.log(error.message, "error in the sendNotification")
//   }


// }









app.use('/', (req, res) => {
  res.json({ message: 'server ready' });
});



