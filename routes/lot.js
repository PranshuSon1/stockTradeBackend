import express from "express";
import { getAll } from "../controllers/lot.js";

const router = express.Router();
router.get("/", getAll);

export default router;
