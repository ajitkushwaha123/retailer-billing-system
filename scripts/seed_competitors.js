const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const URI = 'mongodb+srv://ajitkushwaha3101:snehavats1404@flask-app.v6ua89h.mongodb.net/?appName=Flask-App';

// Schemas
const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  organizationId: String,
  userId: String,
  sku: String,
  imageUrl: String,
  category: String,
  totalSold: { type: Number, default: 0 },
  stock: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

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

const AllProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  imageUrl: String,
  category: String,
  sku: String
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const AllProduct = mongoose.models.AllProduct || mongoose.model('AllProduct', AllProductSchema);

const COMPETITORS = [
  { id: "org_comp_delhi_1", name: "Shop A", city: "Delhi" },
  { id: "org_comp_mumbai_1", name: "Shop B", city: "Mumbai" },
  { id: "org_comp_bangalore_1", name: "Shop C", city: "Bangalore" },
  { id: "org_comp_chennai_1", name: "Shop D", city: "Chennai" },
  { id: "org_comp_kolkata_1", name: "Shop E", city: "Kolkata" }
];

async function seedCompetitors() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB for competitor seeding...");

    // 0. Fetch real products from AllProduct library (Filtering for day-to-day grocery)
    const masterLibrary = await AllProduct.find({
      category: { $ne: "Chicken & Eggs" },
      title: { $not: /Chicken/i }
    }).limit(40).lean();
    
    if (masterLibrary.length === 0) {
      console.warn("Grocery library is empty! Falling back to sample data.");
      masterLibrary.push({ title: "Salt", price: 20, category: "Grains", imageUrl: "" });
    }

    // 1. Cleanup: DO NOT DELETE FOR org_3A2LmFy3FhPPwapdkjv4tIMt1Hq
    const compIds = COMPETITORS.map(c => c.id);
    await Product.deleteMany({ organizationId: { $in: compIds } });
    await Order.deleteMany({ orgId: { $in: compIds } });
    console.log(`Cleaned up data for ${compIds.length} competitors. (Protected main org)`);

    for (const comp of COMPETITORS) {
      console.log(`Seeding ${comp.name}...`);
      
      // 2. Create Products for this competitor using Master Library
      const compProducts = [];
      for (let i = 0; i < masterLibrary.length; i++) {
        const master = masterLibrary[i];
        const priceVariation = master.price + (Math.floor(Math.random() * 20) - 10);
        
        const product = await Product.create({
          title: master.title,
          price: Math.max(1, priceVariation),
          organizationId: comp.id,
          userId: "SYSTEM_COMPETITOR",
          sku: `COMP-${comp.id}-${i}`,
          imageUrl: master.imageUrl,
          category: master.category,
          unit: "Pcs",
          stock: Math.floor(Math.random() * 500) + 50,
          totalSold: 0
        });
        compProducts.push(product);
      }

      // 3. Create Orders (Sales History)
      const ordersToInsert = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
        // Random daily order count
        const dailyCount = Math.floor(Math.random() * 15) + 5; 

        for (let i = 0; i < dailyCount; i++) {
          const items = [];
          const numItems = Math.floor(Math.random() * 3) + 1;
          
          for (let j = 0; j < numItems; j++) {
            const product = compProducts[Math.floor(Math.random() * compProducts.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            items.push({
              productId: product._id,
              name: product.title,
              quantity,
              sellingPrice: product.price,
              total: quantity * product.price,
              imageUrl: product.imageUrl
            });
          }

          const subtotal = items.reduce((sum, it) => sum + it.total, 0);
          const orderDate = new Date(d);
          orderDate.setHours(Math.floor(Math.random() * 24));

          ordersToInsert.push({
            customerId: new ObjectId(),
            items,
            subtotal,
            total: subtotal,
            paymentMethod: "cash",
            paymentStatus: "paid",
            status: "completed",
            userId: "SYSTEM_COMPETITOR",
            orgId: comp.id,
            createdAt: orderDate
          });
        }
      }

      await Order.insertMany(ordersToInsert);
      console.log(`Seeded ${ordersToInsert.length} orders for ${comp.name}`);
    }

    console.log("Competitor seeding completed successfully with real product library!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedCompetitors();
