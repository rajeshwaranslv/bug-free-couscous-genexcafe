const express = require('express');
const cors = require('cors');
const axios = require('axios');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const JSON_SERVER_URL = 'http://localhost:3001';

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cafe Waiter Order Taking API',
      version: '1.0.0',
      description: 'POC backend API for a Cafe Waiter Order Taking App',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, occupied]
 *     FoodItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         foodItemId:
 *           type: integer
 *         foodItemName:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *         status:
 *           type: string
 *           enum: [ordered, preparing, served]
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tableId:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         status:
 *           type: string
 *           enum: [active, completed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Bill:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderId:
 *           type: integer
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         items:
 *           type: array
 *         subtotal:
 *           type: number
 *         tax:
 *           type: number
 *         total:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: List of all tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 */
app.get('/api/tables', async (req, res) => {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/tables`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Get table details and current order
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table details with current order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 table:
 *                   $ref: '#/components/schemas/Table'
 *                 currentOrder:
 *                   $ref: '#/components/schemas/Order'
 */
app.get('/api/tables/:id', async (req, res) => {
  try {
    const tableId = parseInt(req.params.id);
    
    // Get table details
    const tableResponse = await axios.get(`${JSON_SERVER_URL}/tables/${tableId}`);
    const table = tableResponse.data;
    
    // Get current order for this table
    const ordersResponse = await axios.get(`${JSON_SERVER_URL}/orders?tableId=${tableId}&status=active`);
    const currentOrder = ordersResponse.data[0] || null;
    
    res.json({
      table,
      currentOrder
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch table details' });
  }
});

/**
 * @swagger
 * /api/food-items:
 *   get:
 *     summary: Get all food items
 *     tags: [Food Items]
 *     responses:
 *       200:
 *         description: List of all food items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodItem'
 */
app.get('/api/food-items', async (req, res) => {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/foodItems`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodItemId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
app.post('/api/orders', async (req, res) => {
  try {
    const { tableId, items } = req.body;
    
    // Get food items details for the ordered items
    const foodItemsResponse = await axios.get(`${JSON_SERVER_URL}/foodItems`);
    const allFoodItems = foodItemsResponse.data;
    
    // Build order items with details
    let itemIdCounter = Date.now(); // Simple ID generation
    const orderItems = items.map(item => {
      const foodItem = allFoodItems.find(f => f.id === item.foodItemId);
      return {
        id: itemIdCounter++,
        foodItemId: item.foodItemId,
        foodItemName: foodItem.name,
        quantity: item.quantity,
        price: foodItem.price,
        status: 'ordered'
      };
    });
    
    const newOrder = {
      tableId,
      items: orderItems,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    // Create the order
    const response = await axios.post(`${JSON_SERVER_URL}/orders`, newOrder);
    
    // Update table status to occupied
    await axios.patch(`${JSON_SERVER_URL}/tables/${tableId}`, { status: 'occupied' });
    
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *   patch:
 *     summary: Update order item status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ordered, preparing, served]
 *     responses:
 *       200:
 *         description: Order updated successfully
 */
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const response = await axios.get(`${JSON_SERVER_URL}/orders/${orderId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { itemId, status } = req.body;
    
    // Get current order
    const orderResponse = await axios.get(`${JSON_SERVER_URL}/orders/${orderId}`);
    const order = orderResponse.data;
    
    // Update the specific item status
    const updatedItems = order.items.map(item => 
      item.id === itemId ? { ...item, status } : item
    );
    
    // Update the order
    const updatedOrder = { ...order, items: updatedItems };
    const response = await axios.put(`${JSON_SERVER_URL}/orders/${orderId}`, updatedOrder);
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Create a bill
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 */
app.post('/api/bills', async (req, res) => {
  try {
    const { orderId, customerName, customerPhone } = req.body;
    
    // Get order details
    const orderResponse = await axios.get(`${JSON_SERVER_URL}/orders/${orderId}`);
    const order = orderResponse.data;
    
    // Calculate bill details
    const billItems = order.items.map(item => ({
      foodItemName: item.foodItemName,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    }));
    
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    const newBill = {
      orderId,
      customerName,
      customerPhone,
      items: billItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      createdAt: new Date().toISOString()
    };
    
    // Create the bill
    const response = await axios.post(`${JSON_SERVER_URL}/bills`, newBill);
    
    // Update order status to completed
    await axios.patch(`${JSON_SERVER_URL}/orders/${orderId}`, { status: 'completed' });
    
    // Update table status to available
    await axios.patch(`${JSON_SERVER_URL}/tables/${order.tableId}`, { status: 'available' });
    
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Cafe Waiter Order Taking API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Cafe API Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🗄️  Make sure JSON Server is running on http://localhost:3001`);
}); 