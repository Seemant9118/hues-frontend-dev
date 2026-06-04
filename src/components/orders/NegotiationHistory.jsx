/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */

'use client';

import { orderApi } from '@/api/order_api/order_api';
import { capitalize, formattedAmount } from '@/appUtils/helperFunctions';
import { GetNegotiationDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import React, { useState } from 'react';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function NegotiationHistory({ orderId }) {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // Fetch negotiationDetails
  const { data: rawData } = useQuery({
    queryKey: [orderApi.getNegotiationDetails.endpointKey],
    queryFn: () => GetNegotiationDetails({ orderId }),
    enabled: !!orderId,
    select: (data) => data?.data?.data,
  });

  const negotiationData = rawData?.negotiations || [];
  const documents = rawData?.documents || [];

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead className="shrink-0 text-xs font-bold text-black">
              NEGOTIATED BY
            </TableHead>
            <TableHead className="shrink-0 text-xs font-bold text-black">
              DATE
            </TableHead>
            <TableHead className="shrink-0 text-xs font-bold text-black">
              TOTAL
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {negotiationData?.length > 0 &&
            negotiationData?.map((entry, index) => (
              <React.Fragment key={`summary-${index}`}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => toggleRow(index)}
                >
                  <TableCell className="w-10">
                    {entry.data.length > 0 ? (
                      expandedRows.includes(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {capitalize(entry.negotiatedBy)}
                    {entry.data?.some((item) => item.isOnBehalfAction) && (
                      <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                        On Behalf
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{`${entry.time} | ${entry.date}`}</TableCell>
                  <TableCell>{formattedAmount(entry.totalAmount)}</TableCell>
                </TableRow>

                {expandedRows.includes(index) && entry.data?.length > 0 && (
                  <TableRow>
                    <TableCell />
                    <TableCell colSpan={3} className="p-0">
                      {entry.data?.[0]?.isOnBehalfAction && (
                        <div className="flex flex-col gap-1.5 border-b bg-slate-50 p-4 text-xs">
                          <div className="flex gap-2">
                            <span className="w-32 font-semibold text-slate-700">
                              Action on Behalf:
                            </span>
                            <span className="text-slate-600">Yes</span>
                          </div>
                          {entry.data[0]?.onBehalfReason && (
                            <div className="flex gap-2">
                              <span className="w-32 font-semibold text-slate-700">
                                Reason:
                              </span>
                              <span className="text-slate-600">
                                {entry.data[0].onBehalfReason}
                              </span>
                            </div>
                          )}
                          {entry.data[0]?.onBehalfConsentNote && (
                            <div className="flex gap-2">
                              <span className="w-32 font-semibold text-slate-700">
                                Consent Note:
                              </span>
                              <span className="text-slate-600">
                                {entry.data[0].onBehalfConsentNote}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-bold text-black">
                              Order ID
                            </TableHead>
                            <TableHead className="text-xs font-bold text-black">
                              Quantity
                            </TableHead>
                            <TableHead className="text-xs font-bold text-black">
                              Unit Price
                            </TableHead>
                            <TableHead className="text-xs font-bold text-black">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.data.map((item, i) => (
                            <TableRow key={`item-${index}-${i}`}>
                              <TableCell>{item.orderId}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {formattedAmount(item.unitPrice)}
                              </TableCell>
                              <TableCell>
                                {formattedAmount(item.price)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          {negotiationData?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No negotiation history available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {documents?.length > 0 && (
        <div className="mt-6 rounded-sm border bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="h-4 w-4 text-blue-500" />
            Supporting Evidence / Attachments ({documents.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {documents.map((doc) => (
              <InvoicePDFViewModal
                key={doc.attachmentid}
                cta={
                  <div className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-slate-50">
                    <FileText className="h-4 w-4 flex-shrink-0 text-red-500" />
                    <span className="max-w-xs truncate">
                      {doc.attachmentfilename}
                    </span>
                  </div>
                }
                Url={doc.documenturl}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
