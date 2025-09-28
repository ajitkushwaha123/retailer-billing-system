"use client";

import * as React from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CustomerDialog() {
  const [open, setOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  const customers = [
    { id: "1", name: "Rahul Sharma", phone: "9876543210" },
    { id: "2", name: "Priya Patel", phone: "9123456780" },
    { id: "3", name: "Amit Verma", phone: "9988776655" },
  ];

  const handleSave = () => {
    const customerData = { name, phone, email };
    console.log("Customer info:", customerData);
    setOpen(false);
  };

  React.useEffect(() => {
    if (selectedCustomer) {
      setName(selectedCustomer.name);
      setPhone(selectedCustomer.phone);
      setEmail("");
    }
  }, [selectedCustomer]);

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

        {/* Search customer */}
        <div className="mb-5">
          <Label className="mb-2 block text-sm font-medium">
            Search Customer
          </Label>
          <div className="rounded-lg border bg-muted/30">
            <Command>
              <CommandInput placeholder="Search by name or phone..." />
              <CommandList>
                <CommandEmpty>No customers found.</CommandEmpty>
                <CommandGroup heading="Existing Customers">
                  {customers.map((c) => (
                    <CommandItem
                      key={c.id}
                      onSelect={() => setSelectedCustomer(c)}
                      className={cn(
                        "cursor-pointer",
                        selectedCustomer?.id === c.id &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.phone}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>

        {/* Customer form */}
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

          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

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
