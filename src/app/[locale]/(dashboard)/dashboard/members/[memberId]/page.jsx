'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import {
  convertSnakeToTitleCase,
  getEnterpriseId,
} from '@/appUtils/helperFunctions';
import AssignUserModal from '@/components/membersInvite/AssignUserModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getMember,
  removeExternalMember,
} from '@/services/Associate_Members_Services/AssociateMembersServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useDelegatesColumns } from './useDelegatesColumns';

export default function MemberDetailsPage() {
  const queryClient = useQueryClient();
  const { memberId } = useParams();
  const translation = useTranslations('members');
  const enterpriseId = getEnterpriseId();

  const [detailTab, setDetailTab] = useState('overview');
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const removeMutation = useMutation({
    mutationKey: [associateMemberApi.removeExternalMember.endpointKey],
    mutationFn: removeExternalMember,
    onSuccess: () => {
      toast.success('Assigned user removed successfully!');
      queryClient.invalidateQueries([
        associateMemberApi.getMember.endpointKey,
        memberId,
      ]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    },
  });

  const handleRemoveUser = (user) => {
    removeMutation.mutate({
      id: memberId,
      accEnterpriseUserId: user?.userAccountId,
    });
  };

  const { data: memberDetails, isLoading: isMemberDetailsLoading } = useQuery({
    queryKey: [associateMemberApi.getMember.endpointKey, memberId],
    queryFn: () => getMember(memberId),
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to fetch member details',
      );
    },
    select: (res) => res?.data?.data,
    enabled: !!memberId,
  });

  const overviewData = React.useMemo(() => {
    if (!memberDetails) return {};

    const {
      membershipType,
      invitation,
      name: rawName,
      mobileNumber: rawMobile,
      email: rawEmail,
      designation,
      department,
      employeeCode,
      roles,
    } = memberDetails;

    const userDetails = invitation?.userDetails || {};
    const isExternalMember = membershipType === 'EXTERNAL_MEMBER';

    let memberName = '';
    if (isExternalMember) {
      if (memberDetails.sourceEnterpriseId?.id === enterpriseId) {
        memberName = memberDetails.enterpriseId?.name || '';
      } else {
        memberName = memberDetails.sourceEnterpriseId?.name || '';
      }
      if (!memberName) {
        memberName = rawName || memberDetails.enterpriseId?.name || '';
      }
    } else {
      memberName = rawName || userDetails.name || '';
    }

    let mobileNumber = rawMobile || userDetails.mobileNumber;
    if (!mobileNumber && isExternalMember) {
      if (memberDetails.sourceEnterpriseId?.id === enterpriseId) {
        mobileNumber = memberDetails.enterpriseId?.phone;
      } else {
        mobileNumber = memberDetails.sourceEnterpriseId?.phone;
      }
    }
    const formattedMobile = mobileNumber
      ? mobileNumber.startsWith('+91')
        ? mobileNumber
        : `+91 ${mobileNumber}`
      : '-';

    let email = rawEmail || userDetails.email;
    if (!email && isExternalMember) {
      if (memberDetails.sourceEnterpriseId?.id === enterpriseId) {
        email = memberDetails.enterpriseId?.email;
      } else {
        email = memberDetails.sourceEnterpriseId?.email;
      }
    }

    const membershipTypeLabel = isExternalMember
      ? translation('tableColumns.statuses.external') || 'External'
      : translation('tableColumns.statuses.internal') || 'Internal';

    return {
      name: memberName || '-',
      membershipType: <Badge variant="secondary">{membershipTypeLabel}</Badge>,
      email: email || '-',
      phone: formattedMobile,
      designation: designation || '-',
      department: department || '-',
      employeeCode: employeeCode || '-',
      roles: roles?.map((r) => (
        <Badge key={r.roleId || r.id || r.name} variant="secondary">
          {convertSnakeToTitleCase(r.name)}
        </Badge>
      )),
    };
  }, [memberDetails, enterpriseId, translation]);

  const memberBreadCrumbs = React.useMemo(
    () => [
      {
        id: 1,
        name: translation('header') || 'Members',
        path: '/dashboard/members',
        show: true,
      },
      {
        id: 2,
        name: 'Member Details',
        path: `/dashboard/members/${memberId}`,
        show: true,
      },
    ],
    [memberId, translation],
  );

  const delegateColumns = useDelegatesColumns({
    setEditUser,
    setIsEditMode,
    setIsAssignUserOpen,
    handleRemoveUser,
    memberId,
    enterpriseId,
    memberDetails,
  });

  return (
    <ProtectedWrapper permissionCode={'permission:members-view'}>
      <Wrapper className="h-screen py-2">
        <div className="flex flex-col gap-2">
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white">
            <div className="flex gap-2">
              <OrderBreadCrumbs possiblePagesBreadcrumbs={memberBreadCrumbs} />
            </div>
            <div className="flex gap-2"></div>
          </section>

          {isMemberDetailsLoading ? (
            <Loading />
          ) : !memberDetails ? (
            <div className="p-6 text-center text-gray-500">
              Failed to load member details.
            </div>
          ) : (
            <Tabs
              value={detailTab}
              onValueChange={setDetailTab}
              defaultValue="overview"
              className="w-full"
            >
              <section className="flex items-center justify-between">
                <TabsList className="border">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  {memberDetails?.membershipType === 'EXTERNAL_MEMBER' && (
                    <TabsTrigger value="delegates">Delegates</TabsTrigger>
                  )}
                </TabsList>

                {detailTab === 'delegates' &&
                  memberDetails?.membershipType === 'EXTERNAL_MEMBER' &&
                  enterpriseId !== memberDetails?.enterpriseId?.id && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditUser(null);
                        setIsEditMode(false);
                        setIsAssignUserOpen(true);
                      }}
                    >
                      Assign User
                    </Button>
                  )}
              </section>

              <TabsContent value="overview" className="flex flex-col gap-4">
                <Overview
                  data={overviewData}
                  labelMap={{
                    name: translation('tableColumns.name') || 'NAME',
                    membershipType:
                      translation('tableColumns.membershipType') ||
                      'MEMBERSHIP TYPE',
                    email: translation('tableColumns.emailId') || 'EMAIL ID',
                    phone:
                      translation('tableColumns.phoneNumber') || 'PHONE NUMBER',
                    designation:
                      translation('tableColumns.designation') || 'DESIGNATION',
                    department:
                      translation('tableColumns.department') || 'DEPARTMENT',
                    employeeCode:
                      translation('tableColumns.employeeCode') ||
                      'EMPLOYEE CODE',
                    roles: translation('tableColumns.role') || 'ROLES',
                  }}
                />
              </TabsContent>
              {memberDetails?.membershipType === 'EXTERNAL_MEMBER' && (
                <TabsContent value="delegates">
                  <div className="flex flex-col gap-2">
                    <div className="overflow-hidden rounded-sm border bg-white">
                      <DataTable
                        columns={delegateColumns}
                        data={memberDetails?.assignedUsers || []}
                      />
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
          <AssignUserModal
            isOpen={isAssignUserOpen}
            setIsOpen={setIsAssignUserOpen}
            memberId={memberId}
            memberDetails={memberDetails}
            editUser={editUser}
            isEditMode={isEditMode}
          />
        </div>
      </Wrapper>
    </ProtectedWrapper>
  );
}
