"use client";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import React, { useState } from "react";
import { VendorsColumns } from "./VendorsColumns";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import { BookUser, Settings, Eye, HeartHandshake } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import { GetEnterpriseUsers } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { LocalStorageService } from "@/lib/utils";

const VendorsPage = () => {
  const enterpriseId = LocalStorageService.get("enterprise_Id");

  const VendorsEmptyStageData = {
    heading: `~"Simplify procurement with our Vendors feature, offering immediate access to detailed vendor
    catalogs for efficient transactions."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <BookUser size={14} />,
        subItemtitle: `Register vendors with essential details easily.`,
      },
      {
        id: 2,
        icon: <Settings size={14} />,
        subItemtitle: `Automatically access vendor catalogs within your purchasing workflow.`,
      },
      {
        id: 3,
        icon: <Eye size={14} />,
        subItemtitle: `Leverage vendor visibility for informed bids and streamlined purchases`,
      },
      {
        id: 4,
        icon: <HeartHandshake size={14} />,
        subItemtitle: `Foster robust vendor relationships with tailored product engagement.`,
      },
    ],
  };

  const { isPending, error, data, isSuccess } = useQuery({
    queryKey: [enterprise_user.getEnterpriseUsers.endpointKey],
    queryFn: () =>
      GetEnterpriseUsers({
        user_type: "vendor",
        enterprise_id: enterpriseId,
      }),
    select: (data) => data.data.data,
  });

  let formattedData = [];
  if (data) {
    formattedData = data.flatMap((user) => user.mappedEnterprise);
  }

  return (
    <Wrapper>
      <SubHeader name={"Vendors"}>
        <div className="flex items-center justify-center gap-4">
          <AddModal type={"Add Vendor"} cta="vendor" btnName="Add" />
        </div>
      </SubHeader>
      {formattedData.length === 0 ? (
        <EmptyStageComponent
          heading={VendorsEmptyStageData.heading}
          desc={VendorsEmptyStageData.desc}
          subHeading={VendorsEmptyStageData.subHeading}
          subItems={VendorsEmptyStageData.subItems}
        />
      ) : (
        <DataTable columns={VendorsColumns} data={formattedData} />
      )}
    </Wrapper>
  );
};

export default VendorsPage;
