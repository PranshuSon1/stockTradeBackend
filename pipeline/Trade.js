export const tradeSummary = [
  {
    $lookup: {
      from: "lots",
      localField: "stock_name",
      foreignField: "stock_name",
      as: "lots",
    },
  },
  {
    $group: {
      _id: "$stock_name",
      total_quantity_credit: {
        $sum: {
          $cond: [{ $eq: ["$trade_type", "CREDIT"] }, "$quantity", 0],
        },
      },
      total_quantity_debit: {
        $sum: {
          $cond: [{ $eq: ["$trade_type", "DEBIT"] }, "$quantity", 0],
        },
      },
      total_amount_credit: {
        $sum: {
          $cond: [{ $eq: ["$trade_type", "CREDIT"] }, "$amount", 0],
        },
      },
      total_amount_debit: {
        $sum: {
          $cond: [{ $eq: ["$trade_type", "DEBIT"] }, "$amount", 0],
        },
      },
      trade_count: { $sum: 1 },
      lots: { $first: "$lots" },
    },
  },
  {
    $addFields: {
      total_available_quantity: {
        $sum: {
          $map: {
            input: {
              $filter: {
                input: "$lots",
                as: "lot",
                cond: {
                  $in: ["$$lot.lot_status", ["OPEN", "PARTIALLY REALIZED"]],
                },
              },
            },
            as: "lot",
            in: { $subtract: ["$$lot.lot_quantity", "$$lot.realized_quantity"] },
          },
        },
      },
      available_lots_count: {
        $size: {
          $filter: {
            input: "$lots",
            as: "lot",
            cond: {
              $in: ["$$lot.lot_status", ["OPEN", "PARTIALLY REALIZED"]],
            },
          },
        },
      },
    },
  },
  {
    $project: {
      stock_name: "$_id",
      _id: 0,
      total_quantity_credit: 1,
      total_quantity_debit: 1,
      total_amount_credit: 1,
      total_amount_debit: 1,
      trade_count: 1,
      net_quantity: { $subtract: ["$total_quantity_credit", "$total_quantity_debit"] },
      net_amount: { $subtract: ["$total_amount_credit", "$total_amount_debit"] },
      total_available_quantity: 1,
      available_lots_count: 1,
    },
  },
  { $sort: { stock_name: 1 } },
] 