import express from "express";
import { create, getAll, getStockSummary } from "../controllers/trade.js";

const router = express.Router();

router.get("/getStockSummary", getStockSummary); 
router.post("/", create); 
router.get("/", getAll); 

export default router;
