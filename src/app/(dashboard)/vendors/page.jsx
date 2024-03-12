"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import React, { useState } from "react";
import { VendorsColumns } from "./VendorsColumns";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([
    {
      name: "IQ IDEAS",
      address:
        "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
      phone: "+91 98765 43210",
      email: "johndoe@gmail.com",
      pan: "FFGH1456T",
    },
  ]);
  return (
    <Wrapper>
      <SubHeader name={"Vendor List"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal type={"Add Vendor"} />
        </div>
      </SubHeader>
      <DataTable columns={VendorsColumns} data={vendors} />
    </Wrapper>
  );
};

export default VendorsPage;
