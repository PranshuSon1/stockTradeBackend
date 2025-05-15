# 📈 Stock Trading API - Fundtec

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)

---

A simple Node.js Express API to manage stock trades with **FIFO** and **LIFO** lot management strategies.

Built for stock trading platforms to handle:
- Purchase (CREDIT) and Sale (DEBIT) of stocks.
- Maintain lots (inventory) with FIFO/LIFO matching for debits.
- Summarize trades and available stock lots easily.
- **Lots are controlled by Trades:**
  - `CREDIT` → Purchasing of stock (creating new lots)
  - `DEBIT` → Selling of stock (consuming from available lots)
- Live app - https://stocktradebackend.onrender.com/status
---

## 🚀 Features
- Create a trade (BUY/SELL) with FIFO or LIFO method.
- Automatically manage available lots.
- Summarize net stock position and available lots.
- Error handling for insufficient stocks.
- Simple and clean modular code structure.
- MongoDB Transactions for data safety.

---

## 📂 Project Structure
```
/config        → MongoDB connection
/controllers   → API controllers
/models        → Mongoose schemas (Trade, Lot)
/routes        → API route handlers
/helpers       → Helper logic (like Lot allocation)
server.js      → Entry point
```

---

## ⚙️ Setup Instructions

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in root
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the server
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000/`

---

## 📬 API Endpoints

### Trade APIs
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/api/trades` | Create a trade (BUY or SELL) |
| `GET` | `/api/trades` | Get all trades (with optional filters) |
| `GET` | `/api/trades/getStockSummary` | Get stock-wise summary (net quantity & available lots) |

### Lot APIs
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/lots` | Get lot details (by stock or trade ID) |

### Health Check
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/status` | Check server status |

---

## 💑 API Documentation (Postman Collection)

You can import the ready-to-use Postman Collection:  
**Postman Collection Name:** `Stock Trading API - Fundtec`

### Environment Variables in Postman:
- `localhost` — Use for local development (`http://localhost:5000`).

---

## 🔥 How to Create a Trade

- **BUY (CREDIT) Example**

```json
POST /api/trades
Content-Type: application/json

{
  "stock_name": "Microsoft",
  "trade_type": "CREDIT",
  "quantity": 50,
  "broker_name": "Broker A",
  "price": 100
}
```

- **SELL (DEBIT) Example (using LIFO)**

```json
POST /api/trades
Content-Type: application/json

{
  "stock_name": "Microsoft",
  "trade_type": "DEBIT",
  "quantity": 20,
  "broker_name": "Broker A",
  "price": 120,
  "method": "lifo"
}
```
> ⚡ `method` defaults to `fifo` if not provided.

---
## 📦 Get Lots API Example

Fetch available lots for a stock or by a specific trade ID:

```http
GET /api/lots?stock_name=Microsoft
```

Optional Query Parameters:
- `stock_name` → Filter by stock name.
- `trade_id` → Filter by specific trade.

Sample Response:
```json
[
  {
    "stock_name": "Microsoft",
    "available_quantity": 30,
    "status": "OPEN",
    "purchase_price": 100,
    "broker_name": "Broker A"
  }
]
```
---

## 📊 Stock Summary Response

Sample output of `/api/trades/getStockSummary`:
```json
[
  {
    "stock_name": "Microsoft",
    "total_quantity_credit": 100,
    "total_quantity_debit": 50,
    "net_quantity": 50,
    "total_available_quantity": 50,
    "warning": null
  }
]
```

If there’s mismatch:
```json
"warning": "Mismatch: net_quantity (50) ≠ total_available_quantity (30)"
```

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Postman for testing

---

## 🚌 Author
Made with ❤️ by Pranshu Soni.

---