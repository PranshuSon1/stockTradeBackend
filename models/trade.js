import mongoose from "mongoose";


const tradeSchema = new mongoose.Schema({
  stock_name: String, 
  quantity: Number, 
  trade_type: { type: String, enum: ["CREDIT", "DEBIT"] },
  broker_name: String,
  price: Number, 
  amount: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Trade", tradeSchema);
