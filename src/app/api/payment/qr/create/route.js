import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      name,
      customerName,
      phone,
      payment_amount,
      notes,
      description,
      close_by,
    } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { message: "Name and phone are required" },
        { status: 400 }
      );
    }

    const createCustomerRes = await fetch(
      "https://api.razorpay.com/v1/customers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64"),
        },
        body: JSON.stringify({
          name: customerName || "Store Customer",
          contact: phone,
          fail_existing: "0",
          notes: {
            label: "Store Customer",
          },
        }),
      }
    );

    const customerData = await createCustomerRes.json();

    if (!createCustomerRes.ok) {
      return NextResponse.json(
        {
          message: "Failed to create customer",
          error: customerData,
        },
        { status: createCustomerRes.status }
      );
    }

    const customer_id = customerData.id;

    // Ensure valid integer payment value
    const validAmount = Math.floor(Number(payment_amount)) || 300;

    // CREATE PAYMENT QR
    const payload = {
      type: "upi_qr",
      name: name ?? "Store Front Display",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: validAmount * 100, // in paise
      description: description ?? `Order from ${name}`,
      customer_id,
      close_by: close_by ?? Math.floor(Date.now() / 1000) + 2 * 24 * 3600,
      notes: notes ?? { purpose: "Payment for order" },
    };

    const qrRes = await fetch("https://api.razorpay.com/v1/payments/qr_codes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
          ).toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    const qrData = await qrRes.json();

    if (!qrRes.ok) {
      return NextResponse.json(
        {
          message: "Failed to create QR Code",
          error: qrData,
        },
        { status: qrRes.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        customer: customerData,
        qr: qrData,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Server Error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
