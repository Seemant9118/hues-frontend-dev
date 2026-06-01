'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function TicketModal({
  isOpen,
  onOpenChange,
  mode,
  ticketForm,
  setTicketForm,
  onSubmit,
  onDelete,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:max-w-md">
        <DialogHeader className="border-b border-gray-100 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create Ticket' : 'Edit Ticket'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Title *
            </label>
            <input
              type="text"
              required
              value={ticketForm.title}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, title: e.target.value })
              }
              placeholder="Brief description of the issue"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Category *
            </label>
            <select
              required
              value={ticketForm.category}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, category: e.target.value })
              }
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="" disabled>
                Select category
              </option>
              <option value="Payment">Payment</option>
              <option value="Delivery">Delivery</option>
              <option value="Inventory">Inventory</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={ticketForm.description}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, description: e.target.value })
              }
              placeholder="Detailed description of the issue"
              className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Link to Transaction */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Link to Transaction (optional)
            </label>
            <select
              value={ticketForm.transaction}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, transaction: e.target.value })
              }
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select transaction</option>
              <option value="INV-001">INV-001</option>
              <option value="PAY-001">PAY-001</option>
              <option value="INV-002">INV-002</option>
              <option value="CN-001">CN-001</option>
            </select>
          </div>

          {/* Status (Only in Edit mode) */}
          {mode === 'edit' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                value={ticketForm.status}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, status: e.target.value })
                }
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="mt-4 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="mr-auto rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {mode === 'create' ? 'Create' : 'Save'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
