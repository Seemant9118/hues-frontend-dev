'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { rolesApi } from '@/api/rolesApi/rolesApi';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { LocalStorageService } from '@/lib/utils';
import { createAssociateMembers } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { getRoles } from '@/services/Roles_Services/Roles_Services';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';

const MemberInviteModal = () => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [open, setOpen] = useState(false);
  const [optionsForRoles, setOptionsForRoles] = useState([]);
  const [member, setMember] = useState({
    name: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    enterpriseId,
    rolesIds: [],
  });

  const { data: rolesList } = useQuery({
    queryKey: [rolesApi.getAllRoles.endpointKey],
    queryFn: getRoles,
    select: (data) => data.data.data,
    enabled: !!open,
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
      toast.success('Members Added Successfully');
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
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    createMemberMutation.mutate(member);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Tooltips
          trigger={
            <Button onClick={() => setOpen(true)} size="sm">
              <UserPlus size={16} />
              Invite members
            </Button>
          }
          content={'Invite associate members to your enterprise'}
        />
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-5">
        <DialogTitle>Invite Member</DialogTitle>

        <form className="w-full">
          <div className="flex flex-col gap-5">
            {/* name */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="text-sm font-bold">Name</Label>
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
                <Label className="text-sm font-bold">Phone</Label>
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
                <Label className="text-sm font-bold">Email</Label>
                <span className="text-xs font-bold text-[#A5ABBD]">
                  {'(optional)'}
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
                <Label className="text-sm font-bold">Role</Label>
                <span className="text-red-600">*</span>
              </div>
              <Select
                isMulti
                name="roles"
                placeholder="Select Role"
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
                  setMember({});
                  setOpen(false);
                }}
              >
                Discard
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={createMemberMutation.isPending}
                className="bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                size="sm"
              >
                {createMemberMutation.isPending ? <Loading /> : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteModal;
