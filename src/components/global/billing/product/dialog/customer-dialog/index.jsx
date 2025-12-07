"use client";

import React, { useEffect, useState } from "react";
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

export function CustomerCartSheet({ items, totalAmount }) {
  const { addOrder } = useOrders();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const { removeItem } = useCart();

  const initialValues = {
    name: "",
    phone: "",
    paymentType: "cash",
    gstBilling: false,
    gstNumber: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(3, "Min 3 characters required").required("Required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Should be 10 digits")
      .required("Required"),
    gstNumber: Yup.string().when("gstBilling", {
      is: true,
      then: Yup.string()
        .matches(/^.{15}$/, "GST must be 15 characters")
        .required("GST number required"),
    }),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);

    const mappedItems = items.map((item) => {
      const total = item.price * item.quantity;
      return {
        productId: item._id,
        name: item.title,
        quantity: item.quantity,
        sellingPrice: item.price,
        total,
      };
    });

    const payload = {
      customerName: values.name,
      customerPhone: values.phone,
      paymentMethod: values.paymentType,
      paymentStatus: "pending",
      items: mappedItems,
      subtotal: mappedItems.reduce((t, i) => t + i.total, 0),
      tax: 0,
      discount: 0,
      total: totalAmount,
    };

    try {
      await addOrder(payload);
      router.push("/orders");
      resetForm();
      removeItem();
    } catch (error) {
      console.log("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

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
          {({ errors, touched, resetForm, values, setFieldValue }) => (
            <Form className="flex flex-col justify-between h-full">
              <div className="p-5 pb-28 overflow-y-auto space-y-6">
                <SheetHeader>
                  <SheetTitle className="font-semibold text-lg">
                    Customer & Order Summary
                  </SheetTitle>
                </SheetHeader>

                {/* Customer Details */}
                <section className="space-y-4 p-4 rounded-lg border shadow-sm bg-white">
                  <p className="text-sm font-semibold tracking-wide">
                    Customer Details
                  </p>

                  <div>
                    <Label className="text-xs mb-2 text-gray-600">Name</Label>
                    <Field
                      name="name"
                      as={Input}
                      placeholder="Enter customer name"
                    />
                    {errors.name && touched.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs mb-2 text-gray-600">Phone</Label>
                    <Field
                      name="phone"
                      as={Input}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                    {errors.phone && touched.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </section>

                {/* Payment Info */}
                <section className="space-y-4 p-4 rounded-lg border shadow-sm bg-white">
                  <p className="text-sm font-semibold tracking-wide">
                    Payment Information
                  </p>

                  <Label className="text-xs text-gray-600">Payment Mode</Label>

                  <Field name="paymentType">
                    {() => (
                      <RadioGroup
                        defaultValue={values.paymentType}
                        onValueChange={(val) =>
                          setFieldValue("paymentType", val)
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash">Cash</Label>
                        </div>

                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online">Online</Label>
                        </div>

                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </Field>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-700">
                      GST Billing Required?
                    </p>

                    <Switch
                      checked={values.gstBilling}
                      onCheckedChange={(val) =>
                        setFieldValue("gstBilling", val)
                      }
                    />
                  </div>

                  {values.gstBilling && (
                    <div>
                      <Label className="text-xs text-gray-600">
                        GST Number
                      </Label>
                      <Field
                        name="gstNumber"
                        as={Input}
                        placeholder="15-Digit GSTIN"
                      />
                      {errors.gstNumber && touched.gstNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.gstNumber}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {/* Cart Items */}
                <section className="space-y-4">
                  <p className="text-sm font-semibold tracking-wide">
                    Cart Items
                  </p>

                  <div className="space-y-3 border rounded-lg p-3 max-h-[230px] overflow-y-auto bg-white">
                    {items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center pb-2 border-b last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item?.imageUrl ||
                              "https://via.placeholder.com/40.png"
                            }
                            className="w-12 h-12 rounded-md object-cover border"
                          />

                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatToINR(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-semibold">
                          {formatToINR(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-base">
                    <p className="font-medium">Total Payable</p>
                    <p className="font-bold text-green-600">
                      {formatToINR(totalAmount)}
                    </p>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white shadow-lg border-t py-2 px-2 flex gap-3 justify-between items-center">
                <Button
                  variant="outline"
                  className="w-[49%] font-medium py-2"
                  type="button"
                  disabled={loading}
                  onClick={() => resetForm()}
                >
                  Cancel
                </Button>

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-[49%] font-medium py-2 flex items-center justify-center"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Processing..." : "Submit Order"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}
