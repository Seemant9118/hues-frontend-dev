"use client";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import EmptyStageComponent from "@/components/ui/EmptyStageComponent";
import Loading from "@/components/ui/Loading";
import AddModal from "@/components/Modals/AddModal";
import SubHeader from "@/components/ui/Sub-header";
import Wrapper from "@/components/wrappers/Wrapper";
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
import { client_enterprise } from "@/api/enterprises_user/client_enterprise/client_enterprise";
import {
  createClient,
  getClients,
} from "@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service";

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
    queryKey: [client_enterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (data) => data.data.data,
  });

  let formattedData = [];
  if (data) {
    formattedData = data.flatMap((user) => {
      let userDetails;
      if (user.client) {
        userDetails = { ...user.client };
      } else {
        userDetails = { ...user.invitation.userDetails };
      }

      return {
        ...userDetails,
        id: user.id,
        invitationId: user.invitation?.id,
        invitationStatus: user.invitation?.status,
      };
    });
  }
  console.log(formattedData);

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
            mutationFunc={createClient}
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
