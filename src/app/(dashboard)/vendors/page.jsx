"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import React, { useState } from "react";
import { VendorsColumns } from "./VendorsColumns";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import { DatabaseZap, FileCheck, FileText, KeySquare } from "lucide-react";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);

  const VendorsEmptyStageData = {
    heading: `~"Simplify procurement with our Vendors feature, offering immediate access to detailed vendor
    catalogs for efficient transactions."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Register vendors with essential details easily.`,
      },
      {
        id: 2,
        icon: <FileText size={14} />,
        subItemtitle: `Automatically access vendor catalogs within your purchasing workflow.`,
      },
      {
        id: 3,
        icon: <KeySquare size={14} />,
        subItemtitle: `Leverage vendor visibility for informed bids and streamlined purchases`,
      },
      {
        id: 4,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Foster robust vendor relationships with tailored product engagement.`,
      },
    ],
  };
  return (
    <Wrapper>
      <SubHeader name={"Vendors"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal
            type={"Add Vendor"}
            cta="Add"
            modalHead="Vendor"
            onSubmit={(newVendors) =>
              setVendors((vendors) => [...vendors, newVendors])
            }
          />
        </div>
      </SubHeader>
      {vendors.length === 0 ? (
        <EmptyStageComponent
          heading={VendorsEmptyStageData.heading}
          desc={VendorsEmptyStageData.desc}
          subHeading={VendorsEmptyStageData.subHeading}
          subItems={VendorsEmptyStageData.subItems}
        />
      ) : (
        <DataTable columns={VendorsColumns} data={vendors} />
      )}
    </Wrapper>
  );
};

export default VendorsPage;
