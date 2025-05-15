import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
  trade_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trade",
    required: true,
  }, 
  stock_name: { type: String, required: true }, 
  lot_quantity: { type: Number, required: true }, 
  realized_quantity: { type: Number, default: 0 },
  realized_trade_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trade",
    default: null,
  },
  lot_status: {
    type: String,
    enum: ["OPEN", "PARTIALLY REALIZED", "FULLY REALIZED"],
    default: "OPEN",
  },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Lot", lotSchema);
