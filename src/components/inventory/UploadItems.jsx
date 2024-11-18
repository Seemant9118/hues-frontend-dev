import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { goodsApi } from '@/api/inventories/goods/goods';
import { servicesApi } from '@/api/inventories/services/services';
import { getClientSampleFile } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getVendorSampleFile } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { GetGoodsSampleFile } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { GetServiceSampleFile } from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useQuery } from '@tanstack/react-query';
import { Check, Download, MoveLeft, Upload, UploadCloud } from 'lucide-react';
import React from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const UploadItems = ({ type, uploadFile, files, setisUploading, setFiles }) => {
  const handleFileRemove = () => {
    setisUploading(false);
    setFiles([]);
  };

  let sampleFileName;
  let sampleFileUrl;

  // get Goods Sample File
  const { data: goodsSampleFile } = useQuery({
    queryKey: [goodsApi.getGoodsSample.endpointKey],
    queryFn: GetGoodsSampleFile,
    enabled: type === 'goods',
    select: (data) => data.data.data,
  });

  // get Services Sample File
  const { data: servicesSampleFile } = useQuery({
    queryKey: [servicesApi.getServicesSample.endpointKey],
    queryFn: GetServiceSampleFile,
    enabled: type === 'services',
    select: (data) => data.data.data,
  });

  // get Client Sample File
  const { data: clientSampleFile } = useQuery({
    queryKey: [clientEnterprise.getClientSample.endpointKey],
    queryFn: getClientSampleFile,
    enabled: type === 'client',
    select: (data) => data.data.data,
  });

  // get Vendor Sample File
  const { data: vendorSampleFile } = useQuery({
    queryKey: [vendorEnterprise.getVendorSample.endpointKey],
    queryFn: getVendorSampleFile,
    enabled: type === 'vendor',
    select: (data) => data.data.data,
  });

  switch (type) {
    case 'goods':
      sampleFileName = 'ProductGoodsSample.xlsx';
      sampleFileUrl = goodsSampleFile?.publicUrl;
      break;

    case 'services':
      sampleFileName = 'ServiceSample.xlsx';
      sampleFileUrl = servicesSampleFile?.publicUrl;
      break;

    case 'client':
      sampleFileName = 'ClientSample.xlsx';
      sampleFileUrl = clientSampleFile?.publicUrl;
      break;
    case 'vendor':
      sampleFileName = 'VendorSample.xlsx';
      sampleFileUrl = vendorSampleFile?.publicUrl;
      break;
    default:
      sampleFileName = '';
      sampleFileUrl = '';
      break;
  }

  return (
    <Wrapper className="flex h-full flex-col py-2">
      <MoveLeft
        className="hover:cursor-pointer"
        onClick={() => setisUploading(false)}
      />

      <div className="flex grow flex-col items-center justify-center gap-4 rounded-md border">
        <FileUploader
          handleChange={uploadFile}
          name="file"
          types={['xlsx', 'csv']}
        >
          <div className="mb-2 flex min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-sky-300 px-5 py-10">
            <div className="flex items-center gap-4">
              <UploadCloud className="text-sky-500" size={40} />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-darkText">
                  Drag & Drop or Select a File (Max 10MB,
                  <span className="font-bold text-sky-500">
                    {' '}
                    .csv/.xlsx Formats
                  </span>
                  )
                </p>
                <p className="text-xs font-normal text-sky-500">
                  Note - Trade enabled for eSigned inventories only.
                </p>
              </div>
            </div>
            <Button variant="blue_outline">
              <Upload />
              Select
            </Button>
          </div>
        </FileUploader>

        <Button asChild variant="outline" className="w-full max-w-[700px]">
          <a download={sampleFileName} href={sampleFileUrl}>
            <Download />
            Sample
          </a>
        </Button>

        {files.map((file) => (
          <div
            key={file.name}
            className="flex min-w-[700px] items-center justify-between gap-4 rounded-sm border border-neutral-300 p-4"
          >
            <div className="flex items-center gap-4">
              <p className="text-xs font-medium leading-[18px]">{file.name}</p>
              <div className="h-1 w-1 rounded-full bg-neutral-400"></div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                  <Check size={10} />
                </div>
                <p className="text-xs font-medium leading-5 text-green-500">
                  Upload Successfully!
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleFileRemove}>
              Back to View
            </Button>
          </div>
        ))}
      </div>

      {/* <div className="mt-auto h-[1px] w-full bg-neutral-300"></div> */}
    </Wrapper>
  );
};

export default UploadItems;
