import fs from "fs";
import { ObjectId } from "mongodb";

// ===== CONFIG =====
const NUM_ORDERS = 10000;
const ORG_ID = "org_33KbE4COtcqjeyRdGVrKtW6xrE9";
const USER_ID = "user_33EcZSLdTwUuKCRNtULPT8tc5rN";
const CUSTOMER_ID = "69350dc5bb97964e84d59609";

// ===== PRODUCTS =====
const products = [
  {
    _id: "6935ab5507dcfdbc06940d1e",
    name: "Fresh Paneer (Malai), 1 Kg",
    price: 325,
  },
  {
    _id: "6935abb607dcfdbc06940d39",
    name: "Eagle - Shahi Paneer Masala, 100 gm",
    price: 51,
  },
  {
    _id: "6935abbe07dcfdbc06940d3f",
    name: "Eagle - Pav Bhaji Masala, 100 gm",
    price: 38,
  },
  {
    _id: "6935a31853c80671c1be4ebf",
    name: "Coriander Leaves/Dhaniya, 1 Kg",
    price: 65,
  },
  { _id: "6935a31953c80671c1be4ec2", name: "Green Chilli, 1 Kg", price: 97 },
  { _id: "6935ab3f07dcfdbc06940d0b", name: "Tata - Salt, 1 Kg", price: 29 },
  {
    _id: "6935ab5307dcfdbc06940d1b",
    name: "Shudh Garhwal - Fresh Malai Paneer (Vacuum Pack), 1 Kg",
    price: 337,
  },
  {
    _id: "6935a8c1f32e7eb51a2bf204",
    name: "Button Mushroom, 200 gm",
    price: 190,
  },
  { _id: "6935a31653c80671c1be4ebc", name: "Lemon, 470 - 530 gm", price: 86 },
  {
    _id: "6935ab3e07dcfdbc06940d07",
    name: "MDH - Deggi Mirch, 100 gm",
    price: 76,
  },
  {
    _id: "6935b73107dcfdbc06940d61",
    name: "MDH - Coriander / Dhaniya Powder, 500 gm",
    price: 152,
  },
  {
    _id: "6935abc407dcfdbc06940d42",
    name: "MDH - Black Pepper Powder, 100 gm",
    price: 131,
  },
  { _id: "6935ab4107dcfdbc06940d13", name: "Sugar, 10 Kg", price: 518 },
  {
    _id: "6935abbb07dcfdbc06940d3c",
    name: "Surya - Dry Khopra, 1 Kg",
    price: 355,
  },
  { _id: "6935a27453c80671c1be4eb6", name: "Orange Carrot, 2 Kg", price: 67.5 },
  {
    _id: "6935ab3f07dcfdbc06940d0d",
    name: "Catch - Turmeric Powder, 1 Kg",
    price: 283,
  },
  {
    _id: "6935a32b53c80671c1be4ec8",
    name: "Green Capsicum (Big Size), 1 Kg",
    price: 107,
  },
  {
    _id: "6935a31553c80671c1be4eb9",
    name: "Pudina / Mint Leaves, 200 gm",
    price: 125,
  },
  { _id: "6935ab6d07dcfdbc06940d2a", name: "Amul - Gold Milk, 1 L", price: 78 },
  {
    _id: "6935ab5b07dcfdbc06940d21",
    name: "Milky Mist - Paneer, 1 Kg",
    price: 321,
  },
  {
    _id: "6935ab6c07dcfdbc06940d27",
    name: "Amul - Taaza Milk, 1 L",
    price: 73,
  },
  {
    _id: "6935a31b53c80671c1be4ec5",
    name: "Cabbage, (1.8 - 2.1 Kg)",
    price: 31.5,
  },
  {
    _id: "6935ab3e07dcfdbc06940d05",
    name: "Maharaj Choice - Red Chilli Powder, 1 Kg",
    price: 213,
  },
  {
    _id: "6935ab4207dcfdbc06940d16",
    name: "Maharaj Choice - Turmeric Powder, 1 Kg",
    price: 243,
  },
  {
    _id: "6935ab4007dcfdbc06940d10",
    name: "Catch - Kashmiri Mirch Powder, 1 Kg",
    price: 363,
  },
  {
    _id: "6935ab7407dcfdbc06940d2d",
    name: "Milky Mist - Processed Cheese Block, 1 Kg",
    price: 448,
  },
  {
    _id: "6935abc507dcfdbc06940d45",
    name: "Eastmade - Kashmiri Chilli Whole With Stem, 1 Kg",
    price: 367,
  },
  {
    _id: "6935ab3e07dcfdbc06940d09",
    name: "MDH - Deggi Mirch, 500 gm",
    price: 363,
  },
];

// ===== HELPERS =====
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateSepToDec() {
  const start = new Date("2025-09-02T00:00:00Z").getTime();
  const end = new Date("2025-12-08T23:59:59Z").getTime();
  return new Date(randomInt(start, end));
}

// ===== GENERATE ORDERS =====
const orders = [];

for (let i = 0; i < NUM_ORDERS; i++) {
  const numItems = randomInt(1, 5);
  const items = [];

  for (let j = 0; j < numItems; j++) {
    const product = products[randomInt(0, products.length - 1)];
    const quantity = randomInt(1, 5);
    const total = quantity * product.price;

    items.push({
      productId: new ObjectId(product._id),
      name: product.name,
      quantity,
      sellingPrice: product.price,
      total,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  orders.push({
    customerId: new ObjectId(CUSTOMER_ID),
    items,
    subtotal,
    tax: 0,
    discount: 0,
    total: subtotal,
    paymentMethod: "cash",
    paymentStatus: "paid",
    status: "completed",
    userId: USER_ID,
    orgId: ORG_ID,
    createdAt: randomDateSepToDec(),
    updatedAt: new Date(),
    __v: 0,
  });
}

// ===== SAVE TO JSON =====
fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
console.log(`✅ Generated ${NUM_ORDERS} orders from Sep 2 → Dec 8, 2025`);
