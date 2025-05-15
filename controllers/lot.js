import Lot from "../models/lot.js";

/**
 * @description
 * Retrieves all Lot records from the database.
 * Supports optional filtering via query parameters.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Optional query parameters for filtering (e.g., stock_name, lot_quantity, lot_status, trade_id).
 *
 * @param {Object} res - Express response object.
 *
 * @returns {Object} JSON array of matching lot records or an error response.
 */
export const getAll = async (req, res) => {
  try {
    const query = req.query;
    const lots = await Lot.find(query);
    res.status(200).json(lots);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching data", error: error?.message });
  }
};
