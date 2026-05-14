import dbConnect from "@/lib/dbConnect";
import BarcodeReader from "@/models/BarcodeReader";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { items, orgId: bodyOrgId, userId: bodyUserId } = body;

    // Use orgId from body, or fallback to default org seen in other APIs
    const orgId = bodyOrgId || "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq";
    const userId = bodyUserId || "SYSTEM";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items are required" },
        { status: 400 }
      );
    }

    // 1. Audit: Save to BarcodeReader
    const formattedBarcodes = items.map((item) => ({
      barcode: item.barcode,
      createdAt: item.timestamp || new Date(),
    }));
    await BarcodeReader.insertMany(formattedBarcodes);

    // 2. Group items by 1-minute window
    const sortedItems = items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const groups = [];
    if (sortedItems.length > 0) {
      let currentGroup = [sortedItems[0]];
      for (let i = 1; i < sortedItems.length; i++) {
        const prevTime = new Date(sortedItems[i - 1].timestamp).getTime();
        const currTime = new Date(sortedItems[i].timestamp).getTime();
        if (currTime - prevTime <= 60000) {
          currentGroup.push(sortedItems[i]);
        } else {
          groups.push(currentGroup);
          currentGroup = [sortedItems[i]];
        }
      }
      groups.push(currentGroup);
    }

    // 3. Resolve Products
    const barcodes = [...new Set(sortedItems.map(i => i.barcode))];
    const productsFromDb = await Product.find({ 
      barcode: { $in: barcodes }, 
      organizationId: orgId 
    });
    const productMap = new Map(productsFromDb.map(p => [p.barcode, p]));

    // 4. Resolve "Walk-in" Customer
    let customer = await Customer.findOne({ name: "Walk-in", orgId });
    if (!customer) {
      customer = await Customer.create({
        name: "Walk-in",
        orgId,
        createdBy: "SYSTEM",
      });
    }

    const createdOrders = [];

    // 5. Create Orders and Update Stock/Sales
    for (const group of groups) {
      const orderItems = [];
      let subtotal = 0;
      let finalUserId = userId;

      for (const item of group) {
        const product = productMap.get(item.barcode);
        
        if (product) {
          finalUserId = product.userId; 
          
          await Product.findOneAndUpdate(
            { barcode: item.barcode, organizationId: orgId },
            { 
              $inc: { 
                stock: -1, 
                totalSold: 1 
              } 
            },
            { new: true }
          );

          const sellingPrice = product.price; 
          orderItems.push({
            productId: product._id,
            name: product.title,
            quantity: 1,
            sellingPrice: sellingPrice,
            total: sellingPrice,
          });
          subtotal += sellingPrice;
        } else {
          console.warn(`[Barcode Order] Product not found for barcode: ${item.barcode} in org: ${orgId}`);
        }
      }

      if (orderItems.length > 0) {
        const newOrder = await Order.create({
          customerId: customer._id,
          items: orderItems,
          subtotal,
          total: subtotal,
          paymentMethod: "cash",
          paymentStatus: "paid",
          status: "completed",
          userId: finalUserId,
          orgId: orgId,
        });
        createdOrders.push(newOrder._id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdOrders.length} orders created and inventory updated`,
      orderIds: createdOrders,
      barcodesSaved: formattedBarcodes.length
    });

  } catch (error) {
    console.error("Barcode Automated Order Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
};
