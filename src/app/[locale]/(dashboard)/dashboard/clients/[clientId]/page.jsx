'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { capitalize, formatValue } from '@/appUtils/helperFunctions';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { getClient } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const { hasPermission } = usePermission();

  const translations = useTranslations('client.clientDetails');
  const [tab, setTab] = useState('overview');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const clientBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/clients',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/clients/${clientId}`,
      show: true, // Always show
    },
  ];

  // api calling for clientDetails
  const { isLoading, data: clientDetails } = useQuery({
    queryKey: [clientEnterprise.getClient.endpointKey],
    queryFn: () => getClient(clientId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:clients-view'),
  });

  if (!clientDetails || isLoading) {
    return <p className="p-6 text-gray-500">Loading enterprise details...</p>;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:clients-view'}>
      <Wrapper className="h-full py-2">
        {/* headers */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <div className="flex gap-2">
            {/* breadcrumbs */}
            <OrderBreadCrumbs possiblePagesBreadcrumbs={clientBreadCrumbs} />
          </div>
          <div className="flex gap-2"></div>
        </section>

        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('tabs.tab1.title')}
            </TabsTrigger>
            <TabsTrigger value="document">
              {translations('tabs.tab2.title')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview
              data={{
                name: formatValue(
                  clientDetails?.client?.name ||
                    clientDetails?.invitation?.userDetails?.name,
                ),
                enterpriseType: capitalize(
                  clientDetails?.client?.type ||
                    clientDetails?.invitation?.userDetails?.type,
                ),
                email: formatValue(
                  clientDetails?.client?.email ||
                    clientDetails?.invitation?.userDetails?.email,
                ),
                phone: formatValue(
                  `+91 ${
                    clientDetails?.client?.mobileNumber ||
                    clientDetails?.invitation?.userDetails?.mobileNumber
                  }`,
                ),
                address: formatValue(clientDetails?.address?.address),
              }}
              labelMap={{
                name: translations('tabs.tab1.content.overview_labels.name'),
                enterpriseType: translations(
                  'tabs.tab1.content.overview_labels.enterprise_type',
                ),
                email: translations('tabs.tab1.content.overview_labels.email'),
                phone: translations('tabs.tab1.content.overview_labels.phone'),
                address: translations(
                  'tabs.tab1.content.overview_labels.address',
                ),
              }}
            />
          </TabsContent>
          <TabsContent value="document">
            <Overview
              data={{
                directorName: formatValue(
                  clientDetails?.client?.type === 'proprietorship'
                    ? clientDetails?.client?.name ||
                        clientDetails?.invitation?.userDetails?.name
                    : clientDetails?.client?.director?.name,
                ),
                directorNumber: formatValue(
                  clientDetails?.client?.type === 'proprietorship'
                    ? clientDetails?.client?.mobileNumber ||
                        clientDetails?.invitation?.userDetails?.mobileNumber
                    : clientDetails?.client?.director?.mobileNumber,
                ),
                pan:
                  clientDetails?.client?.panNumber ||
                  clientDetails?.invitation?.userDetails?.panNumber,
                gst:
                  clientDetails?.client?.gstNumber ||
                  clientDetails?.invitation?.userDetails?.gstNumber,
                cin:
                  clientDetails?.client?.cin ||
                  clientDetails?.invitation?.userDetails?.cin,
                udyam:
                  clientDetails?.client?.udyam ||
                  clientDetails?.invitation?.userDetails?.udyam,
              }}
              labelMap={{
                directorName: translations(
                  'tabs.tab2.content.overview_labels.director_name',
                ),
                directorNumber: translations(
                  'tabs.tab2.content.overview_labels.director_number',
                ),
                pan: translations('tabs.tab2.content.overview_labels.pan'),
                gst: translations('tabs.tab2.content.overview_labels.gst'),
                cin: translations('tabs.tab2.content.overview_labels.cin'),
                udyam: translations('tabs.tab2.content.overview_labels.udyam'),
              }}
            />
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
}
