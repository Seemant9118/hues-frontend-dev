'use client';

import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import Tooltips from '@/components/auth/Tooltips';
import EnterpriseDetails from '@/components/enterprise/EnterpriseDetails';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  getCustomers,
  getCustomersByNumber,
} from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, PlusCircle, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useCustomersColumns } from './useCustomersColumns';

// dynamic imports
// const UploadItems = dynamic(
//   () => import('@/components/inventory/UploadItems'),
//   { loading: () => <Loading /> },
// );

// MACROS
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

const CustomerPage = () => {
  useMetaData('Hues! - Customers', 'HUES CUSTOMERS'); // dynamic title

  const translations = useTranslations('customer');
  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'customer.emptyStateComponent.subItems.subItem1',
    'customer.emptyStateComponent.subItems.subItem2',
    'customer.emptyStateComponent.subItems.subItem3',
    'customer.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  //   const queryClient = useQueryClient();
  //   const [isUploading, setIsUploading] = useState(false);
  //   const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [customers, setCustomers] = useState([]);
  const [isEnterpriseDetailsShow, setIsEnterpriseDetailsShow] = useState(false);
  const [selectedEnterpriseContent, setSelectedEnterpriseContent] =
    useState(null);

  // api fetching for clients
  const {
    isLoading,
    data: customersData,
    isSuccess,
  } = useQuery({
    queryKey: [customerApis.getCustomers.endpointKey],
    queryFn: () => getCustomers(enterpriseId),
    select: (res) => res.data.data,
    enabled: searchTerm?.length === 0,
  });

  const { data: searchedCustomersData, isLoading: issearchedCustomersLoading } =
    useQuery({
      queryKey: [
        customerApis.getCustomersByNumber.endpointKey,
        debouncedSearchTerm,
      ],
      queryFn: () =>
        getCustomersByNumber({
          searchString: debouncedSearchTerm,
        }),
      select: (res) => res.data.data,
      enabled: !!debouncedSearchTerm && customersData?.length > 0,
    });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm && searchedCustomersData) {
      // formatting data
      if (searchedCustomersData) {
        setCustomers(searchedCustomersData); // set clients from search api
      }
    } else if (!debouncedSearchTerm && isSuccess) {
      // formatting data
      if (customersData) {
        setCustomers(customersData); // set clients from get api
      }
    }
  }, [debouncedSearchTerm, searchedCustomersData, customersData, isSuccess]);

  // handleFile fn
  //   const uploadFile = async (file) => {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('enterpriseId', enterpriseId);

  //     try {
  //       await bulkUploadClients(formData);
  //       toast.success('Upload Successfully');
  //       setFiles((prev) => [...prev, file]);
  //       queryClient.invalidateQueries([customerApis.getCustomers.endpointKey]);
  //     } catch (error) {
  //       toast.error(error.response.data.message || 'Something went wrong');
  //     }
  //   };

  // onRowClick
  const onRowClick = (row) => {
    setIsEnterpriseDetailsShow(true);
    setSelectedEnterpriseContent(row);
  };

  // columns
  const CustomersColumns = useCustomersColumns();

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <div>
          <Wrapper>
            <SubHeader name={translations('title')}>
              <div className="flex items-center justify-center gap-4">
                <SearchInput
                  searchPlaceholder={translations('ctas.searchPlaceHolder')}
                  toSearchTerm={searchTerm}
                  setToSearchTerm={setSearchTerm}
                  disabled={true}
                />
                <Tooltips
                  trigger={
                    <Button
                      variant={customersData?.length > 0 ? 'outline' : 'export'}
                      size="sm"
                      onClick={() =>
                        exportTableToExcel('customers table', 'customer_lists')
                      }
                      className={
                        customersData?.length === 0
                          ? 'cursor-not-allowed'
                          : 'cursor-pointer'
                      }
                    >
                      <Download size={14} />
                    </Button>
                  }
                  content={translations('ctas.tooltips.export')}
                />
                <Tooltips
                  trigger={
                    <Button
                      variant="blue_outline"
                      size="sm"
                      className="cursor-not-allowed"
                      // onClick={() => setIsUploading(true)}
                    >
                      <Upload size={14} />
                      {translations('ctas.upload')}
                    </Button>
                  }
                  content={translations('ctas.tooltips.coming_soon')}
                />

                <Tooltips
                  trigger={
                    <Button
                      size="sm"
                      className="flex cursor-not-allowed items-center"
                    >
                      <PlusCircle size={14} />
                      Add
                    </Button>
                  }
                  content={translations('ctas.tooltips.coming_soon')}
                />
              </div>
            </SubHeader>

            {(isLoading || issearchedCustomersLoading) && <Loading />}

            {(!isLoading || !issearchedCustomersLoading) &&
              (customersData?.length > 0 ? (
                <DataTable
                  id={'customers table'}
                  onRowClick={onRowClick}
                  columns={CustomersColumns}
                  data={customers ?? []}
                />
              ) : (
                <EmptyStageComponent
                  heading={translations('emptyStateComponent.heading')}
                  subItems={keys}
                />
              ))}
          </Wrapper>

          {isEnterpriseDetailsShow && (
            <EnterpriseDetails
              data={selectedEnterpriseContent}
              isEnterpriseDetailsShow={isEnterpriseDetailsShow}
              setIsEnterpriseDetailsShow={setIsEnterpriseDetailsShow}
            />
          )}
        </div>
      )}
    </>
  );
};

export default CustomerPage;
