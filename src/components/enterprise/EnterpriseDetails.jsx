import { capitalize, formatValue } from '@/appUtils/helperFunctions';
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

const EnterpriseDetails = ({
  data,
  isEnterpriseDetailsShow,
  setIsEnterpriseDetailsShow,
  isClient,
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
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.name ||
                          data?.invitation?.userDetails?.name
                      : data?.vendor?.name ||
                          data?.invitation?.userDetails?.name,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Enterprise type</p>
                <p className="font-medium">
                  {formatValue(
                    capitalize(
                      isClient
                        ? data?.client?.type ||
                            data?.invitation?.userDetails?.type
                        : data?.vendor?.type ||
                            data?.invitation?.userDetails?.type,
                    ),
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.email ||
                          data?.invitation?.userDetails?.email
                      : data?.vendor?.email ||
                          data?.invitation?.userDetails?.email,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">
                  {formatValue(
                    `+91 ${isClient ? data?.client?.mobileNumber || data?.invitation?.userDetails?.mobileNumber : data?.vendor?.mobileNumber || data?.invitation?.userDetails?.mobileNumber}`,
                  )}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Enterprise Address</p>
                <p className="font-medium">
                  {formatValue(data?.address?.address)}
                </p>
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
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.gstNumber ||
                          data?.invitation?.userDetails?.gstNumber
                      : data?.vendor?.gstNumber ||
                          data?.invitation?.userDetails?.gstNumber,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CIN</p>
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.cin || data?.invitation?.userDetails?.cin
                      : data?.vendor?.cin || data?.invitation?.userDetails?.cin,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">UDYAM</p>
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.udyam ||
                          data?.invitation?.userDetails?.udyam
                      : data?.vendor?.udyam ||
                          data?.invitation?.userDetails?.udyam,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">PAN</p>
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.panNumber ||
                          data?.invitation?.userDetails?.panNumber
                      : data?.vendor?.panNumber ||
                          data?.invitation?.userDetails?.panNumber,
                  )}
                </p>
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
                    isClient
                      ? data?.client?.type === 'proprietorship'
                        ? data?.client?.name ||
                          data?.invitation?.userDetails?.name
                        : data?.client?.director?.name
                      : data?.vendor?.type === 'proprietorship'
                        ? data?.vendor?.name ||
                          data?.invitation?.userDetails?.name
                        : data?.vendor?.director?.name,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">
                  {formatValue(
                    isClient
                      ? data?.client?.type === 'proprietorship'
                        ? data?.client?.mobileNumber ||
                          data?.invitation?.userDetails?.mobileNumber
                        : data?.client?.director?.mobileNumber
                      : data?.vendor?.type === 'proprietorship'
                        ? data?.vendor?.mobileNumber ||
                          data?.invitation?.userDetails?.mobileNumber
                        : data?.vendor?.director?.mobileNumber,
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
