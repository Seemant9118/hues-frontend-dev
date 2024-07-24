'use client';

import GenerateLink from '@/components/enterprise/GenerateLink';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';

export const VendorsColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NAME" />
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ADDRESS" />
    ),
    cell: ({ row }) => {
      const { address } = row.original;
      return <p className="truncate">{address}</p>;
    },
  },
  {
    accessorKey: 'mobileNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PHONE" />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EMAIL" />
    ),
  },
  {
    accessorKey: 'panNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PAN" />
    ),
  },
  {
    accessorKey: 'gstNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST No." />
    ),
  },
  {
    accessorKey: 'invitation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="INVITATION" />
    ),
    cell: ({ row }) => {
      const id = row.original.invitationId;
      const { invitationStatus } = row.original;
      return (
        <GenerateLink
          invitationStatus={invitationStatus}
          invitationId={id}
          mutationFunc={generateLink}
        />
      );
    },
  },
  // {
  //   id: 'actions',
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const { id } = row.original;
  //     // const { name } = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreVertical className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end" className="max-w-fit">
  //           <AddModal
  //             cta="vendor"
  //             btnName="Edit"
  //             mutationFunc={updateVendor}
  //             userData={row.original}
  //             id={id}
  //           />
  //           {/* <ConfirmAction
  //             name={name}
  //             id={id}
  //             mutationKey={vendorEnterprise.getVendors.endpointKey}
  //             mutationFunc={deleteVendor}
  //           /> */}
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
