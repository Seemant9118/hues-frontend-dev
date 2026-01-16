import { Button } from '@/components/ui/button';
import ViewPdf from './ViewPdf';

export default function DynamicPdfPreviewLayout({
  schema,
  formData,
  setFormData,
  errors,
  pdfUrl,
  isPDF,
  onDiscard,
  onAdd,
  onCreate,
  FormComponent, // dynamic form engine
  onChange,
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Middle Section */}
      <div className="flex flex-1 justify-between gap-2 overflow-hidden">
        {/* Left Form Panel */}
        <div className="navScrollBarStyles h-full w-1/3 gap-4 overflow-y-auto px-3">
          <FormComponent
            schema={schema}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            onChange={onChange}
          />

          <Button className="sticky bottom-0 w-full" size="sm" onClick={onAdd}>
            Add booking
          </Button>
        </div>

        {/* Right PDF Preview */}
        <div className="flex h-full w-2/3 items-center justify-center overflow-hidden bg-[#F4F4F4]">
          <ViewPdf url={pdfUrl} isPDF={isPDF} />
        </div>
      </div>

      {/* Footer Buttons (Sticky Bottom) */}
      <div className="flex items-center justify-end gap-2 border-t bg-white p-3">
        <Button variant="outline" size="sm" onClick={onDiscard}>
          Discard
        </Button>
        <Button size="sm" onClick={onCreate}>
          Create
        </Button>
      </div>
    </div>
  );
}
