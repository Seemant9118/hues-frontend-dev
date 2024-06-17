'use client';

import { servicesApi } from '@/api/inventories/services/services';
import AddItem from '@/components/inventory/AddItem';
import EditItem from '@/components/inventory/EditItem';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductServices,
  UpdateProductServices,
  UploadProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  CircleFadingPlus,
  DatabaseZap,
  Download,
  FileCheck,
  FileText,
  KeySquare,
  Upload,
  UploadCloud,
} from 'lucide-react';
import React, { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import { useServicesColumns } from './ServicesColumns';

function Services() {
  const enpterpriseId = LocalStorageService.get('enterprise_Id');
  const templateId = 1;

  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [servicesToEdit, setServicesToEdit] = useState(null);
  const [isUploading, setisUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const InventoryEmptyStageData = {
    heading: `~"Revolutionize stock management with secure, editable, and shareable product listings for
    perfect cataloging."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Quickly upload and fine-tune detailed product information in bulk.`,
      },
      {
        id: 2,
        icon: <FileText size={14} />,
        subItemtitle: `Effortlessly add items for fresh, accurate inventory.`,
      },
      {
        id: 3,
        icon: <KeySquare size={14} />,
        subItemtitle: `Authenticate inventory with digital signatures for integrity and compliance.`,
      },
      {
        id: 4,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Share digitally signed inventory easily in PDF format.`,
      },
    ],
  };

  const { data, isLoading } = useQuery({
    queryKey: [servicesApi.getAllProductServices.endpointKey],
    queryFn: () => GetAllProductServices(enpterpriseId),
    select: (res) => res.data.data,
  });

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enpterpriseId);
    formData.append('templateId', templateId);

    try {
      await UploadProductServices(formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([
        servicesApi.getAllProductServices.endpointKey,
      ]);
    } catch (error) {
      toast.error(error.respnse.data.message || 'Something went wrong');
    }
  };

  const ServicesColumns = useServicesColumns(setIsEditing, setServicesToEdit);

  return (
    <>
      {!isAdding && !isUploading && !isEditing && (
        <Wrapper>
          <SubHeader name={'Services'}>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={'export'}
                size="sm"
                onClick={() =>
                  exportTableToExcel('services table', 'services_list')
                }
              >
                <Upload size={14} />
                Export
              </Button>
              <Button
                onClick={() => setisUploading(true)}
                variant={'blue_outline'}
                size="sm"
              >
                <Upload size={14} />
                Upload
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                variant={'blue_outline'}
                size="sm"
              >
                <CircleFadingPlus size={14} />
                Add
              </Button>
            </div>
          </SubHeader>

          {isLoading && <Loading />}

          {!isLoading &&
            // isSuccess &&
            (data && data.length !== 0 ? (
              <DataTable
                id={'services table'}
                columns={ServicesColumns}
                data={data}
              />
            ) : (
              <EmptyStageComponent
                heading={InventoryEmptyStageData.heading}
                desc={InventoryEmptyStageData.desc}
                subHeading={InventoryEmptyStageData.subHeading}
                subItems={InventoryEmptyStageData.subItems}
              />
            ))}
        </Wrapper>
      )}
      {isAdding && (
        <AddItem
          setIsAdding={setIsAdding}
          name={'Item'}
          cta={'Item'}
          onCancel={() => setIsAdding(false)}
        />
      )}
      {isEditing && (
        <EditItem
          setIsEditing={setIsEditing}
          servicesToEdit={servicesToEdit}
          setServicesToEdit={setServicesToEdit}
          mutationFunc={UpdateProductServices}
          queryKey={[servicesApi.getAllProductServices.endpointKey]}
        />
      )}
      {isUploading && (
        <Wrapper className={'items-center justify-start'}>
          <FileUploader
            handleChange={uploadFile}
            name="file"
            types={['xlsx', 'csv']}
          >
            <div className="mb-2 flex min-w-[700px] grow border-spacing-3 cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-sky-300 px-5 py-10">
              <div className="flex items-center gap-4">
                <UploadCloud className="text-sky-500" size={40} />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium text-darkText">
                    Drag & Drop or Select a File (Max 10MB,
                    <span className="font-bold text-sky-500">
                      {' '}
                      .csv/.xlsx Formats
                    </span>{' '}
                    )
                  </p>
                  <p className="text-xs font-normal text-sky-500">
                    Note - Trade enabled for eSigned inventories only.
                  </p>
                  {/* <p className="text-sky-500 text-xs font-normal">
                    Supported File formats : .csv | .xls
                  </p> */}
                </div>
              </div>
              <Button variant="blue_outline">
                <Upload />
                Select
              </Button>
            </div>
          </FileUploader>
          <Button asChild variant="outline" className="w-full max-w-[700px]">
            <a
              download={'/Hues_inventory_sample_services.xlsx'}
              href="/Hues_inventory_sample_services.xlsx"
            >
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
                <p className="text-xs font-medium leading-[18px]">
                  {file.name}
                </p>
                <div className="h-1 w-1 rounded-full bg-neutral-400"></div>
                {/* <a
                  href="#"
                  className="text-blue-500 underline underline-offset-2 text-xs leading-4"
                >
                  Preview
                </a> */}
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                    <Check size={10} />
                  </div>
                  <p className="text-xs font-medium leading-5 text-green-500">
                    Upload Successfully!
                  </p>
                </div>
              </div>
              {/* <button
                onClick={() => {
                  setFiles((prev) => {
                    const updated = [...prev];
                    updated.splice(idx, 1);
                    return updated;
                  });
                }}
              >
                <Trash2 className="text-grey" size={14} />
              </button> */}
            </div>
          ))}
          <div className="mt-auto h-[1px] w-full bg-neutral-300"></div>

          <div className="flex justify-end self-end">
            <Button
              onClick={() => {
                setisUploading(false);
                setFiles([]);
              }}
            >
              Done
            </Button>
          </div>
        </Wrapper>
      )}
    </>
  );
}

export default Services;
