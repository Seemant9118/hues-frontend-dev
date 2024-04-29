import { goods_api } from "@/api/inventories/goods/goods";
import { APIinstance } from "@/services";

export const GetAllProductGoods = (id) => {
    return APIinstance.get(goods_api.getAllProductGoods.endpoint + `${id}`);
}

export const GetProductGoods = (id) => {
    return APIinstance.get(goods_api.getProductGoods.endpoint + `${id}`);
}

export const CreateProductGoods = (data) => {
    return APIinstance.post(goods_api.createProductGoods.endpoint,data);
}

export const UpdateProductGoods = (data,id) => {
    return APIinstance.put(goods_api.updateProductGoods.endpoint+`${id}`,data);
}

export const DeleteProductGoods = (id) => {
    return APIinstance.delete(goods_api.deleteProductGoods.endpoint+`${id}`);
}

export const UploadProductGoods = (data) => {
    return APIinstance.post(goods_api.uploadProductGoods.endpoint,data);
}