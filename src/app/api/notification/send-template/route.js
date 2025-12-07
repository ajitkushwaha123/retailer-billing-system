import axios from "axios";
import { NextResponse } from "next/server";

const TEMPLATE_TYPES = {
  ORDER_PLACED: "order_placed_template",
  PAYMENT_PENDING: "payment_pending_template",
  ORDER_DELIVERED: "order_delivered_offer_template",
  VIEW_CATALOGUE: "view_catalogue_template",
  SPECIAL_OFFER: "order_completed_offer_for_second_visit",
};

const buildPayload = (type, phone, data) => {
  switch (type) {
    case TEMPLATE_TYPES.SPECIAL_OFFER:
      return {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "order_completed_offer_for_second_visit",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.name },
                { type: "text", text: data.orderId },
                { type: "text", text: data.couponCode },
                { type: "text", text: data.expiryDate },
              ],
            },
            {
              type: "button",
              sub_type: "copy_code",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: data.couponCode,
                },
              ],
            },
          ],
        },
      };

    case TEMPLATE_TYPES.ORDER_PLACED:
      return {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "order_placed_template",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.orderId },
                { type: "text", text: data.totalAmount },
              ],
            },
          ],
        },
      };

    case TEMPLATE_TYPES.PAYMENT_PENDING:
      return {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "payment_pending_template",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                {
                  type: "text",
                  text: data.paymentLink,
                },
              ],
            },
          ],
        },
      };

    case TEMPLATE_TYPES.ORDER_DELIVERED:
      return {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "order_delivered_offer_template",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.discountText },
                { type: "text", text: data.catalogueUrl },
              ],
            },
          ],
        },
      };

    case TEMPLATE_TYPES.VIEW_CATALOGUE:
      return {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "view_catalogue_template",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: data.caption || "Click below to view catalogue",
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: data.catalogueUrl,
                },
              ],
            },
          ],
        },
      };

    default:
      return null;
  }
};

export async function POST(req) {
  try {
    const { phone, type, data } = await req.json();

    if (!phone || !type) {
      return NextResponse.json(
        { message: "phone and type are required" },
        { status: 400 }
      );
    }

    const payload = buildPayload(type, phone, data);

    if (!payload) {
      return NextResponse.json(
        { message: "Invalid template type" },
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
    console.log("WA_ERROR", error?.response?.data || error.message);
    return NextResponse.json(
      {
        message: "Failed to send WhatsApp notification",
        error: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
