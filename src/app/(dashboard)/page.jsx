
"use client";
import DashCard from "../../components/ui/DashCard";

export default function Home() {
  const dashBoardData = [
    { id: 1, title: 'Total revenue', numbers: '$28.4', growth: '+3.4%' },
    { id: 2, title: 'Today revenue', numbers: '$12.4', growth: '-2.4%' },
    { id: 3, title: 'Total Products', numbers: '2365', growth: '' },
    { id: 4, title: 'Items Sold', numbers: '22K', growth: '' },
    { id: 5, title: 'Items Sold | Day', numbers: '11', growth: '' }
  ];

  return (
    <div className="flex justify-between">
      {
        dashBoardData.map((cardItem) => (
          <DashCard key={cardItem.id} title={cardItem.title} numbers={cardItem.numbers} growth={cardItem.growth} />
        ))
      }
    </div>

  );
}
