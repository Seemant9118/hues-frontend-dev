import { services_api } from "@/api/inventories/services/services";
import { APIinstance } from "@/services";

export const GetAllProductServices = () => {
    return APIinstance.get(services_api.getAllProductServices.endpoint);
}

export const GetProductServices = (id) => {
    return APIinstance.get(services_api.getProductServices.endpoint + `${id}`);
}

export const CreateProductServices = (data) => {
    return APIinstance.post(services_api.createProductServices.endpoint,data);
}

export const UpdateProductServices = (id) => {
    return APIinstance.put(services_api.updateProductServices.endpoint+`${id}`);
}

export const DeleteProductServices = (id) => {
    return APIinstance.delete(services_api.deleteProductServices.endpoint+`${id}`);
}

export const UploadProductServices = (data) => {
    return APIinstance.post(services_api.uploadProductServices.endpoint,data);
}