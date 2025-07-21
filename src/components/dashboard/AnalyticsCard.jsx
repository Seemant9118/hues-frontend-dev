'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DateRange from '../ui/DateRange';
import LineCharts from '../ui/LineCharts';
import Container from './Container';
import DataGranularity from './DataGranularity';

export const AnalyticsCard = ({
  title,
  tab,
  onTabChange,
  dataGranularity,
  setDataGranularity,
  summary,
  tabsConfig,
  chartData,
  lines,
  dateRange,
  setDateRange,
  translations,
}) => {
  const getGranularityLabel = (type) => {
    return (
      (type === 'DAILY' && translations('analytics.granularity.DAILY')) ||
      (type === 'WEEKLY' && translations('analytics.granularity.WEEKLY')) ||
      (type === 'MONTHLY' && translations('analytics.granularity.MONTHLY')) ||
      ''
    );
  };

  return (
    <div className="w-full">
      <Container
        title={title}
        dateRangeComp={
          <DateRange dateRange={dateRange} setDateRange={setDateRange} />
        }
        granularityComp={
          <DataGranularity
            dataGranualarityType={dataGranularity}
            setDataGranularityType={setDataGranularity}
            translations={translations}
          />
        }
      >
        <Tabs
          value={tab}
          onValueChange={onTabChange}
          defaultValue="totalAmount"
        >
          <TabsList className="border">
            {tabsConfig.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                className={`w-24 ${tab === value ? 'shadow-customShadow' : ''}`}
                value={value}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <section className="mt-4 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            {summary[tab] && (
              <>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">
                    {tabsConfig.find((t) => t.value === tab)?.label}
                  </span>
                  <span className="font-semibold">
                    {formattedAmount(summary[tab].total)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">
                    {translations('analytics.average')}
                  </span>
                  <span className="font-semibold">
                    {formattedAmount(summary[tab].average)}
                  </span>
                  <span className="text-sm">
                    {getGranularityLabel(dataGranularity)}
                  </span>
                </div>
              </>
            )}
          </section>

          {tabsConfig.map(({ value }) => (
            <TabsContent
              key={value}
              value={value}
              className="scrollBarStyles overflow-x-auto"
            >
              <div className="min-w-[500px] pr-4">
                <LineCharts
                  data={chartData[value]}
                  lines={lines}
                  viewType={dataGranularity}
                  height={300}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </div>
  );
};
