"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner@2.0.3";

export function OrderFormPage() {
  const [orderCode, setOrderCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Order submitted!");
    setOrderCode("");
    setItemName("");
    setRemarks("");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Order Form</h1>
      <div className="w-full h-96 border">
        <iframe src="/menu.pdf" title="Menu" className="w-full h-full" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderCode">Order Code</Label>
          <Input
            id="orderCode"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="itemName">Order Item Name</Label>
          <Input
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remarks">Remark</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Submit Order
        </Button>
      </form>
    </div>
  );
}

export default OrderFormPage;
