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
import {
  BookUser,
  Eye,
  HeartHandshake,
  Settings,
  Upload
} from "lucide-react";
import { VendorsColumns } from "./VendorsColumns";

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

  const { isLoading, error, data, isSuccess } = useQuery({
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
    formattedData = data.flatMap((user) => ({
      ...user.mappedUserEnterprise,
      userId: user.id,
    }));
  }

  return (
    <Wrapper>
      <SubHeader name={"Vendors"}>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={"export"}
            size="sm"
            onClick={() => exportTableToExcel("vendor table", "vendors_list")}
          >
            <Upload size={14} />
            Export
          </Button>
          <AddModal
            type={"Add"}
            cta="vendor"
            btnName="Add"
            mutationFunc={CreateEnterpriseUser}
          />
        </div>
      </SubHeader>

      {isLoading && <Loading />}

      {!isLoading &&
        isSuccess &&
        (formattedData.length !== 0 ? (
          <DataTable
            id={"vendor table"}
            columns={VendorsColumns}
            data={formattedData}
          />
        ) : (
          <EmptyStageComponent
            heading={VendorsEmptyStageData.heading}
            desc={VendorsEmptyStageData.desc}
            subHeading={VendorsEmptyStageData.subHeading}
            subItems={VendorsEmptyStageData.subItems}
          />
        ))}
    </Wrapper>
  );
};

export default VendorsPage;
