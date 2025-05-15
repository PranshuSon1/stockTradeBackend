import Lot from "../models/lot.js";
import Trade from "../models/trade.js";
import { tradeSummary } from "../pipeline/Trade.js";
import { handleDebitLots } from "../utilities/lotHelper.js";

/**
 * @description
 * Handles the creation of a new trade. Supports both CREDIT (buy) and DEBIT (sell) trade types.
 * - For CREDIT: Creates a trade and a corresponding open lot.
 * - For DEBIT: Deducts stock from available lots using FIFO or LIFO and creates a trade.
 *   Returns error if insufficient stock is available.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Contains trade details.
 * @param {string} req.body.stock_name - Name of the stock.
 * @param {string} req.body.trade_type - "CREDIT" (buy) or "DEBIT" (sell).
 * @param {number} req.body.quantity - Quantity of stock to trade.
 * @param {number} req.body.price - Price per unit.
 * @param {string} req.body.broker_name - Broker executing the trade.
 * @param {string} [req.body.sale_type="fifo"] - "fifo" or "lifo" for DEBIT type.
 *
 * @param {Object} res - Express response object.
 *
 * @returns {Object} JSON response with trade details or error message.
 */

export const create = async (req, res) => {
  try {
    const {
      stock_name,
      trade_type,
      quantity,
      price,
      broker_name,
      sale_type = "fifo",
    } = req.body;

    const fields = { stock_name, trade_type, quantity, price, broker_name };
    const missing = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    if (missing.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const amount = quantity * price;
    const trade = await new Trade({
      stock_name,
      trade_type,
      quantity,
      price,
      amount,
      broker_name,
    }).save();

    if (trade_type === "CREDIT") {
      await new Lot({
        trade_id: trade._id,
        stock_name,
        lot_quantity: quantity,
        realized_quantity: 0,
        lot_status: "OPEN",
      }).save();
    } else if (trade_type === "DEBIT") {
      const remaining = await handleDebitLots({
        stock_name,
        quantity,
        sale_type,
        trade_id: trade._id,
      });

      if (remaining > 0) {
        return res.status(400).json({
          message: "Not enough stock",
          remaining_quantity: `${remaining} quantity needed`,
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid trade_type" });
    }
    res.status(201).json({
      message: `Trade processed${
        trade_type === "DEBIT" ? ` with ${sale_type.toUpperCase()}` : ""
      }`,
      trade,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing trade", error: error.message });
  }
};

/**
 * @description
 * Retrieves all trade records from the database.
 * Supports optional filtering via query parameters.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Optional query parameters for filtering (e.g., stock_name, trade_type, broker_name).
 *
 * @param {Object} res - Express response object.
 *
 * @returns {Object} JSON array of matching trade records or an error response.
 */

export const getAll = async (req, res) => {
  try {
    const query = req.query;
    const trades = await Trade.find(query);
    res.status(200).json(trades);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error?.message });
  }
};

/**
 * @description
 * Provides a summary of all stocks by aggregating trade data.
 * Includes net quantity and available quantity comparison.
 * Adds a warning if there's a mismatch between net quantity and available quantity.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *
 * @returns {Object[]} Array of stock summary objects with optional mismatch warnings.
 * Each object includes fields like stock_name, net_quantity, total_available_quantity, and warning.
 */

export const getStockSummary = async (req, res) => {
  try {
    const stockSummary = await Trade.aggregate(tradeSummary);
    for (const stock of stockSummary) {
      if (stock.net_quantity !== stock.total_available_quantity) {
        stock.warning = `Mismatch: net_quantity (${stock.net_quantity}) ≠ total_available_quantity (${stock.total_available_quantity})`;
      } else {
        stock.warning = "All good, No mismatch in stocks";
      }
    }
    res.status(200).json(stockSummary);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trade summary", error: error.message });
  }
};
