import React from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { Check, Download, Upload, UploadCloud } from 'lucide-react';
import Wrapper from '../wrappers/Wrapper';
import { Button } from '../ui/button';

const UploadItems = ({ type, uploadFile, files, setisUploading, setFiles }) => {
  const handleFileRemove = () => {
    setisUploading(false);
    setFiles([]);
  };

  const sampleFileUrl =
    type === 'goods' ? '/ProductGoodsSample.xlsx' : '/ServiceSampleFile.xlsx';
  const sampleFileName =
    type === 'goods' ? 'ProductGoodsSample.xlsx' : 'ServiceSampleFile.xlsx';

  return (
    <Wrapper className="items-center justify-start">
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

      <div className="mt-auto h-[1px] w-full bg-neutral-300"></div>
    </Wrapper>
  );
};

export default UploadItems;
