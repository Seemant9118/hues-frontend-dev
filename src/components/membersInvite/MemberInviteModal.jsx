'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { LocalStorageService } from '@/lib/utils';
import { createAssociateMembers } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Tooltips from '../auth/Tooltips';

const MemberInviteModal = () => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [open, setOpen] = useState(false);
  const [member, setMember] = useState({
    name: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    enterpriseId,
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMember({ ...member, [name]: value });
  };

  const handleRoleChange = (value) => {
    setMember({ ...member, role: value });
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
        role: '',
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
              <Select onValueChange={handleRoleChange} required>
                <SelectTrigger className="text-sm font-semibold">
                  <SelectValue
                    className="text-sm font-semibold"
                    placeholder="Select Role"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="COMMENTATOR">Commentator</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
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
