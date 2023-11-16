import mongoose from "mongoose";
const walletHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  ProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reason:{
    type:String
  }
});

const WalletHistory = mongoose.model('WalletHistory', walletHistorySchema);

export default WalletHistory
