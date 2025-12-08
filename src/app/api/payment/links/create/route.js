import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      amount,
      description,
      email,
      expire_at,
      notes,
      orderId,
    } = body;

    console.log("PAYMENT LINK REQ BODY:", body);

    if (!name || !phone || !amount || !orderId) {
      return NextResponse.json(
        { message: "Name, phone, amount and orderId are required" },
        { status: 400 }
      );
    }

    const formattedAmount = Math.floor(Number(amount));

    const payload = {
      amount: formattedAmount * 100, // paise
      currency: "INR",
      accept_partial: false,
      expire_by: expire_at ?? Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60, // 2 days validity
      reference_id: orderId, // THIS IS CORRECT
      description: description ?? `Payment for order #${orderId}`,

      customer: {
        name,
        contact: phone,
      },

      notify: {
        sms: true,
        email: false,
      },

      reminder_enable: true,

      notes: notes ?? {
        order_ref: orderId,
      },

      callback_url: "https://kravy.in/payment/success?order=" + orderId,
      callback_method: "get",
    };

    const res = await fetch("https://api.razorpay.com/v1/payment_links/", {
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

    const data = await res.json();

    console.log("PAYMENT LINK RES:", data);

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Failed to generate payment link",
          error: data,
        },
        { status: res.status }
      );
    }

    // 🟢 Update DB with Payment Link
    await Order.findByIdAndUpdate(orderId, {
      paymentLink: data.short_url || data.url,
    });

    return NextResponse.json(
      {
        success: true,
        payment_link: data.short_url || data.url,
        providerRefId: data.id ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("PAYMENT ERROR", err);

    return NextResponse.json(
      {
        message: "Server Error",
        error: err?.message || err,
      },
      { status: 500 }
    );
  }
}
