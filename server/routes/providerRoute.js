import express from 'express'




import { registerProvider, getProviders, verifyProvider, rejectProvider, loginProvider, allProviders,serviceName, providerBlock, unblock, checkprovider, getrequest, acceptBooking,getUpcoming ,getAllBookings,cancelBooking,completeBooking,getallStats, Logoutprovider} from '../controller/providerController.js'


const serviceRoute = express.Router()




serviceRoute.post('/emp', registerProvider)
serviceRoute.get('/providers', getProviders)
serviceRoute.put('/provider/verify/:id', verifyProvider)
serviceRoute.delete('/provider/reject/:id', rejectProvider)
serviceRoute.post('/providerlogin', loginProvider)
serviceRoute.get('/allproviders', allProviders)
serviceRoute.put('/block/:id', providerBlock)
serviceRoute.put('/unblock/:id', unblock)
serviceRoute.post('/checkprovider', checkprovider)
serviceRoute.post('/provider/requests', getrequest)
serviceRoute.put('/boookings/accept/:id', acceptBooking)
serviceRoute.get('/upcoming/:id',getUpcoming)
serviceRoute.get('/allbookings/:id',getAllBookings)
serviceRoute.post('/cancel/:id',cancelBooking)
serviceRoute.get('/servicename/:id',serviceName)

serviceRoute.get("/getstatistics/:id",getallStats)
serviceRoute.post("/logout",Logoutprovider)


serviceRoute.post("/verifyotp/:bookingId",completeBooking)



export default serviceRoute