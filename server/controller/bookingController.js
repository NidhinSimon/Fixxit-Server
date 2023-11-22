import Stripe from 'stripe';
import Booking from '../models/BookingModel.js';
import Provider from '../models/providerModel.js';
import Service from '../models/serviceModel.js';

import geolib from 'geolib'

import cron from 'node-cron'
import User from '../models/userModel.js';

import otpGenerator from 'otp-generator'
import handlebars from 'handlebars';
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



import WalletHistory from '../models/wallerHistoryModal.js'
import Request from '../models/RequestModel.js';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);


let session
let io



export const hai = (i) => {
    io = i
}


const createOrder = async (customer, data, io,  ) => {
   
    if (customer && customer.metadata && customer.metadata.cart) {
        try {
            const items = JSON.parse(customer.metadata.cart);

            const serviceNames = items.map(item => item.name);
            const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false,   });

         
            // console.log(serviceNames, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~+==============================================~~~")
            const newOrder = new Booking({
                bookingId: data._id,
                userId: customer.metadata.userId,
                paymentId: data.payment_intent,
                services: items,
                serviceName: serviceNames,
                userName: customer.metadata.name,
                Total: customer.metadata.total,
                payment_status: data.payment_status,
                address: customer.metadata.address,
                date: customer.metadata.date,
                latitude: customer.metadata.latitude,
                longitude: customer.metadata.longitude,
                otp

            });



            newOrder.status = 'pending';
            newOrder.workStatus = "pending"

            const newBooking = await newOrder.save();

            console.log(newBooking,"--------booking saved--------")

            const newRequest = new Request({
                bookingId: newBooking._id, 
                userId: customer.metadata.userId,
               
            });
        
            const req=await newRequest.save();
            console.log(req,"request model saved")


         

            sendInvoice(customer,newBooking);




            // console.log(newBooking, '.....---------------------------------------------------------------------')
            // const bookingAmount = newBooking.Total
            // const updatedWalletBalance = await transferToAdminWallet(bookingAmount);
            // console.log(`Admin's updated wallet balance: ${updatedWalletBalance}`);
            const serviceId = items[0].serviceId;
          
            const service = await Service.findById(serviceId);

            const category = service.category;

            const providersInCategory = await Provider.find({ category });

            // console.log(providersInCategory, "+++++++++++++++++++++++++++++++++++++++++++++++")
            const userLocation = {
                latitude: customer.metadata.latitude,
                longitude: customer.metadata.longitude,
            };
   

            const providersWithDistances = providersInCategory.map((provider) => {
                const providerLocation = {
                    latitude: provider.latitude,
                    longitude: provider.longitude,
                };
                console.log(providerLocation, '{}{{}{}{}{}{}{}{')
                const distance = geolib.getDistance(userLocation, providerLocation);
                console.log(distance, "-----------------------------------------------------distance--------------------------------------------------------------");
                return { ...provider._doc, distance };
            });

            providersWithDistances.sort((a, b) => a.distance - b.distance);

            const maxDistance = 300000; //30km

            const nearbyProviders = providersWithDistances.filter(
                (provider) => provider.distance <= maxDistance
            );



            // console.log(newBooking, "Booking created");

            nearbyProviders.forEach((provider) => {
                console.log("ISNIDEEEEEEEEEEEEEEEEEEEEEEE------------------------------------------------EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE", `${provider._id}`);
  io.to(`provider_${provider._id}`).emit('new-booking-for-provider', { request: newRequest });
            });
            cron.schedule('*/10 * * * *', async () => {
                const currentTime = Date.now();
                const timeThreshold = 10 * 60 * 1000;

                const unacceptedBookings = await Booking.find({
                    status: 'pending',
                    createdAt: { $lt: new Date(currentTime - timeThreshold) },
                });

                for (const booking of unacceptedBookings) {
                    const refund = booking.Total
                    console.log(refund, '>>>>>>')
                    // const ioio = await reduceFromAdminWallet(refund);
                    // console.log(ioio, ")_)_)_)___)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)__)_)_)")






                    console.log("inside cron ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
                    booking.status = 'canceled'
                    const canceledBooking = await booking.save();
                    await updateUserwallet(booking.userId, refund)
                    console.log(canceledBooking, '>>>>>>>>>>>>>>>>>>>>>>')
                    io.emit('cancel-booking', { bookingId: canceledBooking._id });

                }
            })


            console.log('Booking notifications sent to nearby providers');
        } catch (error) {
            console.log(error.message, "An error occurred in create order");
        }
    } else {
        console.log('Error: customer.metadata.cart is undefined or null');
    }
};

const updateUserwallet = async (userId, refund) => {
    console.log('ssusususususuysuysuysuysuysuysuys')
    try {
        const user = await User.findById(userId)
        user.Wallet += refund

        const walletHistoryEntry = new WalletHistory({
            userId: userId,
            amount: refund,
            reason: "No Service Provider Found",
            type: "Credit",
        });

        await walletHistoryEntry.save();

        await user.save()
        console.log(`User ${user._id}'s wallet balance updated: $${user.Wallet}`);

    } catch (error) {
        console.log(error.message)
    }
}





export const checkoutController = async (req, res) => {
    console.log('inside checkout route');

    console.log(req.body, "______------->>>>>>>>>")
    const total = req.body.total

    if (isNaN(total)) {
        return res.status(400).json({ error: 'Invalid total amount' });
    }

    try {
        const customer = await stripe.customers.create({
            metadata: {
                userId: req.body.userId,
                cart: JSON.stringify(req.body.cart),
                date: req.body.date,
                address: req.body.address,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                total: total,
                name: req.body.name,
                email:req.body.email
            },
        });



        session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer: customer.id,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Total Amount',
                        },
                        unit_amount: total * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: 'https://fixxit-user.vercel.app/success',
            cancel_url: 'https://fixxit-user.vercel.app/cancel',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred......' });
    }
}


const endpointSecret = process.env.ENDPOINTSECRET

export const webhook = async (req, res) => {

    const sig = req.headers['stripe-signature'];
    console.log(req.rawBody,"=====================",endpointSecret,"---")
    

    try {

        const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

        const data = event.data.object;
        const eventType = event.type;

        if (eventType === 'checkout.session.completed') {
            stripe.customers.retrieve(data.customer).then((customer) => {

                createOrder(customer, data, io, res)
                console.log(data, "-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------", customer)
            }).catch((err) => {
                console.log(err.message, "______________-");
            });
        }

        res.send().end();
    } catch (err) {
        console.log('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
}












const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const invoiceTemplatePath = path.join(__dirname, 'invoice.html');



function sendInvoice(customer,newBooking) {

    const generateInvoiceNumber = () => {
        const prefix = 'INV'; 
        const randomNumber = Math.floor(Math.random() * 1000000); 
        return `${prefix}${randomNumber}`;
      };
    

    const randomInvoiceNumber = generateInvoiceNumber();
    console.log(randomInvoiceNumber);

    const data = {
        recipientName: customer.metadata.name,
        invoiceNumber:randomInvoiceNumber,
        amount:newBooking.Total,


    };

    const source = fs.readFileSync(invoiceTemplatePath, 'utf-8');
    const invoiceTemplate = handlebars.compile(source);
    const html = invoiceTemplate(data);
    

    console.log(html, "----------------------");
    console.log(customer.metadata.email, "========================="); 

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.NODE_MAIL,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.NODE_MAIL,
        to: customer.metadata.email, 
        subject: 'Invoice ',
        text: "Invoice Details",
        html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error.message, "erroreeeeeeeeeee");
        } else {
            console.log("email Sent" + info.response);
        }
    });
}