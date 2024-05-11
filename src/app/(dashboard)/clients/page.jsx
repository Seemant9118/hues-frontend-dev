"use client";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import Loading from "@/components/Loading";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { LocalStorageService, exportTableToExcel } from "@/lib/utils";
import {
  CreateEnterpriseUser,
  GetEnterpriseUsers,
} from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { useQuery } from "@tanstack/react-query";
import { BookCheck, BookUser, Key, Upload, UserPlus } from "lucide-react";
import { ClientsColumns } from "./ClientsColumns";

const ClientPage = () => {
  const enterpriseId = LocalStorageService.get("enterprise_Id");
  const ClientsEmptyStageData = {
    heading: `~"Streamline sales with our Clients feature, integrating customer data for direct inventory offers
    and full catalog visibility."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <UserPlus size={14} />,
        subItemtitle: `Easily add client details to your database.`,
      },
      {
        id: 2,
        icon: <Key size={14} />,
        subItemtitle: `Offer inventory directly to clients with full product access.`,
      },
      {
        id: 3,
        icon: <BookCheck size={14} />,
        subItemtitle: `Keep clients updated, fostering transparency and trust.`,
      },
      {
        id: 4,
        icon: <BookUser size={14} />,
        subItemtitle: `Listed clients get automatic catalog access, simplifying sales.`,
      },
    ],
  };

  const { isLoading, error, data, isSuccess } = useQuery({
    queryKey: [enterprise_user.getEnterpriseUsers.endpointKey],
    queryFn: () =>
      GetEnterpriseUsers({
        user_type: "client",
        enterprise_id: enterpriseId,
      }),
    select: (data) => data.data.data,
  });

  let formattedData = [];
  if (data) {
    formattedData = data.flatMap((user) => ({
      ...user.mappedUserEnterprise,
      userId: user.id,
    }));
  }

  return (
    <Wrapper>
      <SubHeader name={"Clients"}>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={"export"}
            size="sm"
            onClick={() => exportTableToExcel("client table", "clients_list")}
          >
            <Upload size={14} />
            Export
          </Button>
          <AddModal
            type={"Add"}
            cta="client"
            btnName="Add"
            mutationFunc={CreateEnterpriseUser}
          />
        </div>
      </SubHeader>

      {isLoading && <Loading />}

      {!isLoading &&
        (formattedData && formattedData.length !== 0 ? (
          <DataTable
            id={"client table"}
            columns={ClientsColumns}
            data={formattedData}
          />
        ) : (
          <EmptyStageComponent
            heading={ClientsEmptyStageData.heading}
            desc={ClientsEmptyStageData.desc}
            subHeading={ClientsEmptyStageData.subHeading}
            subItems={ClientsEmptyStageData.subItems}
          />
        ))}
    </Wrapper>
  );
};

export default ClientPage;
