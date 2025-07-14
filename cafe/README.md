# Cafe Waiter Order Taking API

A simple POC backend API built with Node.js, Express.js, and JSON Server for a cafe waiter order taking application.

## Features

- **Table Management**: List tables and check their availability status
- **Order Management**: Create orders, update item status, and track order progress  
- **Food Menu**: Browse available food items with categories and prices
- **Billing System**: Generate bills with customer details and itemized totals
- **Swagger Documentation**: Interactive API documentation

## Tech Stack

- Node.js + Express.js
- JSON Server (for simple database)
- Swagger UI Express (API documentation)
- CORS enabled for frontend integration

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start JSON Server** (in one terminal):
   ```bash
   npm run json-server
   npx json-server --watch db.json --port 3001

   ```
   This starts the database server on http://localhost:3001

3. **Start the API Server** (in another terminal):
   ```bash
   npm run dev
   ```
   This starts the Express API server on http://localhost:3000

4. **Or run both simultaneously**:
   ```bash
   npm run dev-all
   ```

## API Endpoints

### Tables
- `GET /api/tables` - List all tables with status
- `GET /api/tables/:id` - Get table details and current order

### Food Items  
- `GET /api/food-items` - List all available food items

### Orders
- `POST /api/orders` - Place a new order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order item status

### Bills
- `POST /api/bills` - Create bill for an order

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **API Root**: http://localhost:3000

## Database Structure

The `db.json` file contains:

- **tables**: Restaurant tables with availability status
- **foodItems**: Menu items with categories and prices
- **orders**: Orders linked to tables with item lists
- **bills**: Generated bills with customer details

## Sample API Usage

### 1. List all tables
```bash
GET http://localhost:3000/api/tables
```

### 2. Get table details
```bash
GET http://localhost:3000/api/tables/1
```

### 3. Place an order
```bash
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "tableId": 1,
  "items": [
    {"foodItemId": 1, "quantity": 2},
    {"foodItemId": 4, "quantity": 1}
  ]
}
```

### 4. Update item status
```bash
PATCH http://localhost:3000/api/orders/1
Content-Type: application/json

{
  "itemId": 1,
  "status": "served"
}
```

### 5. Create a bill
```bash
POST http://localhost:3000/api/bills
Content-Type: application/json

{
  "orderId": 1,
  "customerName": "John Doe",
  "customerPhone": "+1234567890"
}
```

## Development

- The API automatically updates table status when orders are placed/completed
- Orders track individual item status (ordered → preparing → served)
- Bills automatically calculate subtotal, tax (10%), and total
- No authentication or complex validation for simplicity

## Notes

This is a POC implementation focused on core functionality. For production use, consider adding:
- Input validation
- Error handling improvements  
- Authentication/authorization
- Database relationships
- Payment processing
- Logging and monitoring 