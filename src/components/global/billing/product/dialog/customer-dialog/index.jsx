"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatToINR } from "@/helper/transform";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useOrders } from "@/store/hooks/useOrder";
import { useCart } from "@/store/hooks/useCart";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";

// Dummy coupon database
const COUPONS = {
  WELCOME50: 50,
  SAVE30: 30,
  SUPER10: 10,
};

export function CustomerCartSheet({ items, totalAmount }) {
  const { addOrder } = useOrders();
  const router = useRouter();
  const { removeItem } = useCart();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState(null);
  const { organization } = useOrganization();

  const initialValues = {
    name: "",
    phone: "",
    paymentType: "cash",
    gstBilling: false,
    gstNumber: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(3).required(),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/)
      .required(),
    gstNumber: Yup.string().when("gstBilling", {
      is: true,
      then: Yup.string().matches(/^.{15}$/, "GST must be 15 characters"),
    }),
  });

  const applyCoupon = () => {
    if (COUPONS[couponCode]) {
      setDiscount(COUPONS[couponCode]);
      setCouponError(null);
    } else {
      setDiscount(0);
      setCouponError("Invalid coupon");
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);

    const mappedItems = items.map((item) => ({
      productId: item._id,
      name: item.title,
      quantity: item.quantity,
      sellingPrice: item.price,
      total: item.price * item.quantity,
    }));

    const subTotal = mappedItems.reduce((t, i) => t + i.total, 0);

    const paymentStatus = values.paymentType === "udhaar" ? "pending" : "paid";

    const payload = {
      storeName: organization?.name || "Our Store",
      customerName: values.name,
      customerPhone: values.phone,
      paymentMethod: values.paymentType,
      paymentStatus,
      couponUsed: couponCode || null,
      discount,
      items: mappedItems,
      subtotal: subTotal,
      tax: 0,
      total: subTotal - discount,
    };

    try {
      await addOrder(payload);
      resetForm();
      removeItem();
      router.push("/orders");
    } catch (error) {
      console.log("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = totalAmount - discount;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="font-medium">
          Checkout
        </Button>
      </SheetTrigger>

      <SheetContent className="p-0 flex flex-col justify-between overflow-hidden">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched, resetForm }) => (
            <Form className="flex flex-col justify-between h-full">
              <div className="p-5 pb-24 overflow-y-auto space-y-6">
                {/* Header */}
                <SheetHeader>
                  <SheetTitle className="font-semibold text-lg">
                    Customer & Billing
                  </SheetTitle>
                </SheetHeader>

                {/* Customer Section */}
                <section className="space-y-4 bg-white border rounded-lg p-4 shadow-sm">
                  <Label className="font-medium text-sm">Customer</Label>

                  <div>
                    <Label className="text-xs">Name</Label>
                    <Field name="name" as={Input} placeholder="Enter name" />
                    {errors.name && touched.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Field
                      name="phone"
                      as={Input}
                      placeholder="10 digit number"
                      maxLength={10}
                    />
                    {errors.phone && touched.phone && (
                      <p className="text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </section>

                {/* Payment & GST */}
                <section className="space-y-4 bg-white border rounded-lg p-4 shadow-sm">
                  <Label className="font-medium text-sm">Payment</Label>

                  <RadioGroup
                    defaultValue={values.paymentType}
                    onValueChange={(val) => setFieldValue("paymentType", val)}
                    className="flex gap-6"
                  >
                    <div className="flex gap-1 items-center">
                      <RadioGroupItem value="cash" />
                      <Label>Cash</Label>
                    </div>

                    <div className="flex gap-1 items-center">
                      <RadioGroupItem value="online" />
                      <Label>Online</Label>
                    </div>

                    <div className="flex gap-1 items-center">
                      <RadioGroupItem value="udhaar" />
                      <Label>Udhaar</Label>
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between">
                    <p className="text-xs">GST Billing?</p>
                    <Switch
                      checked={values.gstBilling}
                      onCheckedChange={(val) =>
                        setFieldValue("gstBilling", val)
                      }
                    />
                  </div>

                  {values.gstBilling && (
                    <div>
                      <Label className="text-xs">GST Number</Label>
                      <Field
                        name="gstNumber"
                        as={Input}
                        placeholder="Enter GST No."
                      />
                    </div>
                  )}
                </section>

                {/* Coupon Section */}
                <section className="space-y-3 bg-white border rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium">Coupon</p>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                    />
                    <Button type="button" onClick={applyCoupon} size="sm">
                      Apply
                    </Button>
                  </div>

                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}

                  {discount > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      ₹{discount} discount applied
                    </p>
                  )}
                </section>

                <section className="space-y-4">
                  {" "}
                  <p className="text-sm font-semibold tracking-wide">
                    {" "}
                    Cart Items{" "}
                  </p>{" "}
                  <div className="space-y-3 border rounded-lg p-3 max-h-[230px] overflow-y-auto bg-white">
                    {" "}
                    {items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center pb-2 border-b last:border-none"
                      >
                        {" "}
                        <div className="flex items-center gap-3">
                          {" "}
                          <img
                            src={
                              item?.imageUrl ||
                              "https://via.placeholder.com/40.png"
                            }
                            className="w-12 h-12 rounded-md object-cover border"
                          />{" "}
                          <div>
                            {" "}
                            <p className="text-sm font-medium">
                              {item.name}
                            </p>{" "}
                            <p className="text-xs text-gray-500">
                              {" "}
                              {formatToINR(item.price)} × {item.quantity}{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        <p className="text-sm font-semibold">
                          {" "}
                          {formatToINR(item.price * item.quantity)}{" "}
                        </p>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                  <div className="flex justify-between text-base">
                    {" "}
                    <p className="font-medium">Total Payable</p>{" "}
                    <p className="font-bold text-green-600">
                      {" "}
                      {formatToINR(totalAmount)}{" "}
                    </p>{" "}
                  </div>{" "}
                </section>
              </div>

              <div className="sticky bottom-0 bg-white shadow-lg border-t py-2 px-2 flex gap-3">
                <Button
                  type="button"
                  className="w-1/2"
                  variant="outline"
                  disabled={loading}
                  onClick={() => resetForm()}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={loading} className="w-1/2">
                  {loading && <Loader2 className="mr-2 animate-spin" />}
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}
