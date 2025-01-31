'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { debounce } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductGoods,
  GetSearchedProductGoods,
  UpdateProductGoods,
  UploadProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleFadingPlus, Share2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGoodsColumns } from './GoodsColumns';

// Dynamic imports
const AddItem = dynamic(() => import('@/components/inventory/AddItem'), {
  loading: () => <Loading />,
});
const EditItem = dynamic(() => import('@/components/inventory/EditItem'), {
  loading: () => <Loading />,
});
const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

// MACROS
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

function Goods() {
  useMetaData('Hues! - Goods', 'HUES GOODS'); // dynamic title

  const translations = useTranslations('goods');

  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'goods.emptyStateComponent.subItems.subItem1',
    'goods.emptyStateComponent.subItems.subItem2',
    'goods.emptyStateComponent.subItems.subItem3',
    'goods.emptyStateComponent.subItems.subItem4',
  ];

  // Local Storage and States
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');
  const templateId = 1;

  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(''); // local search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [goodsToEdit, setGoodsToEdit] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [productGoods, setProductGoods] = useState([]);

  // Synchronize state with query parameters
  useEffect(() => {
    const state = searchParams.get('action');
    setIsAdding(state === 'add');
    setIsEditing(state === 'edit');
    setIsUploading(state === 'upload');
  }, [searchParams]);

  useEffect(() => {
    let newPath = `/inventory/goods`;
    if (isAdding) newPath += `?action=add`;
    else if (isEditing) newPath += `?action=edit`;
    else if (isUploading) newPath += `?action=upload`;

    router.push(newPath);
  }, [router, isAdding, isEditing, isUploading]);

  // Fetch all product goods
  const {
    data: allProductGoods,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (res) => res.data.data,
    enabled: searchTerm?.length === 0,
  });

  // Fetch searched product goods
  const { data: searchedProductGoods, isLoading: isSearchProductGoodsLoading } =
    useQuery({
      queryKey: [goodsApi.getSearchedProductGoods.endpointKey, searchTerm],
      queryFn: () =>
        GetSearchedProductGoods({
          searchString: debouncedSearchTerm, // Ensure debouncedSearchTerm is used
        }),
      select: (res) => res.data.data,
      enabled: !!debouncedSearchTerm, // Use debounced value here
    });

  // Debounce logic with useCallback
  const updateDebouncedSearchTerm = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, DEBOUNCE_DELAY),
    [],
  );
  useEffect(() => {
    updateDebouncedSearchTerm(searchTerm);
  }, [searchTerm, updateDebouncedSearchTerm]);

  // Consolidated state update logic
  useEffect(() => {
    if (debouncedSearchTerm && searchedProductGoods) {
      setProductGoods(searchedProductGoods); // set productGoods from search api
    } else if (!debouncedSearchTerm && isSuccess) {
      setProductGoods(allProductGoods); // set productGoods from get api
    }
  }, [debouncedSearchTerm, searchedProductGoods, allProductGoods, isSuccess]);

  // handleUploadfile
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);
    formData.append('templateId', templateId);

    try {
      await UploadProductGoods(formData);
      toast.success(translations('messages.uploadSuccessMsg'));
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([goodsApi.getAllProductGoods.endpointKey]);
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  // columns
  const GoodsColumns = useGoodsColumns(setIsEditing, setGoodsToEdit);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <div>
          {!isAdding && !isUploading && !isEditing && (
            <Wrapper>
              <SubHeader name={translations('title')}>
                <div className="flex items-center gap-4">
                  <SearchInput
                    searchPlaceholder={translations('ctas.searchPlaceholder')}
                    toSearchTerm={searchTerm}
                    setToSearchTerm={setSearchTerm}
                  />
                  <Tooltips
                    trigger={
                      <Button
                        variant="export"
                        size="sm"
                        className="cursor-not-allowed"
                      >
                        <Share2 size={14} />
                      </Button>
                    }
                    content={translations('ctas.comingSoon')}
                  />
                  <Button
                    variant="export"
                    size="sm"
                    onClick={() =>
                      exportTableToExcel('goods table', translations('title'))
                    }
                  >
                    <Upload size={14} />
                    {translations('ctas.export')}
                  </Button>
                  <Button
                    onClick={() => setIsUploading(true)}
                    variant="blue_outline"
                    size="sm"
                  >
                    <Upload size={14} />
                    {translations('ctas.upload')}
                  </Button>
                  <Button
                    onClick={() => setIsAdding(true)}
                    variant="blue_outline"
                    size="sm"
                  >
                    <CircleFadingPlus size={14} />
                    {translations('ctas.add')}
                  </Button>
                </div>
              </SubHeader>

              {(isLoading || isSearchProductGoodsLoading) && <Loading />}
              {(!isLoading || !isSearchProductGoodsLoading) &&
                (allProductGoods?.length > 0 ? (
                  <DataTable
                    id="goods table"
                    columns={GoodsColumns}
                    data={productGoods}
                  />
                ) : (
                  <EmptyStageComponent
                    heading={translations('emptyStateComponent.heading')}
                    subItems={keys}
                  />
                ))}
            </Wrapper>
          )}

          {isAdding && (
            <AddItem
              setIsAdding={setIsAdding}
              name="Item"
              cta="Item"
              onCancel={() => setIsAdding(false)}
            />
          )}
          {isEditing && (
            <EditItem
              setIsEditing={setIsEditing}
              goodsToEdit={goodsToEdit}
              setGoodsToEdit={setGoodsToEdit}
              mutationFunc={UpdateProductGoods}
              queryKey={[goodsApi.getAllProductGoods.endpointKey]}
            />
          )}
          {isUploading && (
            <UploadItems
              type="goods"
              uploadFile={uploadFile}
              files={files}
              setisUploading={setIsUploading}
              setFiles={setFiles}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Goods;
