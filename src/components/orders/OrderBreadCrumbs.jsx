import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useRouter } from 'next/navigation';

const OrderBreadCrumbs = ({
  possiblePagesBreadcrumbs,
  setIsPastInvoices,
  setIsNegotiation,
}) => {
  const router = useRouter();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {possiblePagesBreadcrumbs
          .filter((page) => page.show) // Filter based on the show property
          .map((page, index, array) => {
            const isLast = index === array.length - 1;
            const handleClick = () => {
              // Handle state change when orderId breadcrumb is clicked
              if (page.name.includes('ORDER')) {
                setIsPastInvoices(false);
                setIsNegotiation(false);
              }
              router.push(page.path);
            };

            return isLast ? (
              <BreadcrumbItem key={page.path}>
                <BreadcrumbPage>
                  <span className="text-xs font-bold">{page.name}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem key={page.path}>
                <BreadcrumbLink
                  onClick={handleClick}
                  className="hover:cursor-pointer hover:text-blue-500"
                >
                  <span className="text-xs font-bold">{page.name}</span>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default OrderBreadCrumbs;
