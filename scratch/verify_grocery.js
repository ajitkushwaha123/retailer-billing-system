const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function verifyGroceryOnly() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const compIds = ["org_comp_delhi_1", "org_comp_mumbai_1"];
    const products = await mongoose.connection.db.collection('products').find({ organizationId: { $in: compIds } }).toArray();
    
    console.log("Sample Products in Competitor Shops:");
    products.slice(0, 15).forEach(p => console.log(`- ${p.title} (${p.category})`));
    
    const chickenCount = products.filter(p => p.title.toLowerCase().includes('chicken') || p.category === 'Chicken & Eggs').length;
    console.log(`\nChicken Items Found: ${chickenCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

verifyGroceryOnly();
