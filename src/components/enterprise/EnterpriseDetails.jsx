import { capitalize, formatValue } from '@/appUtils/helperFunctions';
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

const EnterpriseDetails = ({
  data,
  isEnterpriseDetailsShow,
  setIsEnterpriseDetailsShow,
}) => {
  return (
    <Dialog
      open={isEnterpriseDetailsShow}
      onOpenChange={setIsEnterpriseDetailsShow}
    >
      <DialogContent className="flex max-w-xl flex-col gap-5 rounded-lg p-6">
        <DialogTitle className="text-xl font-semibold">
          Enterprise Details
        </DialogTitle>

        {/* Overview Section */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-500">Overview</h3>
          <div className="rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Enterprise name</p>
                <p className="font-medium">{formatValue(data?.name)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Enterprise type</p>
                <p className="font-medium">
                  {formatValue(capitalize(data?.type))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{formatValue(data?.email)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">
                  {formatValue(`+91 ${data?.mobileNumber}`)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Enterprise Address</p>
                <p className="font-medium">{formatValue(data?.address)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Document Details Section */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-500">
            Document Details
          </h3>
          <div className="mt-4 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">GST</p>
                <p className="font-medium">{formatValue(data?.gstNumber)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CIN</p>
                <p className="font-medium">{formatValue(data?.cin)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">UDYAM</p>
                <p className="font-medium">{formatValue(data?.udyam)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">PAN</p>
                <p className="font-medium">{formatValue(data?.panNumber)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Director Details Section */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-500">
            Director Details
          </h3>
          <div className="mt-4 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Director Name</p>
                <p className="font-medium">
                  {formatValue(
                    data?.type === 'proprietorship'
                      ? data?.name
                      : data?.director?.name,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">
                  {formatValue(
                    data?.type === 'proprietorship'
                      ? data?.mobileNumber
                      : data?.director?.mobileNumber,
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default EnterpriseDetails;
