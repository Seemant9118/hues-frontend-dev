"use client";
import DashCard from "../../components/ui/DashCard";
import SubHeader from "@/components/Sub-header";
import AddModal from "@/components/Modals/AddModal";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import { LineChart } from "lucide-react";

export default function Home() {
  const dashBoardData = [
    { id: 1, title: 'YTD Sale', numbers: '₹52.4k', growth: '+3.4%', icon: <LineChart size={16} /> },
    { id: 2, title: 'Daily Sale', numbers: '₹12.87k', growth: '-2.4%' },
    { id: 3, title: 'Products', numbers: '2365', growth: '', icon: <LineChart size={16} /> },
    { id: 4, title: 'YTD Items Sold', numbers: '22K', growth: '', icon: <LineChart size={16} /> },
    { id: 5, title: 'Items Sold Today', numbers: '11', growth: '' }
  ];

  const dashBoardEmptyStagedata = {
    heading: "Seamlessly monitor financial health and compliance with an integrated, real-time dashboard",
    subHeading: "Features",
    subItems: [
      { id: 1, subItemtitle: "Safely integrate data with secure login and automatic API access." },
      { id: 2, subItemtitle: "Access real-time financial status for strategic decision-making" },
      { id: 3, subItemtitle: "Ensure regulatory compliance with automatic notification monitoring." },
      { id: 4, subItemtitle: "Inform strategies with comprehensive dashboard data for competitive edge" },
    ]
  };

  return (
    <>
      <SubHeader name={"Dashboard"} className="mb-5">
        <div className="flex items-center justify-center gap-4">
          <AddModal type="Save GST Credentials" cta="Password Manager" modalHead="One-Time Setup for Future Convenience" />
        </div>
      </SubHeader>


      {/* <EmptyStageComponent heading={dashBoardEmptyStagedata.heading} subHeading={dashBoardEmptyStagedata.subHeading} subItems={dashBoardEmptyStagedata.subItems} /> */}

      <div className="flex flex-wrap gap-2">
        {
          dashBoardData.map((cardItem) => (
            <DashCard key={cardItem.id} title={cardItem.title} numbers={cardItem.numbers} growth={cardItem.growth} icon={cardItem.icon}/>
          ))
        }
      </div>
    </>
  );
}
