'use client';

import { Button } from '@/components/ui/button';
import DashCard from '@/components/ui/DashCard';
import LineCharts from '@/components/ui/LineCharts';
import PieCharts from '@/components/ui/PieCharts';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { Download } from 'lucide-react';
import React from 'react';

// dashcards
const dummyData = [
  { title: 'Total Sign Up', numbers: '1,245', growth: '+12%', icon: '📈' },
  { title: 'New Users', numbers: '320', growth: '-5%', icon: '👤' },
  { title: 'Revenue', numbers: '$12,340', growth: '+8%', icon: '💰' },
  { title: 'Orders', numbers: '789', growth: '+15%', icon: '📦' },
];

// data for 2 lines Linechart
const data = [
  { name: 'Jan', accepted: 400, pending: 800 },
  { name: 'Feb', accepted: 420, pending: 780 },
  { name: 'Mar', accepted: 450, pending: 790 },
  { name: 'Apr', accepted: 470, pending: 810 },
  { name: 'May', accepted: 500, pending: 850 },
  { name: 'Jun', accepted: 600, pending: 900 },
  { name: 'Jul', accepted: 700, pending: 920 },
  { name: 'Aug', accepted: 300, pending: 870 },
  { name: 'Sep', accepted: 950, pending: 990 },
];
const INVITATION_LINES = [
  { dataKey: 'accepted', name: 'Accepted', color: '#007bff' }, // Blue
  { dataKey: 'pending', name: 'Pending', color: '#F8BA05' }, // Yellow
];

// data for pie charts
const pieChartdata = [
  { name: 'Pending', value: 400 },
  { name: 'Accepted', value: 300 },
];
const PIE_COLORS = ['#F8BA05', '#007bff'];

// data for 3 lines Linechart
const dataThreeLineChart = [
  { name: 'Jan', legend1: 400, legend2: 800, legend3: 600 },
  { name: 'Feb', legend1: 420, legend2: 780, legend3: 620 },
  { name: 'Mar', legend1: 450, legend2: 790, legend3: 630 },
  { name: 'Apr', legend1: 470, legend2: 810, legend3: 650 },
  { name: 'May', legend1: 500, legend2: 850, legend3: 700 },
  { name: 'Jun', legend1: 600, legend2: 900, legend3: 750 },
  { name: 'Jul', legend1: 700, legend2: 920, legend3: 780 },
  { name: 'Aug', legend1: 300, legend2: 870, legend3: 740 },
  { name: 'Sep', legend1: 950, legend2: 990, legend3: 820 },
];
const ONBOARDING_LINES = [
  { dataKey: 'legend1', name: 'Legend 1', color: '#007bff' }, // Blue
  { dataKey: 'legend2', name: 'Legend 2', color: '#E63946' }, // Red
  { dataKey: 'legend3', name: 'Legend 3', color: '#F8BA05' }, // Yellow ✅ Fixed
];

const AdminReportsPage = () => {
  return (
    <Wrapper>
      <div className="flex items-center justify-between gap-2 p-1">
        <SubHeader name="Reports" />
        <div className="flex gap-2">
          <SearchInput searchPlaceholder="Search..." />
          <Button size="sm" variant="outline">
            <Download size={14} />
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-5">
        {/* Dashboard Metrics */}
        <div className="flex h-full w-full gap-5">
          {dummyData.map((data) => (
            <DashCard
              key={data.title}
              title={data.title}
              numbers={data.numbers}
              growth={data.growth}
              icon={data.icon}
            />
          ))}
        </div>

        {/* Reports Section */}
        <div className="flex justify-between gap-5">
          {/* Pie Chart Placeholder */}
          <div className="w-1/3 rounded-md border p-4">
            <h3 className="mb-2 text-lg font-semibold">Invitation Status</h3>
            {/* Add PieChart Component here */}
            <PieCharts data={pieChartdata} colors={PIE_COLORS} />
          </div>

          {/* Line Chart */}
          <div className="w-2/3 rounded-md border p-4">
            <h3 className="mb-2 text-lg font-semibold">Invitation Trend</h3>
            <LineCharts
              data={data}
              lines={INVITATION_LINES}
              width={700}
              height={300}
            />
          </div>
        </div>

        {/* Reports Section 2 */}
        <div className="flex justify-between gap-5">
          {/* Line Chart */}
          <div className="w-2/3 rounded-md border p-4">
            <h3 className="mb-2 text-lg font-semibold">Onboarding Trend</h3>
            <LineCharts
              data={dataThreeLineChart}
              lines={ONBOARDING_LINES}
              width={700}
              height={300}
            />
          </div>

          {/* funnel Chart */}
        </div>
      </section>
    </Wrapper>
  );
};

export default AdminReportsPage;
