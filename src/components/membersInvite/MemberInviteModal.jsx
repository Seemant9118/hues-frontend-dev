'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { rolesApi } from '@/api/rolesApi/rolesApi';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { LocalStorageService } from '@/lib/utils';
import {
  createAssociateMembers,
  updateAssociateMember,
} from '@/services/Associate_Members_Services/AssociateMembersServices';
import { getRoles } from '@/services/Roles_Services/Roles_Services';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';

const MemberInviteModal = ({
  isModalOpen,
  setIsModalOpen,
  membersInfo,
  isEditMode = false,
}) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const translation = useTranslations('components.memberInviteModal');
  const queryClient = useQueryClient();
  const [optionsForRoles, setOptionsForRoles] = useState([]);
  const [member, setMember] = useState({
    name: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    enterpriseId,
    rolesIds: [],
  });

  useEffect(() => {
    if (membersInfo && isEditMode) {
      setMember({
        name: membersInfo.invitation.userDetails.name || '',
        countryCode: '+91',
        mobileNumber: membersInfo.invitation.userDetails.mobileNumber || '',
        email: membersInfo.invitation.userDetails.email || '',
        enterpriseId,
        rolesIds: membersInfo.roles?.map((role) => role.roleId) || [],
      });
    }
  }, [membersInfo]);

  const { data: rolesList } = useQuery({
    queryKey: [rolesApi.getAllRoles.endpointKey],
    queryFn: getRoles,
    select: (data) => data.data.data,
    enabled: !!isModalOpen,
  });

  // api call formatting for roles
  useEffect(() => {
    if (!rolesList) return;

    const optionsForRoles = rolesList?.map((role) => ({
      value: role?.id,
      label: convertSnakeToTitleCase(role?.name),
    }));

    setOptionsForRoles(optionsForRoles);
  }, [rolesList]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMember({ ...member, [name]: value });
  };

  const handleRoleChange = (selectedOptions) => {
    const selectedRoles = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setMember((prev) => ({ ...prev, rolesIds: selectedRoles }));
  };

  const createMemberMutation = useMutation({
    mutationKey: [associateMemberApi.createAssociateMembers.endpointKey],
    mutationFn: createAssociateMembers,
    onSuccess: () => {
      toast.success(translation('toast.success'));
      setMember({
        name: '',
        countryCode: '+91',
        mobileNumber: '',
        email: '',
        enterpriseId,
        rolesIds: [],
      });
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || translation('toast.error'));
    },
  });

  const updateMemberMutation = useMutation({
    mutationKey: [associateMemberApi.updateAssociateMember.endpointKey],
    mutationFn: updateAssociateMember,
    onSuccess: () => {
      toast.success(translation('toast.editSuccess'));
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || translation('toast.error'));
    },
  });

  const handleSubmit = () => {
    if (isEditMode && membersInfo?.id) {
      updateMemberMutation.mutate({
        id: membersInfo.id,
        data: member,
      });
    } else {
      createMemberMutation.mutate(member);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="flex flex-col gap-5">
        <DialogTitle>
          {isEditMode
            ? translation('dialogTitleEdit') // Add this to your translation files
            : translation('dialogTitle')}
        </DialogTitle>

        <form className="w-full">
          <div className="flex flex-col gap-5">
            {/* name */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="text-sm font-bold">
                  {translation('form.name.label')}
                </Label>
                <span className="text-red-600">*</span>
              </div>

              <Input
                className="text-sm font-semibold"
                type="text"
                name="name"
                value={member.name}
                onChange={handleChange}
              />
              {/* {errorMsg.name && <ErrorBox msg={errorMsg.name} />} */}
            </div>

            {/* phone */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="text-sm font-bold">
                  {translation('form.phone.label')}
                </Label>
                <span className="text-red-600">*</span>
              </div>
              <Input
                className="text-sm font-semibold"
                type="tel"
                name="mobileNumber"
                value={member.mobileNumber}
                onChange={handleChange}
              />
              {/* {errorMsg.mobileNumber && (
                  <ErrorBox msg={errorMsg.mobileNumber} />
                )} */}
            </div>

            {/* email */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-bold">
                  {translation('form.email.label')}
                </Label>
                <span className="text-xs font-bold text-[#A5ABBD]">
                  {translation('form.email.optional')}
                </span>
              </div>
              <Input
                className="text-sm font-semibold"
                type="email"
                name="email"
                value={member.email}
                onChange={handleChange}
              />
            </div>

            {/* role */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="text-sm font-bold">
                  {translation('form.role.label')}
                </Label>
                <span className="text-red-600">*</span>
              </div>
              <Select
                isMulti
                name="roles"
                placeholder={translation('form.role.placeholder')}
                options={optionsForRoles}
                className="text-sm"
                classNamePrefix="select"
                value={optionsForRoles?.filter((option) =>
                  member?.rolesIds?.includes(option.value),
                )}
                onChange={handleRoleChange}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                size="sm"
                variant={'outline'}
                onClick={() => {
                  setMember({
                    name: '',
                    countryCode: '+91',
                    mobileNumber: '',
                    email: '',
                    enterpriseId,
                    rolesIds: [],
                  });
                  setIsModalOpen(false);
                }}
              >
                {translation('form.actions.discard')}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={createMemberMutation.isPending}
                className="bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                size="sm"
              >
                {updateAssociateMember.isPending ||
                createMemberMutation.isPending ? (
                  <Loading />
                ) : isEditMode ? (
                  translation('dialogTitleEdit')
                ) : (
                  translation('dialogTitle')
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteModal;
