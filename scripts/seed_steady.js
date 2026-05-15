const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// URI from .env
const URI = 'mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App';

// Schemas
const OrderSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: Number,
    sellingPrice: Number,
    total: Number
  }],
  subtotal: Number,
  total: Number,
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  userId: String,
  orgId: String,
  createdAt: Date
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const ORG_ID = "org_33KbE4COtcqjeyRdGVrKtW6xrE9";
const USER_ID = "user_33EcZSLdTwUuKCRNtULPT8tc5rN";
const CUSTOMER_ID = "69350dc5bb97964e84d59609";

const products = [
  { _id: "6935ab5507dcfdbc06940d1e", name: "Fresh Paneer (Malai), 1 Kg", price: 325 },
  { _id: "6935abb607dcfdbc06940d39", name: "Eagle - Shahi Paneer Masala, 100 gm", price: 51 },
  { _id: "6935abbe07dcfdbc06940d3f", name: "Eagle - Pav Bhaji Masala, 100 gm", price: 38 },
  { _id: "6935a31853c80671c1be4ebf", name: "Coriander Leaves/Dhaniya, 1 Kg", price: 65 },
  { _id: "6935a31953c80671c1be4ec2", name: "Green Chilli, 1 Kg", price: 97 },
  { _id: "6935ab3f07dcfdbc06940d0b", name: "Tata - Salt, 1 Kg", price: 29 },
  { _id: "6935ab5307dcfdbc06940d1b", name: "Shudh Garhwal - Fresh Malai Paneer (Vacuum Pack), 1 Kg", price: 337 },
  { _id: "6935a8c1f32e7eb51a2bf204", name: "Button Mushroom, 200 gm", price: 190 },
  { _id: "6935a31653c80671c1be4ebc", name: "Lemon, 470 - 530 gm", price: 86 }
];

async function seedRefined() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB for refined seeding...");

    const ordersToInsert = [];
    const startDate = new Date("2026-01-01");
    const endDate = new Date(); // Up to today

    console.log(`Seeding daily orders from ${startDate.toDateString()} to ${endDate.toDateString()}...`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      
      // Base: 15 orders per day, plus/minus 3 for natural fluctuation
      const baseCount = 15;
      const variation = Math.floor(Math.random() * 7) - 3; // -3 to +3
      const dailyCount = Math.max(5, baseCount + variation + (isWeekend ? 5 : 0));

      for (let i = 0; i < dailyCount; i++) {
        const items = [];
        const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 2) + 1;
          items.push({
            productId: new ObjectId(product._id),
            name: product.name,
            quantity,
            sellingPrice: product.price,
            total: quantity * product.price
          });
        }

        const subtotal = items.reduce((sum, it) => sum + it.total, 0);
        const orderDate = new Date(d);
        orderDate.setHours(Math.floor(Math.random() * 12) + 9); // Business hours

        ordersToInsert.push({
          customerId: new ObjectId(CUSTOMER_ID),
          items,
          subtotal,
          total: subtotal,
          paymentMethod: "cash",
          paymentStatus: "paid",
          status: "completed",
          userId: USER_ID,
          orgId: ORG_ID,
          createdAt: orderDate
        });
      }
    }

    console.log(`Inserting ${ordersToInsert.length} refined orders...`);
    // Batch insert for performance
    const chunkSize = 500;
    for (let i = 0; i < ordersToInsert.length; i += chunkSize) {
      const chunk = ordersToInsert.slice(i, i + chunkSize);
      await Order.insertMany(chunk);
      console.log(`Progress: ${i + chunk.length}/${ordersToInsert.length}`);
    }

    console.log("Refined seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedRefined();
