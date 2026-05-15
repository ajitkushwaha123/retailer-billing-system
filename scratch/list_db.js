const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function listProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const products = await mongoose.connection.db.collection('products').find({}).limit(10).toArray();
    
    console.log("Products in DB:");
    products.forEach(p => {
      console.log(`- ID: ${p._id.toString()} | Title: ${p.title} | Org: ${p.organizationId}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("List failed:", err);
    process.exit(1);
  }
}

listProducts();
