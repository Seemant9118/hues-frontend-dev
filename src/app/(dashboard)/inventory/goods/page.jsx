'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import Tooltips from '@/components/auth/Tooltips';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductGoods,
  UpdateProductGoods,
  UploadProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CircleFadingPlus,
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  Share2,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGoodsColumns } from './GoodsColumns';

// dynamic imports
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

function Goods() {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const templateId = 1;

  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [goodsToEdit, setGoodsToEdit] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const InventoryEmptyStageData = {
    heading: `~"Revolutionize stock management with secure, editable, and shareable product listings for
    perfect cataloging."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Quickly upload and fine-tune detailed product information in bulk.`,
      },
      {
        id: 2,
        icon: <FileText size={14} />,
        subItemtitle: `Effortlessly add items for fresh, accurate inventory.`,
      },
      {
        id: 3,
        icon: <KeySquare size={14} />,
        subItemtitle: `Authenticate inventory with digital signatures for integrity and compliance.`,
      },
      {
        id: 4,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Share digitally signed inventory easily in PDF format.`,
      },
    ],
  };

  const { data: productGoods, isLoading } = useQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (res) => res.data.data,
  });

  // get product via search
  const searchProductGoods = productGoods?.filter((product) => {
    const productName = product.productName ?? '';
    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);
    formData.append('templateId', templateId);

    try {
      await UploadProductGoods(formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([goodsApi.getAllProductGoods.endpointKey]);
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  const GoodsColumns = useGoodsColumns(setIsEditing, setGoodsToEdit);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={'Goods'}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <div>
          {!isAdding && !isUploading && !isEditing && (
            <Wrapper>
              <SubHeader name={'Goods'}>
                <div className="flex items-center justify-center gap-4">
                  <SearchInput
                    toSearchTerm={searchTerm}
                    setToSearchTerm={setSearchTerm}
                  />
                  {/* coming soon */}
                  <Tooltips
                    trigger={
                      <Button
                        onClick={() => {}}
                        variant={'export'}
                        size="sm"
                        className="cursor-not-allowed"
                      >
                        <Share2 size={14} />
                        Share
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Button
                    variant={'export'}
                    size="sm"
                    onClick={() =>
                      exportTableToExcel('goods table', 'goods_list')
                    }
                  >
                    <Upload size={14} />
                    Export
                  </Button>
                  <Button
                    onClick={() => setIsUploading(true)}
                    variant={'blue_outline'}
                    size="sm"
                  >
                    <Upload size={14} />
                    Upload
                  </Button>
                  <Button
                    onClick={() => setIsAdding(true)}
                    variant={'blue_outline'}
                    size="sm"
                  >
                    <CircleFadingPlus size={14} />
                    Add
                  </Button>
                </div>
              </SubHeader>

              {isLoading && <Loading />}

              {!isLoading &&
                // isSuccess &&
                (productGoods && productGoods.length !== 0 ? (
                  <DataTable
                    id={'goods table'}
                    columns={GoodsColumns}
                    data={searchProductGoods}
                  />
                ) : (
                  <EmptyStageComponent
                    heading={InventoryEmptyStageData.heading}
                    desc={InventoryEmptyStageData.desc}
                    subHeading={InventoryEmptyStageData.subHeading}
                    subItems={InventoryEmptyStageData.subItems}
                  />
                ))}
            </Wrapper>
          )}

          {isAdding && (
            <AddItem
              setIsAdding={setIsAdding}
              name={'Item'}
              cta={'Item'}
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
