"use client";
import { Invitation } from "@/api/invitation/Invitation";
import { useInviteColumns } from "@/components/columns/useInviteColumns";
import { DataTable } from "@/components/table/data-table";
import EmptyStageComponent from "@/components/ui/EmptyStageComponent";
import Loading from "@/components/ui/Loading";
import SubHeader from "@/components/ui/Sub-header";
import {
  getReceivedInvitation
} from "@/services/Invitation_Service/Invitation_Service";
import { useQuery } from "@tanstack/react-query";
import { LineChart } from "lucide-react";

export default function Home() {
  const InviteColumns = useInviteColumns();
  // get received invitations
  const { data: receivedInviteData = [], isLoading: isReceivedInviteLoading } =
    useQuery({
      queryKey: [Invitation.getReceivedInvitation.endpointKey],
      queryFn: () => getReceivedInvitation(),
      select: (data) => data.data.data,
    });

  const ReceivedformattedData = receivedInviteData?.map((user) => ({
    ...user.enterprise,
    id: user.invitation.id,
    status: user.status,
  }));

  const filteredData = ReceivedformattedData.filter(
    (data) => data.status === "PENDING"
  );
  // console.log(filteredData);

  const dashBoardData = [
    {
      id: 1,
      title: "YTD Sale",
      numbers: "₹52.4k",
      growth: "+3.4%",
      icon: <LineChart size={16} />,
    },
    { id: 2, title: "Daily Sale", numbers: "₹12.87k", growth: "-2.4%" },
    {
      id: 3,
      title: "Products",
      numbers: "2365",
      growth: "",
      icon: <LineChart size={16} />,
    },
    {
      id: 4,
      title: "YTD Items Sold",
      numbers: "22K",
      growth: "",
      icon: <LineChart size={16} />,
    },
    { id: 5, title: "Items Sold Today", numbers: "11", growth: "" },
  ];

  const dashBoardEmptyStagedata = {
    heading:
      "Seamlessly monitor financial health and compliance with an integrated, real-time dashboard",
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        subItemtitle:
          "Safely integrate data with secure login and automatic API access.",
      },
      {
        id: 2,
        subItemtitle:
          "Access real-time financial status for strategic decision-making",
      },
      {
        id: 3,
        subItemtitle:
          "Ensure regulatory compliance with automatic notification monitoring.",
      },
      {
        id: 4,
        subItemtitle:
          "Inform strategies with comprehensive dashboard data for competitive edge",
      },
    ],
  };
  // invitation
  return (
    <div className="flex flex-col">
      {/* Invitation table */}
      <div>
        {isReceivedInviteLoading && <Loading />}

        {filteredData?.length > 0 && (
          <div className=" rounded-xl px-2 my-5 mx-2 overflow-y-auto scrollBarStyles max-h-[200px]">
            <SubHeader
              name={"Pending Invites"}
              className="mb-2 "
            ></SubHeader>
            <DataTable columns={InviteColumns} data={filteredData} />
          </div>
        )}
      </div>

      {/* dashboard */}
      <div className={receivedInviteData.length !== 0 ? "px-2 " : ""}>
        <SubHeader name={"Dashboard"}></SubHeader>

        <EmptyStageComponent
          heading={dashBoardEmptyStagedata.heading}
          subHeading={dashBoardEmptyStagedata.subHeading}
          subItems={dashBoardEmptyStagedata.subItems}
        />
      </div>
      {/* <div className="flex flex-wrap gap-2">
        {
          dashBoardData.map((cardItem) => (
            <DashCard key={cardItem.id} title={cardItem.title} numbers={cardItem.numbers} growth={cardItem.growth} icon={cardItem.icon}/>
          ))
        }
      </div> */}
    </div>
  );
}
