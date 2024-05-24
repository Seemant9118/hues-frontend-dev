import { vendor_enterprise } from "@/api/enterprises_user/vendor_enterprise/vendor_enterprise";
import { APIinstance } from "@/services";

export function createVendor(data) {
  return APIinstance.post(
    vendor_enterprise.createVendorEnterprise.endpoint,
    data
  );
}

export function updateVendor(id, data) {
  return APIinstance.put(
    vendor_enterprise.updateVendorEnterprise.endpoint + `${id}`,
    data
  );
}

export function deleteVendor(id) {
  return APIinstance.delete(
    vendor_enterprise.deleteVendorEnterprise.endpoint + `${id}`
  );
}

export function getVendor(id) {
  return APIinstance.get(vendor_enterprise.getVendor.endpoint + `${id}`);
}

export function getVendors(id) {
  return APIinstance.get(vendor_enterprise.getVendors.endpoint + `${id}`);
}
