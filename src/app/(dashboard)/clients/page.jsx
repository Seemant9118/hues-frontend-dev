"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Layers2 } from "lucide-react";
import React, { useState } from "react";
import { ClientsColumns } from "./ClientsColumns";
import EmptyStageComponent from "@/components/EmptyStageComponent";

const ClientPage = () => {
  const [clients, setClients] = useState([
    // {
    //   name: "John Doe",
    //   vendor: "Origami Pvt. Ltd.",
    //   address:
    //     "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
    //   phone: "+91 98765 43210",
    //   email: "johndoe@gmail.com",
    //   pan: "FFGH1456T",
    // },

  ]);
  const ClientsEmptyStageData = {
    heading: 'Streamline Your Client Management',
    desc: `Maximize your client relationships with our Clients feature, a tool designed to seamlessly
    integrate your customer data into your sales process. By adding clients with comprehensive
    details, you unlock a streamlined pathway to offer your inventory directly, ensuring they have full
    visibility on your catalog with the ease and efficiency your business deserves.`,
    subHeading: 'User Sections',
    subItems: [
      {
        id: 1, itemhead: `Add Clients:`, item: ` Easily input client details such as name, address, mobile number, email, and PAN
        to your database`
      },
      {
        id: 2, itemhead: `Seamless Sales Integration:`, item: ` Directly offer your inventory to enlisted clients, providing them
        with full access to product details, prices, and descriptions`
      },
      {
        id: 3, itemhead: `Enhance Visibility:`, item: ` Ensure your clients always have the latest information on your offerings,
        fostering transparency and trust.`
      },
      {
        id: 4, itemhead: `Streamlined Access:`, item: ` Clients listed gain automatic access to your catalog, simplifying the sales
        process and enhancing user experience.`
      },
    ]
  };

  return (
    <Wrapper>
      <SubHeader name={"Client List"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal type={"Add Client"} />
        </div>
      </SubHeader>
      {
        clients.length === 0 ? <EmptyStageComponent heading={ClientsEmptyStageData.heading} desc={ClientsEmptyStageData.desc} subHeading={ClientsEmptyStageData.subHeading} subItems={ClientsEmptyStageData.subItems} /> :
          <DataTable columns={ClientsColumns} data={clients} />
      }
    </Wrapper>
  );
};

export default ClientPage;
