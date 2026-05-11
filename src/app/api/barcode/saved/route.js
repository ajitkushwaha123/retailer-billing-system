import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { items } = body; // items: [{ barcode, price, scannedTime }]
    const orgId = "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items list is required" },
        { status: 400 }
      );
    }

    // Sort items by scannedTime
    const sortedItems = items.sort((a, b) => new Date(a.scannedTime) - new Date(b.scannedTime));

    // Group items by 1-minute window (sequential scans within 60s of each other)
    const groups = [];
    if (sortedItems.length > 0) {
      let currentGroup = [sortedItems[0]];
      for (let i = 1; i < sortedItems.length; i++) {
        const prevTime = new Date(sortedItems[i - 1].scannedTime).getTime();
        const currTime = new Date(sortedItems[i].scannedTime).getTime();
        
        // If scanned within 60 seconds of the previous scan, add to same group
        if (currTime - prevTime <= 60000) {
          currentGroup.push(sortedItems[i]);
        } else {
          groups.push(currentGroup);
          currentGroup = [sortedItems[i]];
        }
      }
      groups.push(currentGroup);
    }

    // Fetch all products involved in one query to get their current prices and details
    const barcodes = [...new Set(sortedItems.map(i => i.barcode))];
    const productsFromDb = await Product.find({ 
      barcode: { $in: barcodes }, 
      organizationId: orgId 
    });
    
    const productMap = new Map(productsFromDb.map(p => [p.barcode, p]));

    // Find or create "Walk-in" customer for this org
    let customer = await Customer.findOne({ name: "Walk-in", orgId });
    if (!customer) {
      customer = await Customer.create({
        name: "Walk-in",
        orgId,
        createdBy: "SYSTEM",
      });
    }

    const createdOrders = [];

    for (const group of groups) {
      const orderItems = [];
      let subtotal = 0;
      let orderUserId = "SYSTEM";

      for (const item of group) {
        const product = productMap.get(item.barcode);
        
        if (product) {
          orderUserId = product.userId;
          
          // Update product stock and sales
          await Product.findOneAndUpdate(
            { barcode: item.barcode, organizationId: orgId },
            { 
              $inc: { 
                stock: -1, 
                totalSold: 1 
              } 
            }
          );

          // Use price directly from the Product model
          const sellingPrice = product.price; 
          orderItems.push({
            productId: product._id,
            name: product.title,
            quantity: 1,
            sellingPrice: sellingPrice,
            total: sellingPrice,
          });
          subtotal += sellingPrice;
        }
      }

      if (orderItems.length > 0) {
        const newOrder = await Order.create({
          customerId: customer._id,
          items: orderItems,
          subtotal,
          total: subtotal, // Assuming no tax/discount for this automated flow
          paymentMethod: "cash",
          paymentStatus: "paid",
          status: "completed",
          userId: orderUserId,
          orgId: orgId,
        });
        createdOrders.push(newOrder._id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdOrders.length} orders created successfully`,
      orderIds: createdOrders,
    });
  } catch (error) {
    console.error("Barcode saved error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
