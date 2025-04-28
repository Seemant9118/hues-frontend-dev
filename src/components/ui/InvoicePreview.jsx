import { templateApi } from '@/api/templates_api/template_api';
import { getFilenameFromUrl } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Textarea } from './textarea';

const InvoicePreview = ({
  setIsPreviewOpen,
  url,
  isBase64 = false,
  handleSelectFn,
  isSelectable = false,
  isDownloadable = false,
  handleCreateFn,
  isCreatable = false,
  isCustomerRemarksAddable = false,
  isBankAccountDetailsSelectable = false,
  isSocialLinksAddable = false,
  isActionable = false,
}) => {
  // State to determine if the document is a PDF
  const [isPDF, setIsPDF] = useState(false);
  // State for storing customer remarks
  const [remarks, setRemarks] = useState('');
  // State for selected bank account
  // eslint-disable-next-line no-unused-vars
  const [bankAccount, setBankAccount] = useState('');
  // State for social link input
  const [socialLink, setSocialLink] = useState('');

  // Effect to check if the URL points to a PDF and update isPDF state
  useEffect(() => {
    const isCheck = url?.split('?')[0].toLowerCase().endsWith('.pdf');
    setIsPDF(isCheck);
  }, [url]);

  // Fetch the PDF document using the provided URL
  const { data: pdfDoc, isLoading } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, url],
    queryFn: () => getDocument(url),
    enabled: !!url && !isBase64,
    select: (res) => res.data.data,
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={cn(
          'flex h-full justify-between gap-6',
          !isActionable && 'flex items-center justify-center',
        )}
      >
        {/* Left side: Controls */}
        {isBankAccountDetailsSelectable &&
          isCustomerRemarksAddable &&
          isSocialLinksAddable && (
            <div className="flex h-full w-1/3 flex-col gap-6">
              {isCustomerRemarksAddable && (
                <div>
                  <Label className="text-sm font-medium">Custom Remarks</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Thank you for your business!"
                    rows={4}
                  />
                </div>
              )}

              {isBankAccountDetailsSelectable && (
                <div>
                  <Label className="text-sm font-medium">
                    Select Bank Account details
                  </Label>
                  <Select onValueChange={setBankAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bank Account Details" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acc1">Bank Account 1</SelectItem>
                      <SelectItem value="acc2">Bank Account 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isSocialLinksAddable && (
                <div>
                  <Label className="text-sm font-medium">
                    Add Social links
                  </Label>
                  <Input
                    placeholder="https://twitter.com/yourhandle"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

        {/* Right side: PDF Preview */}
        <div className="flex h-[600px] w-2/3 items-center justify-center bg-[#F4F4F4]">
          {isLoading ? (
            <span className="animate-pulse">Loading Document...</span>
          ) : (
            <ViewPdf url={pdfDoc?.publicUrl || url} isPDF={isPDF} />
          )}
        </div>
      </div>

      {/* Footer CTA for downloading the PDF */}

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPreviewOpen(false)}
        >
          Cancel
        </Button>
        {isDownloadable && (
          <Button size="sm" asChild>
            <a
              href={pdfDoc?.publicUrl}
              download={getFilenameFromUrl(pdfDoc?.publicUrl)}
            >
              Download
            </a>
          </Button>
        )}

        {isSelectable && (
          <Button
            size="sm"
            onClick={() => {
              handleSelectFn();
              setIsPreviewOpen(false);
            }}
          >
            Select
          </Button>
        )}

        {isCreatable && (
          <Button
            size="sm"
            onClick={() => {
              handleCreateFn();
              setIsPreviewOpen(false);
            }}
          >
            Create
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
