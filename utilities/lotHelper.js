import Lot from "../models/lot.js";
/**
 * Deducts (realizes) a given quantity of stock from available lots
 * using FIFO or LIFO lot management.
 * 
 * @param {Object} params - Function input parameters.
 * @param {string} params.stock_name - The name of the stock to debit lots from.
 * @param {number} params.quantity - The total quantity to be sold/debited.
 * @param {string} params.sale_type - Lot realization type ("fifo" or "lifo").
 * @param {string} params.trade_id - The ID of the trade that triggers this debit.
 * 
 * @returns {Promise<number>} - Returns the remaining quantity that could not be realized (0 if fully fulfilled).
 */

export const handleDebitLots = async ({
  stock_name,
  quantity,
  sale_type,
  trade_id,
}) => {
  let remaining = quantity;

  const sortOrder = sale_type?.toLowerCase() === "fifo" ? 1 : -1;

  const lots = await Lot.find({
    stock_name,
    lot_status: { $ne: "FULLY REALIZED" },
  })
    .sort({ created_at: sortOrder })

  for (const lot of lots) {
    const available = lot.lot_quantity - lot.realized_quantity;
    if (available <= 0) continue;

    const used = Math.min(available, remaining);
    const updatedRealized = lot.realized_quantity + used;

    Object.assign(lot, {
      realized_quantity: updatedRealized,
      realized_trade_id: trade_id,
      lot_status:
        updatedRealized === lot.lot_quantity
          ? "FULLY REALIZED"
          : "PARTIALLY REALIZED",
    });

    await lot.save();
    remaining -= used;
    if (remaining <= 0) break;
  }

  return remaining;
};
