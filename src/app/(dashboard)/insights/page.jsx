import EmptyStageComponent from "@/components/EmptyStageComponent";
import SubHeader from "@/components/Sub-header";
import { DatabaseZap, FileText, KeySquare, ShieldCheck } from "lucide-react";
import React from "react";

const InsightsPage = () => {
  const InsightEmptyStageData = {
    heading: `~"Transform financial data into actionable intelligence with Insights, enhancing decision-making
    and secure collaboration."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <KeySquare size={14} />,
        subItemtitle: `Analyze sales, purchases, assets, liabilities, and capital structure comprehensively.`,
      },
      {
        id: 2,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Securely share financial insights for collaborative analysis with consent.`,
      },
      {
        id: 3,
        icon: <ShieldCheck size={14} />,
        subItemtitle: `Guide decisions with insights blending knowledge, information, and analysis.`,
      },
      {
        id: 4,
        icon: <FileText size={14} />,
        subItemtitle: `Promote informed decision-making through shared insights and collaboration.`,
      },
    ],
  };

  return (
    <div>
      <SubHeader name="Insight" />
      <EmptyStageComponent
        heading={InsightEmptyStageData.heading}
        desc={InsightEmptyStageData.desc}
        subHeading={InsightEmptyStageData.subHeading}
        subItems={InsightEmptyStageData.subItems}
        more={InsightEmptyStageData.moreInsight}
      />
    </div>
  );
};

export default InsightsPage;
