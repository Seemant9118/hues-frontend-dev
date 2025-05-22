/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */

'use client';

import { orderApi } from '@/api/order_api/order_api';
import { GetNegotiationDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const negotiationData = [
  {
    negotiatedBy: 'Seller',
    date: '1:52 PM, 14th May, 2025',
    total: 439,
    items: [
      {
        itemName: 'Eclairs Double',
        quantity: 1000,
        rate: 439,
        total: 439000,
      },
      {
        itemName: 'Eclairs Double',
        quantity: 1000,
        rate: 439,
        total: 439000,
      },
      {
        itemName: 'Eclairs Double',
        quantity: 1000,
        rate: 439,
        total: 439000,
      },
    ],
  },
  {
    negotiatedBy: 'Seller',
    date: '1:52 PM, 14th May, 2025',
    total: 439,
    items: [],
  },
  {
    negotiatedBy: 'Seller',
    date: '1:52 PM, 14th May, 2025',
    total: 439,
    items: [],
  },
  {
    negotiatedBy: 'Seller',
    date: '1:52 PM, 14th May, 2025',
    total: 439,
    items: [],
  },
];

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

export default function NegotiationHistory({ orderId }) {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // Fetch negotiationDetails
  const { data: negotiationResData } = useQuery({
    queryKey: [orderApi.getNegotiationDetails.endpointKey],
    queryFn: () => GetNegotiationDetails({ orderId }),
    enabled: !!orderId,
    select: (data) => data?.data?.data,
  });

  //   console.log(negotiationResData);

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
          {negotiationData.map((entry, index) => (
            <>
              <TableRow
                key={`summary-${index}`}
                className="cursor-pointer"
                onClick={() => toggleRow(index)}
              >
                <TableCell className="w-10">
                  {entry.items.length > 0 ? (
                    expandedRows.includes(index) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : null}
                </TableCell>
                <TableCell>{entry.negotiatedBy}</TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{formatCurrency(entry.total)}</TableCell>
              </TableRow>

              {expandedRows.includes(index) && entry.items.length > 0 && (
                <>
                  <TableRow>
                    <TableCell />
                    <TableCell colSpan={3} className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="shrink-0 text-xs font-bold text-black">
                              Item Name
                            </TableHead>
                            <TableHead className="shrink-0 text-xs font-bold text-black">
                              Quantity
                            </TableHead>
                            <TableHead className="shrink-0 text-xs font-bold text-black">
                              Rate
                            </TableHead>
                            <TableHead className="shrink-0 text-xs font-bold text-black">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.items.map((item, i) => (
                            <TableRow key={`item-${index}-${i}`}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.rate)}</TableCell>
                              <TableCell>
                                {formatCurrency(item.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
