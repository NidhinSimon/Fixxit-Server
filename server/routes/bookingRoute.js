import express from 'express'
import { checkoutController, webhook } from '../controller/bookingController.js'


const bookingRoute = express()

bookingRoute.post('/checkout', checkoutController)

bookingRoute.post('/webhook', express.raw({ type: 'application/json' }), webhook)

export default bookingRoute