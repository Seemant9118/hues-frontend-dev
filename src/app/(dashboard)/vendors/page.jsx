"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import React, { useState } from "react";
import { VendorsColumns } from "./VendorsColumns";
import EmptyStageComponent from "@/components/EmptyStageComponent";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([
    // {
    //   name: "IQ IDEAS",
    //   address:
    //     "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
    //   phone: "+91 98765 43210",
    //   email: "johndoe@gmail.com",
    //   pan: "FFGH1456T",
    // },
  ]);

  const VendorsEmptyStageData = {
    heading: 'Optimize Your Vendor Relationships',
    desc: `Elevate your procurement strategy with our Vendors feature, crafted to enrich your purchasing
    process. Add vendors effortlessly, ensuring you have immediate access to their catalogs,
    complete with detailed product information. This integration not only simplifies your procurement
    but also enhances transparency and efficiency, making every transaction smoother and more
    informed.`,
    subHeading: 'User Sections',
    subItems: [
      {
        id: 1, itemhead: ` Register Vendors: `, item: `Input essential details like name, address, mobile number, email, and PAN
        for each vendor.`
      },
      {
        id: 2, itemhead: `Access Catalogs:`, item: `  Gain automatic access to vendor catalogs, showcasing prices, descriptions,
        and more, directly within your purchasing workflow`
      },
      {
        id: 3, itemhead: `Streamline Purchases: `, item: `Leverage the full visibility of vendor offerings to make informed bids
        and purchases, enhancing your procurement process`
      },
      {
        id: 4, itemhead: `Build Stronger Connections: `, item: ` Foster robust relationships with vendors by engaging with their
        complete product range, tailored to your business needs`
      },
    ]
  };
  return (
    <Wrapper>
      <SubHeader name={"Vendor List"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal type={"Add Vendor"} />
        </div>
      </SubHeader>
      {
        vendors.length === 0 ? <EmptyStageComponent heading={VendorsEmptyStageData.heading} desc={VendorsEmptyStageData.desc} subHeading={VendorsEmptyStageData.subHeading} subItems={VendorsEmptyStageData.subItems} /> :
          <DataTable columns={VendorsColumns} data={vendors} />
      }
    </Wrapper>
  );
};

export default VendorsPage;
