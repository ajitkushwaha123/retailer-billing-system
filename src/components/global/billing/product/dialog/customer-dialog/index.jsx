"use client";

import React, { act, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerSearch } from "../customer-search";

export function CustomerDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    const customerData = { name, phone };
    console.log("Customer info:", customerData, "Tab:", activeTab);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="font-medium">
          Checkout
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Customer Information
          </DialogTitle>
        </DialogHeader>

        <div className="flex mb-4 space-x-2">
          <Button
            variant={activeTab === "existing" ? "default" : "outline"}
            onClick={() => setActiveTab("existing")}
          >
            Existing Customer
          </Button>

          <Button
            variant={activeTab === "new" ? "default" : "outline"}
            onClick={() => setActiveTab("new")}
          >
            New Customer
          </Button>
        </div>

        {activeTab === "new" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {activeTab === "existing" && (
          <div>
            <CustomerSearch />
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save & Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
