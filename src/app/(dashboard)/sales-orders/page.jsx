"use client";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { CloudFog, FolderUp, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { SalesColumns } from "./SalesColumns";
import CreateSales from "@/components/CreateSales";
import EmptyStageComponent from "@/components/EmptyStageComponent";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SalesOrder = () => {
  const [orders, setOrders] = useState([]);
  const [istype, setIsType] = useState('All');

  const [isCreatingSales, setIsCreatingSales] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const SaleEmptyStageData = {
    heading: 'Revolutionize Your Sales Process',
    desc: `Dive into a seamless sales experience with our Orders feature, where flexibility meets security.
    Whether it's through bids from eager buyers or offers you initiate, our platform empowers you to
    negotiate and finalize deals with digital precision. Every step, from counter-bids to confirmation,
    is securely signed and recorded, ensuring a transparent and efficient transaction process.`,
    subHeading: 'User Sections',
    subItems: [
      {
        id: 1, itemhead: `Receive Bids:`, item: ` Engage with prospective buyers as they bid on your catalog items`
      },
      {
        id: 2, itemhead: `Make Offers:`, item: ` Proactively offer your catalog to potential buyers, inviting orders`
      },
      {
        id: 3, itemhead: `Negotiate: Use`, item: ` the review option to negotiate on price, quantity, and grade with digital
        signatures for each step`
      },
      {
        id: 4, itemhead: `Confirm Orders:`, item: ` Seal the deal with dual digital signatures, finalizing the order with confidence`
      },
      {
        id: 5, itemhead: `Track History: `, item: `Access the negotiation history for each order, ensuring transparency and
        accountability.`
      },
    ]
  };


  return (
    <>
      {!isCreatingSales && !isCreatingInvoice && (
        <Wrapper>
          <SubHeader name={"Sales Orders"}>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <Select
                  value={istype.type}
                  onValueChange={(value) =>
                    setIsType(value)
                  }
                >
                  <SelectTrigger className="max-w-xs gap-5">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Bid">Bid</SelectItem>
                    <SelectItem value="offer">offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant={"blue_outline"}
                className="bg-neutral-500/10 text-neutral-600 border-neutral-300 hover:bg-neutral-600/10"
                size="sm"
              >
                <FolderUp size={14} />
                Export
              </Button>
              <Button
                onClick={() => setIsCreatingSales(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <PlusCircle size={14} />
                Create Sales
              </Button>
            </div>
          </SubHeader>
          {
            orders.length === 0 ? <EmptyStageComponent heading={SaleEmptyStageData.heading} desc={SaleEmptyStageData.desc} subHeading={SaleEmptyStageData.subHeading} subItems={SaleEmptyStageData.subItems} /> :
              <DataTable columns={SalesColumns} data={orders.filter((order) => {
                if (istype === "All" || istype === "") return true;
                return order.type === istype;
              })} />
          }
        </Wrapper>
      )}
      {isCreatingSales && !isCreatingInvoice && (
        <CreateSales
          name="Create Sales"
          onSubmit={(newOrders) =>
            setOrders(orders => [...orders, newOrders])
          }
          setIsCreatingSales={setIsCreatingSales}
          onCancel={() => setIsCreatingSales(false)}
        />
      )}
      {isCreatingInvoice && !isCreatingSales && (
        <CreateSales
          name="Create Invoice"
          onCancel={() => setIsCreatingInvoice(false)}
        />
      )}
    </>
  );
};

export default SalesOrder;
