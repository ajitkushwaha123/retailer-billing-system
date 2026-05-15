const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function listOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const orders = await mongoose.connection.db.collection('orders').find({ orgId: "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq" }).limit(5).toArray();
    
    console.log("Product IDs found in Orders for this Org:");
    orders.forEach(o => {
      o.items.forEach(item => {
        console.log(`- ID: ${item.productId.toString()} | Name: ${item.name}`);
      });
    });
    
    process.exit(0);
  } catch (err) {
    console.error("List failed:", err);
    process.exit(1);
  }
}

listOrders();
