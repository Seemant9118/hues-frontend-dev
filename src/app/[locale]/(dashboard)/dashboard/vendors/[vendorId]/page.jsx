'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { capitalize, formatValue } from '@/appUtils/helperFunctions';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { getVendor } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

export default function VendorsDetailsPage() {
  const { vendorId } = useParams();
  const { hasPermission } = usePermission();

  const translations = useTranslations('vendor');
  const [tab, setTab] = useState('overview');
  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const vendorBreadCrumbs = [
    {
      id: 1,
      name: translations('title'),
      path: '/dashboard/vendors',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('vendorDetails.title'),
      path: `/dashboard/vendors/${vendorId}`,
      show: true, // Always show
    },
  ];

  // api calling for clientDetails
  const { isLoading, data: vendorDetails } = useQuery({
    queryKey: [vendorEnterprise.getVendor.endpointKey],
    queryFn: () => getVendor(vendorId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:vendors-view'),
  });

  if (!vendorDetails || isLoading) {
    return <p className="p-6 text-gray-500">Loading enterprise details...</p>;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:vendors-view'}>
      <Wrapper className="h-full py-2">
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <div className="flex gap-2">
            {/* breadcrumbs */}
            <OrderBreadCrumbs possiblePagesBreadcrumbs={vendorBreadCrumbs} />
          </div>
          <div className="flex gap-2"></div>
        </section>

        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('vendorDetails.tabs.tab1.title')}
            </TabsTrigger>
            <TabsTrigger value="document">
              {translations('vendorDetails.tabs.tab2.title')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview
              data={{
                name: formatValue(
                  vendorDetails?.vendor?.name ||
                    vendorDetails?.invitation?.userDetails?.name,
                ),
                enterpriseType: capitalize(
                  vendorDetails?.vendor?.type ||
                    vendorDetails?.invitation?.userDetails?.type,
                ),
                email: formatValue(
                  vendorDetails?.vendor?.email ||
                    vendorDetails?.invitation?.userDetails?.email,
                ),
                phone: formatValue(
                  `+91 ${
                    vendorDetails?.vendor?.mobileNumber ||
                    vendorDetails?.invitation?.userDetails?.mobileNumber
                  }`,
                ),
                address: formatValue(vendorDetails?.address?.address),
              }}
              labelMap={{
                name: 'Vendor Name',
                enterpriseType: 'Enterprise type',
                email: 'Email',
                phone: 'Phone Number',
                address: 'Enterprise Address',
              }}
            />
          </TabsContent>
          <TabsContent value="document">
            <Overview
              data={{
                directorName: formatValue(
                  vendorDetails?.vendor?.type === 'proprietorship'
                    ? vendorDetails?.vendor?.name ||
                        vendorDetails?.invitation?.userDetails?.name
                    : vendorDetails?.vendor?.director?.name,
                ),
                directorNumber: formatValue(
                  vendorDetails?.vendor?.type === 'proprietorship'
                    ? vendorDetails?.vendor?.mobileNumber ||
                        vendorDetails?.invitation?.userDetails?.mobileNumber
                    : vendorDetails?.vendor?.director?.mobileNumber,
                ),
                pan:
                  vendorDetails?.vendor?.panNumber ||
                  vendorDetails?.invitation?.userDetails?.panNumber,
                gst:
                  vendorDetails?.vendor?.gstNumber ||
                  vendorDetails?.invitation?.userDetails?.gstNumber,
                cin:
                  vendorDetails?.vendor?.cin ||
                  vendorDetails?.invitation?.userDetails?.cin,
                udyam:
                  vendorDetails?.vendor?.udyam ||
                  vendorDetails?.invitation?.userDetails?.udyam,
              }}
              labelMap={{
                directorName: 'Director Name',
                directorNumber: 'Director Phone number',
                pan: 'Enterprise PAN',
                gst: 'GSTIN',
                cin: 'CIN',
                udyam: 'UDYAM',
              }}
            />
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
}
