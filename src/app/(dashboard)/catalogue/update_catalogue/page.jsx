'use client';

import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Wrapper from '@/components/wrappers/Wrapper';
import React from 'react';

const UpdateCatalogue = () => {
  const catalogueBreadCrumbs = [
    {
      id: 1,
      name: 'Catalogue',
      path: '/catalogue',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Update Catalogue',
      path: '/catalogue/update_catalogue',
      show: true, // Always show
    },
  ];
  return (
    <Wrapper className="h-full">
      {/* headers */}
      <div className="w-full py-5">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={catalogueBreadCrumbs} />
      </div>
      {/* body : [TODO] : add subHeader and table with selected items and also edited item of price for each column */}
    </Wrapper>
  );
};

export default UpdateCatalogue;
