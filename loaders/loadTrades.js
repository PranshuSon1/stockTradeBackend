import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import Lot from '../models/lot.js';
import Trade from '../models/trade.js';
import { handleDebitLots } from '../utilities/lotHelper.js'; // Update path if needed

dotenv.config();

// const MONGO_URI = process.env.MONGO_URI;
// console.log('MONGO_URI :>> ', MONGO_URI);
const tradesData = JSON.parse(fs.readFileSync('./sample-data/trades.json', 'utf-8'));

const loadTrades = async () => {
  const session = await mongoose.startSession();
  try {
    await mongoose.connect('mongodb://localhost:27017/stockTrading');
    console.log('Connected to MongoDB');

    session.startTransaction();

    for (const trade of tradesData) {
      const { stock_name, trade_type, quantity, price, broker_name, sale_type = 'fifo' } = trade;
      const amount = quantity * price;

      const createdTrade = await new Trade({
        stock_name,
        trade_type,
        quantity,
        price,
        amount,
        broker_name,
      }).save({ session });

      if (trade_type === 'CREDIT') {
        await Promise.all([
          new Lot({
            trade_id: createdTrade._id,
            stock_name,
            lot_quantity: quantity,
            realized_quantity: 0,
            realized_trade_ids: [],
            lot_status: 'OPEN',
            method: 'FIFO'
          }).save({ session }),
          new Lot({
            trade_id: createdTrade._id,
            stock_name,
            lot_quantity: quantity,
            realized_quantity: 0,
            realized_trade_ids: [],
            lot_status: 'OPEN',
            method: 'LIFO'
          }).save({ session })
        ]);
      } else if (trade_type === 'DEBIT') {
        const remaining = await handleDebitLots({
          stock_name,
          quantity,
          sale_type,
          trade_id: createdTrade._id,
          session,
        });

        if (remaining > 0) {
          throw new Error(`Not enough stock for ${stock_name}. Remaining: ${remaining}`);
        }
      } else {
        throw new Error(`Invalid trade_type: ${trade_type}`);
      }
    }

    await session.commitTransaction();
    console.log('Trades and lots loaded successfully');
  } catch (err) {
    await session.abortTransaction();
    console.error('Load failed:', err.message);
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }
};

loadTrades();
