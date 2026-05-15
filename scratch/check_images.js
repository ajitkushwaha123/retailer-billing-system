const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function checkAllProductImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const sample = await mongoose.connection.db.collection('allproducts').findOne({ imageUrl: { $exists: true, $ne: "" } });
    
    if (sample) {
      console.log("Found product with image!", sample.title, "Image:", sample.imageUrl);
    } else {
      console.log("NO PRODUCTS WITH IMAGES FOUND in allproducts!");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Check failed:", err);
    process.exit(1);
  }
}

checkAllProductImages();
