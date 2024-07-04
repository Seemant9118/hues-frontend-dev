import React from 'react';
import SubHeader from '../ui/Sub-header';
import { Label } from '../ui/label';

function UserProfile() {
  return (
    <div>
      <SubHeader name={'Profile'} />

      <div className="my-5 flex flex-col gap-4">
        {/* user details */}
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold">Personal Details</span>
          <div className="flex flex-col gap-2 rounded-sm border p-4">
            <div className="flex items-center gap-2">
              <Label>Name : </Label>
              <span className="text-sm">Seemant</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>PAN Card : </Label>
              <span className="text-sm">KQKPK2598R</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>Mobile Number : </Label>
              <span className="text-sm">+91 7317414274</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>Email ID : </Label>
              <span className="text-sm">seemant@gmail.com</span>
            </div>
          </div>
        </div>
        {/* enterprise profile */}
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold">Enterprise Details</span>
          <div className="flex flex-col gap-2 rounded-sm border p-4">
            <div className="flex items-center gap-2">
              <Label>Name : </Label>
              <span className="text-sm">PTPL</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>Type : </Label>
              <span className="text-sm">Partnership</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>GST IN : </Label>
              <span className="text-sm">AH45454874KDJ548</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>PAN Card : </Label>
              <span className="text-sm">PTPLA2849H</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>Authority Signatory</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
