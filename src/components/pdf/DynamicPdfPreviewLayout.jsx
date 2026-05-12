import { Button } from '@/components/ui/button';
import ViewPdf from './ViewPdf';
import Loading from '../ui/Loading';

export default function DynamicPdfPreviewLayout({
  schema,
  formData,
  setFormData,
  errors,
  pdfUrl,
  isPDF,
  onDiscard,
  onApplyChanges,
  isCreating,
  onCreate,
  FormComponent, // dynamic form engine
  onChange,
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Middle Section */}
      <div className="flex flex-1 justify-between gap-2 overflow-hidden">
        {/* Left Form Panel */}
        <div className="navScrollBarStyles h-full w-1/3 gap-4 overflow-y-auto overflow-x-hidden px-3">
          <FormComponent
            schema={schema}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            onChange={onChange}
          />
          <div className="sticky bottom-0 flex w-full items-center bg-white pt-2"></div>
        </div>

        {/* Right PDF Preview */}
        <div className="flex h-full w-2/3 items-center justify-center overflow-hidden bg-[#F4F4F4]">
          <ViewPdf url={pdfUrl} isPDF={isPDF} />
        </div>
      </div>

      {/* Footer Buttons (Sticky Bottom) */}
      <div className="flex w-full items-center justify-between gap-2 border-t pt-2">
        <div className="w-1/3 px-2">
          <Button className="w-full" size="sm" onClick={onApplyChanges}>
            Apply changes
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" onClick={onCreate} disabled={isCreating}>
            {isCreating ? <Loading /> : `Create`}
          </Button>
        </div>
      </div>
    </div>
  );
}
