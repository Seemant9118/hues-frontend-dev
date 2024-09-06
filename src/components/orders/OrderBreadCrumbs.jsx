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
import { toast } from 'sonner';

const OrderBreadCrumbs = ({
  possiblePagesBreadcrumbs,
  setIsPastInvoices,
  setIsNegotiation,
}) => {
  const router = useRouter();

  const handleClick = (page) => {
    if (!page || !page.path) {
      toast.error('Invalid page or path:', page);
      return;
    }

    if (page.name === 'SALES') {
      // Directly navigate to /sales-orders for SALES breadcrumb
      router.push('/sales-orders');
    } else if (page.name === 'PURCHASES') {
      // Directly navigate to /purchase-orders for PURCHASES breadcrumb
      router.push('/purchase-orders');
    } else {
      // Reset the states if moving within the order detail pages
      setIsPastInvoices(false);
      setIsNegotiation(false);

      // Navigate to the specified page's path
      router.push(page.path);
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {possiblePagesBreadcrumbs
          .filter((page) => page.show) // Filter based on the show property
          .map((page, index, array) => {
            const isLast = index === array.length - 1;
            return isLast ? (
              <BreadcrumbItem key={page.path}>
                <BreadcrumbPage>
                  <span className="text-lg font-bold">{page.name}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem key={page.path}>
                <BreadcrumbLink
                  onClick={() => handleClick(page)}
                  className="hover:cursor-pointer hover:text-blue-500"
                >
                  <span className="text-lg font-bold">{page.name}</span>
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
