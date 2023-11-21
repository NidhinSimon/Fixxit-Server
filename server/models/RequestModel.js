import mongoose from "mongoose";


const requestSchema = new mongoose.Schema({
  
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  
});

const Request = mongoose.model('Request', requestSchema);

export default Request
