"use client";
import { goods_api } from "@/api/inventories/goods/goods";
import AddItem from "@/components/inventory/AddItem";
import EditItem from "@/components/inventory/EditItem";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import Loading from "@/components/Loading";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { LocalStorageService, exportTableToExcel } from "@/lib/utils";
import {
  GetAllProductGoods,
  UpdateProductGoods,
  UploadProductGoods,
} from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CircleFadingPlus,
  DatabaseZap,
  Download,
  FileCheck,
  FileText,
  KeySquare,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useGoodsColumns } from "./GoodsColumns";
import { toast } from "sonner";

function Goods() {
  const enpterpriseId = LocalStorageService.get("enterprise_Id");
  const templateId = 1;

  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [goodsToEdit, setGoodsToEdit] = useState(null);
  const [isUploading, setisUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const InventoryEmptyStageData = {
    heading: `~"Revolutionize stock management with secure, editable, and shareable product listings for
    perfect cataloging."`,
    subHeading: "Features",
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

  const { data, isLoading, isSuccess, error } = useQuery({
    queryKey: [goods_api.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enpterpriseId),
    select: (data) => data.data.data,
  });

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("enterpriseId", enpterpriseId);
    formData.append("templateId", templateId);

    try {
      const res = await UploadProductGoods(formData);
      toast.success("Upload Successfully");
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([goods_api.getAllProductGoods.endpointKey]);
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong");
    }
  };

  const GoodsColumns = useGoodsColumns(setIsEditing, setGoodsToEdit);

  return (
    <>
      {!isAdding && !isUploading && !isEditing && (
        <Wrapper>
          <SubHeader name={"Goods"}>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={"export"}
                size="sm"
                onClick={() => exportTableToExcel("goods table", "goods_list")}
              >
                <Upload size={14} />
                Export
              </Button>
              <Button
                onClick={() => setisUploading(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Upload size={14} />
                Upload
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                variant={"blue_outline"}
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
            (data && data.length !== 0 ? (
              <DataTable
                id={"goods table"}
                columns={GoodsColumns}
                data={data}
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
          name={"Item"}
          cta={"Item"}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {isEditing && (
        <EditItem
          setIsEditing={setIsEditing}
          goodsToEdit={goodsToEdit}
          setGoodsToEdit={setGoodsToEdit}
          mutationFunc={UpdateProductGoods}
          queryKey={[goods_api.getAllProductGoods.endpointKey]}
        />
      )}

      {isUploading && (
        <Wrapper className={"justify-start items-center"}>
          <FileUploader
            handleChange={uploadFile}
            name="file"
            types={["xlsx", "csv"]}
          >
            <div className="min-w-[700px] grow px-5 py-10 mb-2 flex gap-3 justify-between items-center rounded border-2 border-sky-300 border-dashed border-spacing-3 cursor-pointer">
              <div className="flex items-center gap-4">
                <UploadCloud className="text-sky-500" size={40} />
                <div className="flex flex-col gap-1 ">
                  <p className=" text-darkText font-medium text-xs">
                    Drag & Drop or Select a File (Max 10MB,
                    <span className="text-sky-500 font-bold">
                      {" "}
                      .csv/.xlsx Formats
                    </span>{" "}
                    )
                  </p>
                  <p className="text-sky-500 text-xs font-normal">
                    Note - Trade enabled for eSigned inventories only.
                  </p>
                  {/* <p className="text-sky-500 text-xs font-normal">
                    Supported File formats : .csv | .xls
                  </p> */}
                </div>
              </div>
              <Button variant="blue_outline">
                <Upload />
                Select
              </Button>
            </div>
          </FileUploader>

          <Button asChild variant="outline" className="w-full max-w-[700px]">
            <a
              download={"/Hues_inventory_sample_goods.xlsx"}
              href="/Hues_inventory_sample_goods.xlsx"
            >
              <Download />
              Sample
            </a>
          </Button>
          {files.map((file, idx) => (
            <div
              key={idx}
              className="p-4 border-neutral-300 border rounded-sm flex items-center justify-between gap-4 min-w-[700px]"
            >
              <div className="flex items-center gap-4">
                <p className="text-xs font-medium leading-[18px]">
                  {file.name}
                </p>
                <div className="w-1 h-1 rounded-full bg-neutral-400"></div>
                {/* <a
                  href="#"
                  className="text-blue-500 underline underline-offset-2 text-xs leading-4"
                >
                  Preview
                </a> */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                    <Check size={10} />
                  </div>
                  <p className="text-xs font-medium text-green-500 leading-5">
                    Upload Successfully!
                  </p>
                </div>
              </div>
              {/* <button
                onClick={() => {
                  setFiles((prev) => {
                    const updated = [...prev];
                    updated.splice(idx, 1);
                    return updated;
                  });
                }}
              >
                <Trash2 className="text-grey" size={14} />
              </button> */}
            </div>
          ))}
          <div className="h-[1px] w-full bg-neutral-300 mt-auto"></div>

          <div className="flex justify-end self-end ">
            <Button
              onClick={() => {
                setisUploading(false);
                setFiles([]);
              }}
            >
              Done
            </Button>
          </div>
        </Wrapper>
      )}
    </>
  );
}

export default Goods;
