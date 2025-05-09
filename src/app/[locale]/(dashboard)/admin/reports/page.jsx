'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { Button } from '@/components/ui/button';
import DashCard from '@/components/ui/DashCard';
import DateRange from '@/components/ui/DateRange';
import Loading from '@/components/ui/Loading';
import PieCharts from '@/components/ui/PieCharts';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getAdminData } from '@/services/Admin_Services/AdminServices';
import { useQuery } from '@tanstack/react-query';
import {
  Boxes,
  CreditCard,
  Download,
  Fingerprint,
  TabletSmartphone,
  UserRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// dashcards
// const dummyData = [
//   {
//     title: 'Total Sign-ups',
//     numbers: '1,245',
//     growth: '+12%',
//     icon: <UserRound size={16} className="text-green-500" />,
//   },
//   { title: 'Users Logins', numbers: '320', growth: '-5%', icon: '👤' },
//   {
//     title: 'First Order Created',
//     numbers: '$12,340',
//     growth: '+8%',
//     icon: '💰',
//   },
//   { title: 'Order Conversion', numbers: '789', growth: '+15%', icon: '📦' },
// ];

// data for 2 lines Linechart
// const data = [
//   { name: 'Jan', accepted: 400, pending: 800 },
//   { name: 'Feb', accepted: 420, pending: 780 },
//   { name: 'Mar', accepted: 450, pending: 790 },
//   { name: 'Apr', accepted: 470, pending: 810 },
//   { name: 'May', accepted: 500, pending: 850 },
//   { name: 'Jun', accepted: 600, pending: 900 },
//   { name: 'Jul', accepted: 700, pending: 920 },
//   { name: 'Aug', accepted: 300, pending: 870 },
//   { name: 'Sep', accepted: 950, pending: 990 },
// ];
// const INVITATION_LINES = [
//   { dataKey: 'accepted', name: 'Accepted', color: '#007bff' }, // Blue
//   { dataKey: 'pending', name: 'Pending', color: '#F8BA05' }, // Yellow
// ];

// data for pie charts

// data for 3 lines Linechart
// const dataThreeLineChart = [
//   { name: 'Jan', legend1: 400, legend2: 800, legend3: 600 },
//   { name: 'Feb', legend1: 420, legend2: 780, legend3: 620 },
//   { name: 'Mar', legend1: 450, legend2: 790, legend3: 630 },
//   { name: 'Apr', legend1: 470, legend2: 810, legend3: 650 },
//   { name: 'May', legend1: 500, legend2: 850, legend3: 700 },
//   { name: 'Jun', legend1: 600, legend2: 900, legend3: 750 },
//   { name: 'Jul', legend1: 700, legend2: 920, legend3: 780 },
//   { name: 'Aug', legend1: 300, legend2: 870, legend3: 740 },
//   { name: 'Sep', legend1: 950, legend2: 990, legend3: 820 },
// ];
// const ONBOARDING_LINES = [
//   { dataKey: 'legend1', name: 'Legend 1', color: '#007bff' }, // Blue
//   { dataKey: 'legend2', name: 'Legend 2', color: '#E63946' }, // Red
//   { dataKey: 'legend3', name: 'Legend 3', color: '#F8BA05' }, // Yellow ✅ Fixed
// ];

// data for funnel charts
// const funnelData = [
//   { name: 'Visitors', value: 5000 },
//   { name: 'Visitors', value: 4000 },
//   { name: 'Sign-ups', value: 2000 },
//   { name: 'Purchases', value: 1000 },
//   { name: 'Repeat Customers', value: 500 },
// ];

const AdminReportsPage = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [tab, setTab] = useState('onboarding');
  const startDate = new Date('2024/03/01');
  const todayDate = new Date();
  const [dateRange, setDateRange] = useState([startDate, todayDate]);
  const [pieChartData, setPieChartData] = useState(null);
  const token = LocalStorageService.get('token');

  // to get data from JWT
  function parseJwt(token) {
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      );
      return JSON.parse(payload);
    } catch (error) {
      return null;
    }
  }

  const onTabChange = (value) => {
    setTab(value);
  };

  const { data: adminData, isLoading } = useQuery({
    queryKey: [AdminAPIs.getAdminData.endpointKey],
    queryFn: () => getAdminData(dateRange),
    select: (res) => res?.data?.data,
    enabled:
      checkedAuth &&
      isAdmin &&
      tab === 'onboarding' &&
      Array.isArray(dateRange) &&
      dateRange[0] !== null &&
      dateRange[1] !== null,
  });

  useEffect(() => {
    if (adminData?.invitationData) {
      const accepted =
        Number(adminData.invitationData.acceptedInvitations) || 0;
      const total = Number(adminData.invitationData.totalInvitations) || 0;
      const pending = total - accepted;

      setPieChartData([
        { name: 'Pending', value: pending },
        { name: 'Accepted', value: accepted },
      ]);
    }
  }, [adminData]);
  const PIE_COLORS = ['#F8BA05', '#007bff'];

  useEffect(() => {
    const tokenData = parseJwt(token);
    const isAdminCheck = tokenData?.roles?.includes('ADMIN');
    setIsAdmin(isAdminCheck);
    setCheckedAuth(true);
  }, [token]);

  useEffect(() => {
    if (checkedAuth && !isAdmin) {
      router.push('/unauthorized');
    }
  }, [checkedAuth, isAdmin]);

  if (!checkedAuth) return <Loading />;

  return (
    <Wrapper>
      {/* headers */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
        <SubHeader name="Reports" />
        <div className="flex gap-2">
          <SearchInput searchPlaceholder="Search..." disabled={true} />
          <Button size="sm" variant="outline">
            <Download size={14} />
          </Button>
        </div>
      </div>

      {/* tabs */}
      <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
        {/* TabsHeader */}
        <section className="sticky top-12 z-10 flex w-full justify-between bg-white py-2">
          <TabsList className="border">
            <TabsTrigger
              className={`w-24 ${tab === 'onboarding' ? 'shadow-customShadow' : ''}`}
              value="onboarding"
            >
              Onboarding
            </TabsTrigger>
            <TabsTrigger
              className={`w-24 ${tab === 'sales' ? 'shadow-customShadow' : ''}`}
              value="sales"
            >
              Sales
            </TabsTrigger>
            <TabsTrigger
              className={`${tab === 'purchase' ? 'shadow-customShadow' : ''}`}
              value="purchase"
            >
              Purchase
            </TabsTrigger>
            <TabsTrigger
              className={`w-24 ${tab === 'inventory' ? 'shadow-customShadow' : ''}`}
              value="inventory"
            >
              Inventory
            </TabsTrigger>

            <TabsTrigger
              className={`w-24 ${tab === 'vendors' ? 'shadow-customShadow' : ''}`}
              value="vendors"
            >
              Vendors
            </TabsTrigger>

            <TabsTrigger
              className={`w-24 ${tab === 'catalogues' ? 'shadow-customShadow' : ''}`}
              value="catalogues"
            >
              Catalogues
            </TabsTrigger>

            <TabsTrigger
              className={`w-24 ${tab === 'gst' ? 'shadow-customShadow' : ''}`}
              value="gst"
            >
              GST
            </TabsTrigger>
          </TabsList>
        </section>

        {/* CurrentTabHeader */}
        {tab === 'onboarding' && (
          <div className="flex items-center justify-between">
            <section className="bg-white px-2 py-4">
              <h2 className="text-lg font-semibold">Onboarding Analytics</h2>
              <p className="text-sm text-gray-500">
                Track user sign-ups, engagement, and business activity
              </p>
            </section>
            <DateRange dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        )}

        <TabsContent value="onboarding" className="flex flex-col gap-4">
          {/* Onboarding */}
          {isLoading && <Loading />}

          {!isLoading && (
            <section className="flex flex-col gap-5">
              {/* Dashboard Metrics */}
              <div className="grid grid-cols-3 grid-rows-2 gap-2">
                {/* total no. of signups */}
                {adminData?.totalSignups && (
                  <DashCard
                    title={'Total Sign-ups'}
                    numbers={adminData?.totalSignups}
                    // growth={'+12%'}
                    icon={<UserRound size={16} className="text-green-500" />}
                  />
                )}

                {/* total no. of users logins */}
                {adminData?.numberOfPeopleLogedIn && (
                  <DashCard
                    title={'Users Logins'}
                    numbers={adminData?.numberOfPeopleLogedIn}
                    // growth={'+5%'}
                    icon={<UserRound size={16} className="text-green-500" />}
                  />
                )}

                {/* total no. of order created */}
                {adminData?.numberOfOrderCreated && (
                  <DashCard
                    title={'Total Order Created'}
                    numbers={adminData?.numberOfOrderCreated}
                    // growth={'+5%'}
                    icon={<Boxes size={16} className="text-green-500" />}
                  />
                )}

                {/* total no. of mobile verified */}
                {adminData?.mobileVerified && (
                  <DashCard
                    title={'Total Mobile Verified'}
                    numbers={adminData?.mobileVerified}
                    // growth={'+5%'}
                    icon={
                      <TabletSmartphone size={16} className="text-green-500" />
                    }
                  />
                )}

                {/* total no. of pan verified */}
                {adminData?.panVerified && (
                  <DashCard
                    title={'Total PAN Verified'}
                    numbers={adminData?.panVerified}
                    // growth={'+5%'}
                    icon={<CreditCard size={16} className="text-green-500" />}
                  />
                )}

                {/* total no. of aadhar verified */}
                {adminData?.aadharVerified && (
                  <DashCard
                    title={'Total Aadhar Verified'}
                    numbers={adminData?.aadharVerified}
                    // growth={'+5%'}
                    icon={<Fingerprint size={16} className="text-green-500" />}
                  />
                )}
              </div>

              {/* Reports Section */}
              <div className="flex justify-between gap-5">
                {/* Pie Chart Placeholder */}
                <div className="w-1/4 rounded-md border p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Invitation Status
                  </h3>
                  {/* Add PieChart Component here */}
                  <PieCharts
                    data={pieChartData}
                    totalInvitation={
                      adminData?.invitationData?.totalInvitations
                    }
                    colors={PIE_COLORS}
                  />
                </div>

                {/* funnel Chart */}
                {/* <div className="w-2/3 rounded-md border p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Onboarding Funnel
                  </h3>
                  <FunnelCharts data={funnelData} />
                </div> */}

                {/* Line Chart */}
                {/* <div className="w-2/3 rounded-md border p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Invitation Trend
                  </h3>
                  <LineCharts
                    data={data}
                    lines={INVITATION_LINES}
                    width={700}
                    height={300}
                  />
                </div> */}
              </div>

              {/* Reports Section 2 */}
              {/* <div className="flex justify-between gap-5">
                <div className="w-2/3 rounded-md border p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Onboarding Trend
                  </h3>
                  <LineCharts
                    data={dataThreeLineChart}
                    lines={ONBOARDING_LINES}
                    width={700}
                    height={300}
                  />
                </div>

                <div className="w-2/3 rounded-md border p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Onboarding Funnel
                  </h3>
                  <FunnelCharts data={funnelData} />
                </div>
              </div> */}
            </section>
          )}
        </TabsContent>
        <TabsContent value="sales">Coming Soon...</TabsContent>
        <TabsContent value="purchase">Coming Soon...</TabsContent>
        <TabsContent value="inventory">Coming Soon...</TabsContent>
        <TabsContent value="vendors">Coming Soon...</TabsContent>
        <TabsContent value="catalogues">Coming Soon...</TabsContent>
        <TabsContent value="gst">Coming Soon...</TabsContent>
      </Tabs>
    </Wrapper>
  );
};

export default AdminReportsPage;
