import React from "react";
import Tooltips from "./Tooltips";
import { Info } from "lucide-react";

const Badge = (status) => {
  console.log(status);

  let statusText,
    statusColor,
    statusBG,
    statusBorder,
    btnName,
    actionBtn,
    tooltip;
  switch (status) {
    case "ACCEPTED":
      statusText = "Accepted";
      statusColor = "#39C06F";
      statusBG = "#39C06F1A";
      statusBorder = "#39C06F";
      break;
    case "NEW":
      statusText = "New";
      statusColor = "#1863B7";
      statusBG = "#1863B71A";
      statusBorder = "#1863B7";
      break;
    case "NEGOTIATION":
      statusText = "Negotiation";
      statusColor = "#F8BA05";
      statusBG = "#F8BA051A";
      statusBorder = "#F8BA05";
      actionBtn = "action";
      tooltip = <Tooltips trigger={<Info size={14} />} isContentShow="true" />;
      break;
    default:
      return null;
  }

  return (
    <div
      className="w-24 p-1 flex justify-center items-center font-bold border rounded gap-1"
      style={{
        color: statusColor,
        backgroundColor: statusBG,
        border: statusBorder,
      }}
    >
      {statusText} {tooltip}
    </div>
    // <div>{status}</div>
  );
};

export default Badge;
