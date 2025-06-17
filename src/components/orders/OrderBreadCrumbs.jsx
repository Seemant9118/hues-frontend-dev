import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import React from 'react';
import { toast } from 'sonner';

const OrderBreadCrumbs = ({
  possiblePagesBreadcrumbs,
  setIsNegotiation,
  setIsGenerateInvoice,
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const translations = useTranslations();

  const handleClick = (page) => {
    if (!page || !page.path) {
      toast.error('Invalid page or path:', page);
      return;
    }

    if (page.name === 'Sales') {
      // Directly navigate to /sales-orders for SALES breadcrumb
      router.push('/dashboard/sales/sales-orders');
    } else if (page.name === 'Purchases') {
      // Directly navigate to /purchase-orders for PURCHASES breadcrumb
      router.push('/dashboard/purchases/purchase-orders');
    } else {
      // Reset the states if moving within the order detail pages
      pathName.includes('sales-orders') && setIsGenerateInvoice(false);
      setIsNegotiation && setIsNegotiation(false);
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
              <BreadcrumbItem key={page.id} className="flex items-center gap-1">
                <BreadcrumbPage>
                  <span className="text-lg font-bold">
                    {translations(page.name)}
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <div key={page.id} className="flex items-center gap-1">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => handleClick(page)}
                    className="hover:cursor-pointer hover:text-blue-500"
                  >
                    <span className="text-lg font-bold">
                      {translations(page.name)}
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </div>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default OrderBreadCrumbs;
