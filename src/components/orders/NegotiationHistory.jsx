/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */

'use client';

import { orderApi } from '@/api/order_api/order_api';
import { capitalize, formattedAmount } from '@/appUtils/helperFunctions';
import { GetNegotiationDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
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
  const { data: negotiationData } = useQuery({
    queryKey: [orderApi.getNegotiationDetails.endpointKey],
    queryFn: () => GetNegotiationDetails({ orderId }),
    enabled: !!orderId,
    select: (data) => data?.data?.data,
  });

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
                  <TableCell>{capitalize(entry.negotiatedBy)}</TableCell>
                  <TableCell>{`${entry.time} | ${entry.date}`}</TableCell>
                  <TableCell>{formattedAmount(entry.totalAmount)}</TableCell>
                </TableRow>

                {expandedRows.includes(index) && entry.data.length > 0 && (
                  <TableRow>
                    <TableCell />
                    <TableCell colSpan={3} className="p-0">
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
    </div>
  );
}
