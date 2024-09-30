'use client';

import { Label } from '@radix-ui/react-label';
import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const MemberInviteModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#288AF9] text-white hover:bg-primary hover:text-white"
          size="sm"
        >
          <UserPlus size={16} />
          Invite members
        </Button>
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
                name="Name"
                type="text"
                id="name"
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
                name="Phone"
                type="tel"
                id="mobileNumber"
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
                name="Phone"
                type="tel"
                id="mobileNumber"
              />
            </div>

            {/* role */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="text-sm font-bold">Role</Label>
                <span className="text-red-600">*</span>
              </div>
              <Select required>
                <SelectTrigger className="text-sm font-semibold">
                  <SelectValue
                    className="text-sm font-semibold"
                    placeholder="Select Role"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="commentator">Commentator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                size="sm"
                variant={'outline'}
                onClick={() => setOpen(false)}
              >
                Discard
              </Button>

              <Button
                className="bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                size="sm"
              >
                Create
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteModal;
