"use server";

import axios from "axios";
import { NextResponse } from "next/server";

const TEMPLATE_TYPES = {
  ORDER_DETAILS: "order_details",
  PAYMENT_REMINDER: "payment_reminder_with_payment_links_new",
};

const extractPaymentId = (url) => {
  try {
    if (!url) return "";

    const parts = url.split("/");
    return parts[parts.length - 1];
  } catch {
    return "";
  }
};

const buildPayload = (type, phone, data) => {
  if (type === TEMPLATE_TYPES.ORDER_DETAILS) {
    return {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: TEMPLATE_TYPES.ORDER_DETAILS,
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [{ type: "text", text: data.storeName }],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: data.customerName },
              { type: "text", text: data.items },
              { type: "text", text: String(data.totalAmount) },
              { type: "text", text: data.paymentStatus },
            ],
          },
        ],
      },
    };
  }

  if (type === TEMPLATE_TYPES.PAYMENT_REMINDER) {
    const paymentLinkId = extractPaymentId(data.paymentLink);

    return {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: TEMPLATE_TYPES.PAYMENT_REMINDER,
        language: { code: "en_US" },

        components: [
          {
            type: "header",
            parameters: [{ type: "text", text: data.storeName }],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: data.customerName },
              { type: "text", text: String(data.amount) },
              { type: "text", text: data.dueDate },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: paymentLinkId, // 👈 ONLY ID SENT
              },
            ],
          },
        ],
      },
    };
  }

  return null;
};

export async function POST(req) {
  try {
    let { phone, type, data } = await req.json();

    if (!phone || !type || !data) {
      return NextResponse.json(
        { message: "phone, type, and data are required" },
        { status: 400 }
      );
    }

    phone = phone.replace(/\D/g, "");
    if (!phone.startsWith("91")) phone = `91${phone}`;

    const payload = buildPayload(type, phone, data);

    if (!payload) {
      return NextResponse.json(
        { message: "Invalid template type or missing data" },
        { status: 422 }
      );
    }

    const waRes = await axios.post(
      `${process.env.META_BASE_API_URL}/${process.env.META_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(
      { message: "Message sent successfully", waRes: waRes.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("WA_ERROR", error?.response?.data || error.message);
    return NextResponse.json(
      {
        message: "Failed to send WhatsApp notification",
        error: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
