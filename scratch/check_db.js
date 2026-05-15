const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App";

async function checkProduct() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const id = "69a2b63816d4e286814d77b0";
    
    // Try to find the product in ANY collection? No, let's just list all collections and check 'products'
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    const product = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
    const allProduct = await mongoose.connection.db.collection('allproducts').findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (product) {
      console.log("Product Found in 'products'!", product.title);
    } else if (allProduct) {
      console.log("Product Found in 'allproducts'!", allProduct.title);
    } else {
      console.log("Product NOT found in 'products' or 'allproducts'.");
      
      // Check for any product at all
      const anyProduct = await mongoose.connection.db.collection('products').findOne({});
      console.log("Sample product from DB:", anyProduct ? anyProduct.title : "NONE");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Check failed:", err);
    process.exit(1);
  }
}

checkProduct();
