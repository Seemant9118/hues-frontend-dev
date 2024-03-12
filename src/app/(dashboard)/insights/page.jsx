import EmptyStageComponent from "@/components/EmptyStageComponent";
import SubHeader from "@/components/Sub-header";
import React from "react";

const InsightsPage = () => {

  const InsightEmptyStageData = {
    heading: 'Unlock Powerful Business Insights',
    desc: `Harness the power of your financial data with our Insights feature, designed to illuminate the
    path towards informed business decisions. Dive deep into analyses of sales, purchases, capital
    structure, and more, transforming raw data into actionable intelligence. Share these insights
    securely, fostering collaboration and strategic planning across your business network`,
    subHeading: 'User Sections',
    subItems: [
      {
        id: 1, itemhead: `Analyze Financial Activity: `, item: `Explore comprehensive analyses of your sales, purchases, capital
        structure, and financial infusions.`
      },
      {
        id: 2, itemhead: `Share Insights:`, item: ` Securely share your financial insights with other users, ensuring collaborative
        analysis with explicit consent`
      },
      {
        id: 3, itemhead: `Drive Decisions:`, item: ` Utilize these insights to guide your business decisions, applying a blend of
        knowledge, information, and analysis for strategic action`
      },
      {
        id: 4, itemhead: ` Foster Collaboration: `, item: `Enhance decision-making processes by sharing and discussing insights,
        promoting a culture of informed decision-making`
      },
    ],
    moreInsight: [
      {
        moreInsighthead: 'Data Management',
        moreInsightsubHead: ["Templates - Forms, Contracts", "Analytics - Data, Analytic"],
      },
      {
        moreInsighthead: 'Consent Management',
        moreInsightsubHead: ["Templates - Forms, Contracts", "Analytics - Data, Analytic"],
      },
      {
        moreInsighthead: 'Inventory Management',
        moreInsightsubHead: ["Templates - Forms, Contracts", "Analytics - Data, Analytic"],
      },
      {
        moreInsighthead: `Order Management - Orders`,
        moreInsightsubHead: ["Sales - Bid, Offer", "Purchases - Bid, Offer"],
      },
      {
        moreInsighthead: 'Invoices',
        moreInsightsubHead: ["Sales", "Purchases"],
      },
      {
        moreInsighthead: 'Payment Management -',
        moreInsightsubHead: ["Payments - Advices (receipts), Notes"],
      },
      {
        moreInsighthead: 'Relationship Management ',
        moreInsightsubHead: ["Clients", "Vendors"],
      },
    ],
  };



  return (
    <div>
      <SubHeader name="Insight" />
      <EmptyStageComponent heading={InsightEmptyStageData.heading} desc={InsightEmptyStageData.desc} subHeading={InsightEmptyStageData.subHeading} subItems={InsightEmptyStageData.subItems} more={InsightEmptyStageData.moreInsight} />
    </div>
  );
};

export default InsightsPage;
