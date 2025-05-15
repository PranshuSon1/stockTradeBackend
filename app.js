import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import lotRoutes from "./routes/lot.js";
import tradeRoutes from "./routes/trade.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/trade", tradeRoutes);
app.use("/api/lot", lotRoutes);
app.use("/status", (req, res) => res.send("Server is Online"))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server ready at http://localhost:${PORT}`));
