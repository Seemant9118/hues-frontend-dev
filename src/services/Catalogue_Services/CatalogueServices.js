import { APIinstance } from '@/services';
import { catalogueApis } from '@/api/catalogue/catalogueApi';

export const createUpdateCatalogue = ({ id, data }) => {
  return APIinstance.post(
    `${catalogueApis.createAndUpdateCatalogue.endpoint}${id}`,
    data,
  );
};

export const getCatalogues = (id) => {
  return APIinstance.get(`${catalogueApis.getCatalogues.endpoint}${id}`);
};

export const deleteCatalogue = (id) => {
  return APIinstance.delete(`${catalogueApis.deleteCatalogue.endpoint}${id}`);
};
