"use client";
import DashCard from "../../components/ui/DashCard";
import SubHeader from "@/components/Sub-header";
import AddModal from "@/components/Modals/AddModal";

import { KeySquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Home() {
  const dashBoardData = [
    { id: 1, title: 'Total revenue', numbers: '₹52.4k', growth: '+3.4%' },
    { id: 2, title: 'Today revenue', numbers: '₹12.87k', growth: '-2.4%' },
    { id: 3, title: 'Total Products', numbers: '2365', growth: '' },
    { id: 4, title: 'Items Sold', numbers: '22K', growth: '' },
    { id: 5, title: 'Items Sold | Day', numbers: '11', growth: '' }
  ];

  return (
    <>
      <SubHeader name={"Dashboard"} className="mb-5">
        <div className="flex items-center justify-center gap-4">
          {/* <Button
           
            variant={"blue_outline"}
            size="sm"
          >
            <KeySquare size={14}/>
            Save Credentials
          </Button> */}
          <AddModal type={"Save Credentials"} />
        </div>
      </SubHeader>

      <div className="flex flex-wrap gap-2">
        {
          dashBoardData.map((cardItem) => (
            <DashCard key={cardItem.id} title={cardItem.title} numbers={cardItem.numbers} growth={cardItem.growth} />
          ))
        }
      </div>
    </>
  );
}
