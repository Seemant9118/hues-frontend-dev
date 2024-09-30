'use client';

import MemberInviteModal from '@/components/membersInvite/MemberInviteModal';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useInviteeMembersColumns } from './useInviteeMembersColumns';

const MembersPage = () => {
  const [selectedMembers, setSelectedMembers] = useState([]);

  const inviteeMembersColumns = useInviteeMembersColumns(setSelectedMembers);
  return (
    <Wrapper className="relative">
      <SubHeader name={'Members'} className="z-10 bg-white">
        <div className="flex items-center justify-center gap-4">
          <MemberInviteModal />

          <Button
            disabled={selectedMembers?.length === 0}
            onClick={() => {}}
            variant="outline"
            className="border border-[#A5ABBD] hover:bg-neutral-600/10"
            size="sm"
          >
            <Upload size={16} />
          </Button>
        </div>
      </SubHeader>

      <DataTable columns={inviteeMembersColumns} data={{}} />
    </Wrapper>
  );
};

export default MembersPage;
