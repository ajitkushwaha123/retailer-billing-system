const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function listAllCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const categories = await mongoose.connection.db.collection('allproducts').distinct('category');
    console.log("Categories in Master Library:", categories);
    
    const samples = await mongoose.connection.db.collection('allproducts').find({}).limit(20).toArray();
    console.log("Sample Products:");
    samples.forEach(p => console.log(`- ${p.title} (${p.category})`));
    
    process.exit(0);
  } catch (err) {
    console.error("List failed:", err);
    process.exit(1);
  }
}

listAllCategories();
