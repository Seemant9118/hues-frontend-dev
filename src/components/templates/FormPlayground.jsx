'use client';

import React from 'react';
import { FileText, Plus } from 'lucide-react';

import AddFieldDialog from '@/components/shared/AddFieldDialog';
import ComponentLibraryDrawer from '@/components/shared/ComponentLibraryDrawer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFormPlayground } from '@/components/templates/hooks/useFormPlayground';
import PlaygroundHeader from '@/components/templates/components/PlaygroundHeader';
import PlaygroundFieldCard from '@/components/templates/components/PlaygroundFieldCard';

export default function FormPlayground({
  formType = 'CUSTOM',
  backUrl = '/dashboard/studio',
}) {
  const {
    formName,
    setFormName,
    fields,
    isLibraryOpen,
    setIsLibraryOpen,
    isAddFieldDialogOpen,
    setIsAddFieldDialogOpen,
    selectedFieldType,
    isSaving,
    isConfirmExitOpen,
    setIsConfirmExitOpen,
    handleDragOver,
    handleDrop,
    handleAddFieldFromLibrary,
    handleConfirmFieldConfig,
    handleMoveField,
    handleToggleRequired,
    handleDeleteField,
    handleEditField,
    handleSaveForm,
    handleCancel,
    handleConfirmExit,
  } = useFormPlayground(formType, backUrl);

  return (
    <div className="relative flex min-h-[85vh] flex-col">
      {/* Top Header Toolbar */}
      <PlaygroundHeader
        formName={formName}
        setFormName={setFormName}
        formType={formType}
        onCancel={handleCancel}
        isLibraryOpen={isLibraryOpen}
        setIsLibraryOpen={setIsLibraryOpen}
        onSave={handleSaveForm}
        isSaving={isSaving}
      />

      {/* Main Playground Content Container */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Playground Canvas Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex-1 rounded-xl border-2 border-dashed p-6 transition-all ${
            fields.length === 0
              ? 'flex min-h-[450px] flex-col items-center justify-center border-neutral-300 bg-neutral-50/50'
              : 'space-y-4 border-primary/30 bg-white shadow-sm'
          }`}
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-800">
                Form Playground is Empty
              </h3>
              <p className="mt-1 max-w-md text-xs text-neutral-500">
                Drag and drop field components from the right sidebar library
                onto this canvas, or click below to add your first field.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => handleAddFieldFromLibrary('TEXT')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition"
              >
                <Plus size={15} />
                <span>Add Custom Field</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Form Fields ({fields.length})
                </span>
                <span className="text-[11px] text-neutral-400">
                  Drag & reorder fields using controls below
                </span>
              </div>

              {/* Render Field Cards in Playground */}
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <PlaygroundFieldCard
                    key={field.id || idx}
                    field={field}
                    index={idx}
                    totalFields={fields.length}
                    onMove={handleMoveField}
                    onToggleRequired={handleToggleRequired}
                    onEdit={handleEditField}
                    onDelete={handleDeleteField}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Component Library Drawer */}
        <ComponentLibraryDrawer
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onAddField={handleAddFieldFromLibrary}
        />
      </div>

      {/* Add / Edit Field Dialog */}
      <AddFieldDialog
        isOpen={isAddFieldDialogOpen}
        onClose={() => {
          setIsAddFieldDialogOpen(false);
        }}
        fieldType={selectedFieldType}
        onConfirm={handleConfirmFieldConfig}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={isConfirmExitOpen} onOpenChange={setIsConfirmExitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved fields in your playground. Are you sure you want
              to exit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmExitOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmExit}
            >
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
