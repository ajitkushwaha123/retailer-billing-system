const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function globalSearch() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const id = "69a2b63816d4e286814d77b0";
    
    // Search products
    const p = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
    const ap = await mongoose.connection.db.collection('allproducts').findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (p) console.log("Found in products!", p.title, "Org:", p.organizationId);
    else if (ap) console.log("Found in allproducts!", ap.title, "Org:", ap.organizationId);
    else console.log("ID not found ANYWHERE in products/allproducts.");
    
    process.exit(0);
  } catch (err) {
    console.error("Search failed:", err);
    process.exit(1);
  }
}

globalSearch();
