'use client';

import { invitation } from '@/api/invitation/Invitation';
import { useInviteColumns } from '@/components/columns/useInviteColumns';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { LocalStorageService } from '@/lib/utils';
import { getReceivedInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const InviteColumns = useInviteColumns();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  // get received invitations
  const { data: receivedInviteData = [], isLoading: isReceivedInviteLoading } =
    useQuery({
      queryKey: [invitation.getReceivedInvitation.endpointKey],
      queryFn: () => getReceivedInvitation(),
      select: (data) => data.data.data,
    });

  const ReceivedformattedData = receivedInviteData?.map((user) => ({
    ...user.enterprise,
    id: user.invitation.id,
    status: user.status,
  }));

  const filteredData = ReceivedformattedData.filter(
    (data) => data.status === 'PENDING',
  );

  const dashBoardEmptyStagedata = {
    heading:
      'Seamlessly monitor financial health and compliance with an integrated, real-time dashboard',
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        subItemtitle:
          'Safely integrate data with secure login and automatic API access.',
      },
      {
        id: 2,
        subItemtitle:
          'Access real-time financial status for strategic decision-making',
      },
      {
        id: 3,
        subItemtitle:
          'Ensure regulatory compliance with automatic notification monitoring.',
      },
      {
        id: 4,
        subItemtitle:
          'Inform strategies with comprehensive dashboard data for competitive edge',
      },
    ],
  };

  return (
    <div className="flex h-full flex-col gap-10">
      <SubHeader name={'Dashboard'}></SubHeader>

      {/* Invitation table */}
      {isReceivedInviteLoading && <Loading />}
      {!isReceivedInviteLoading && filteredData?.length > 0 && (
        <div className="scrollBarStyles min-h-[200px] overflow-y-auto">
          <SubHeader name={'Pending Invites'} className="mb-1"></SubHeader>
          <DataTable columns={InviteColumns} data={filteredData} />
        </div>
      )}

      {enterpriseId && (
        <div className="h-full rounded-md">
          <EmptyStageComponent
            heading={dashBoardEmptyStagedata.heading}
            subHeading={dashBoardEmptyStagedata.subHeading}
            subItems={dashBoardEmptyStagedata.subItems}
          />
        </div>
      )}

      {!enterpriseId && <RestrictedComponent />}
    </div>
  );
}
