import { rolesApi } from '@/api/rolesApi/rolesApi';
import { APIinstance } from '@/services';

export const getRoles = () => {
  return APIinstance.get(rolesApi.getAllRoles.endpoint);
};

export const getPermissions = () => {
  return APIinstance.get(rolesApi.getAllPermissions.endpoint);
};
