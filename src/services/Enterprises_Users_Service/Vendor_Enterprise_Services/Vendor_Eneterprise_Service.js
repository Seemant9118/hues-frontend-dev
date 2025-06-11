import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { APIinstance } from '@/services';

export function searchedVendors({ data, page, limit }) {
  return APIinstance.post(
    `${vendorEnterprise.searchedVendors.endpoint}?page=${page}&limit=${limit}`,
    data,
  );
}

export function createVendor(data) {
  return APIinstance.post(
    vendorEnterprise.createVendorEnterprise.endpoint,
    data,
  );
}

export function updateVendor(id, data) {
  return APIinstance.put(
    `${vendorEnterprise.updateVendorEnterprise.endpoint}${id}`,
    data,
  );
}

export function deleteVendor({ id }) {
  return APIinstance.delete(
    `${vendorEnterprise.deleteVendorEnterprise.endpoint}${id}`,
  );
}

export function getVendor(id) {
  return APIinstance.get(`${vendorEnterprise.getVendor.endpoint}${id}`);
}

export function getVendors({ id, context, page, limit }) {
  return APIinstance.get(
    `${vendorEnterprise.getVendors.endpoint}${id}?context=${context}&page=${page}&limit=${limit}`,
  );
}

export function bulkUploadVendors(data) {
  return APIinstance.post(vendorEnterprise.bulkUploadVendors.endpoint, data);
}

export function getVendorSampleFile() {
  return APIinstance.get(vendorEnterprise.getVendorSample.endpoint);
}
