'use client';

import { Columns } from '@/components/columns/columns';
import AddItem from '@/components/inventory/AddItem';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
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

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setisUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const handleChange = async (file) => {
    setFiles((prev) => [...prev, file]);
  };

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

  return (
    <>
      {!isAdding && !isUploading && (
        <Wrapper>
          <SubHeader name={'Inventory'}>
            <div className="flex items-center justify-center gap-4">
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
          {products.length === 0 ? (
            <EmptyStageComponent
              heading={InventoryEmptyStageData.heading}
              desc={InventoryEmptyStageData.desc}
              subHeading={InventoryEmptyStageData.subHeading}
              subItems={InventoryEmptyStageData.subItems}
            />
          ) : (
            <DataTable columns={Columns} data={products} />
          )}
        </Wrapper>
      )}
      {isAdding && (
        <AddItem
          onCancel={() => setIsAdding(false)}
          onSubmit={(newProduct) => {
            setIsAdding(false);
            setProducts((product) => [...product, newProduct]);
          }}
          name={'Add Item'}
          cta={'Item'}
        />
      )}
      {isUploading && (
        <Wrapper className={'items-center justify-start'}>
          <FileUploader
            handleChange={handleChange}
            name="file"
            types={['xls', 'csv']}
          >
            <div className="mb-2 flex min-w-[700px] grow border-spacing-3 cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-sky-300 px-5 py-10">
              <div className="flex items-center gap-4">
                <UploadCloud className="text-sky-500" size={40} />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium text-darkText">
                    Drag & Drop or Select a File (Max 10MB,
                    <span className="font-bold text-sky-500">
                      {' '}
                      .csv/.xls Formats
                    </span>{' '}
                    )
                  </p>
                  <p className="text-xs font-normal text-sky-500">
                    Note - Trade Enabled for eSigned Inventories Only.
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
            <Button variant="outline" className="w-full">
              <Download />
              Sample
            </Button>
          </FileUploader>
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
                <a
                  href="#"
                  className="text-xs leading-4 text-blue-500 underline underline-offset-2"
                >
                  Preview
                </a>
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
            <Button onClick={() => setisUploading(false)}>Done</Button>
          </div>
        </Wrapper>
      )}
    </>
  );
};

export default InventoryPage;
