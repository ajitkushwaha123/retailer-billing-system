const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function checkGroceryImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const products = await mongoose.connection.db.collection('allproducts').find({ 
      category: { $ne: "Chicken & Eggs" },
      imageUrl: { $exists: true, $ne: "" }
    }).limit(5).toArray();
    
    console.log("Grocery products with images:");
    products.forEach(p => console.log(`- ${p.title} | Image: ${p.imageUrl}`));
    
    process.exit(0);
  } catch (err) {
    console.error("Check failed:", err);
    process.exit(1);
  }
}

checkGroceryImages();
