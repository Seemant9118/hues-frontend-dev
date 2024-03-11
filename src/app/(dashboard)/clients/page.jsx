"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Layers2 } from "lucide-react";
import React, { useState } from "react";
import { ClientsColumns } from "./ClientsColumns";

const ClientPage = () => {
  const [clients, setClients] = useState([
    {
      name: "John Doe",
      vendor: "Origami Pvt. Ltd.",
      address:
        "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
      phone: "+91 98765 43210",
      email: "johndoe@gmail.com",
      gst: "44",
    },
    
  ]);
  return (
    <Wrapper>
      <SubHeader name={"Client List"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal type={"Client"} />
        </div>
      </SubHeader>
      <DataTable columns={ClientsColumns} data={clients} />
    </Wrapper>
  );
};

export default ClientPage;
