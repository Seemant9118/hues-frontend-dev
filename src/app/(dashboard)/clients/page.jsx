"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { DatabaseZap, FileText, KeySquare, Layers2, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { ClientsColumns } from "./ClientsColumns";
import EmptyStageComponent from "@/components/EmptyStageComponent";

const ClientPage = () => {
  const [clients, setClients] = useState([]);
  const ClientsEmptyStageData = {
    heading: `~"Streamline sales with our Clients feature, integrating customer data for direct inventory offers
    and full catalog visibility."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <FileText size={14} />,
        subItemtitle: `Easily add client details to your database.`,
      },
      {
        id: 2,
        icon: <KeySquare size={14} />,
        subItemtitle: `Offer inventory directly to clients with full product access.`,
      },
      {
        id: 3,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Keep clients updated, fostering transparency and trust.`,
      },
      {
        id: 4,
        icon: <ShieldCheck size={14} />,
        subItemtitle: `Listed clients get automatic catalog access, simplifying sales.`,
      },
    ],
  };

  return (
    <Wrapper>
      <SubHeader name={"Clients"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal
            type={"Add Client"}
            cta="Add"
            modalHead="Client"
            onSubmit={(newClient) =>
              setClients((clients) => [...clients, newClient])
            }
          />
        </div>
      </SubHeader>
      {clients.length === 0 ? (
        <EmptyStageComponent
          heading={ClientsEmptyStageData.heading}
          desc={ClientsEmptyStageData.desc}
          subHeading={ClientsEmptyStageData.subHeading}
          subItems={ClientsEmptyStageData.subItems}
        />
      ) : (
        <DataTable columns={ClientsColumns} data={clients} />
      )}
    </Wrapper>
  );
};

export default ClientPage;
