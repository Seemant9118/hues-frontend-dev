"use client";
import React, { useState } from "react";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { FolderUp, PlusCircle } from "lucide-react";
import { PurchaseColumns } from "./PurchaseColumns";
import CreateSales from "@/components/CreateSales";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PurchaseOrders = () => {
  const [purchases, setPurchases] = useState([
    {
      date: "12/02/2024",
      item: "Starbucks",
      type: "offer",
      orders: "Starbucks Cold Brew Product",
      vendors: "R&T Pharma Private. Limited.",
      delivery_date: "02/05/12",
      amount: "2500",
      status: "Paid",
    },
    {
      date: "12/02/2024",
      item: "Starbucks",
      type: "Bid",
      orders: "Starbucks Cold Brew Product",
      vendors: "R&T Pharma Private. Limited.",
      delivery_date: "02/05/12",
      amount: "2500",
      status: "Paid",
    },
  ]);

  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [istype, setIsType] = useState('All');

  const PurchaseEmptyStageData = {
    heading: 'Empower Your Purchasing Decisions',
    desc: `Elevate your procurement with our Purchases feature, designed to bring flexibility and security
    to your buying process. Navigate through bids and offers with ease, engage in digital
    negotiations, and solidify your purchases with dual digital signatures. Our platform ensures
    every transaction is transparent, recorded, and perfectly aligned with your procurement needs`,
    subHeading: 'User Sections',
    subItems: [
      {
        id: 1, itemhead: `Place Bids: :`, item: `Initiate bids on products from prospective sellers' catalogs, taking control of your
        purchasing.`
      },
      {
        id: 2, itemhead: `Receive Offers:`, item: ` Explore offers from sellers, expanding your options with products that match
        your criteria.`
      },
      {
        id: 3, itemhead: `Negotiate Terms:`, item: ` Utilize the review option to negotiate on price, quantity, and grade, with each
        step securely signed digitally.`
      },
      {
        id: 4, itemhead: `Confirm Purchases: `, item: `Finalize transactions with mutual digital signatures, cementing your
        purchase agreements.`
      },
      {
        id: 5, itemhead: `Review History: `, item: `Keep track of all negotiation steps through the order history, ensuring clarity
        and accountability in every deal`
      },
    ]
  };



  return (
    <>
      {!isCreatingPurchase && (
        <Wrapper>
          <SubHeader name={"Purchase Orders"}>
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
                onClick={() => setIsCreatingPurchase(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <PlusCircle size={14} />
                Create Purchase
              </Button>
            </div>
          </SubHeader>
          {
            purchases.length === 0 ? <EmptyStageComponent heading={PurchaseEmptyStageData.heading} desc={PurchaseEmptyStageData.desc} subHeading={PurchaseEmptyStageData.subHeading} subItems={PurchaseEmptyStageData.subItems} /> :
              <DataTable columns={PurchaseColumns} data={purchases.filter((purchase) => {
                if (istype === "All" || istype === "") return true;
                return purchase.type === istype;
              })} />

          }
        </Wrapper>
      )}
      {isCreatingPurchase && (
        <CreateSales
          name="Create Purchase"
          onCancel={() => setIsCreatingPurchase(false)}
        />
      )}
    </>
  );
};

export default PurchaseOrders;
