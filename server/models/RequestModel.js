import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking', // Reference to the Booking model
  },
  status: {
    type: String,
    enum: ['pending', 'rejected', 'accepted'],
    default: 'pending',
  },
  providersReceived: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider', // Reference to the Provider model (if you have one)
    },
  ],
});

const Request = mongoose.model('Request', requestSchema);

export default Request
