export const template_api = {
  // 1 . get all template
  getTemplates: {
    endpoint: `/template/form/gettemplates`,
    endpointKey: "get_templates",
  },

  // 2. get template by id
  getTemplate: {
    endpoint: `/template/form/get/`,
    endpointKey: "get_template",
  },

  // 3. Upload template
  uploadTemplate: {
    endpoint: `/template/form/upload?enterprise_id=`,
    endpointKey: "upload_template",
  },

  // 4. update template
  updateTemplate: {
    endpoint: `/template/form/update/`,
    endpointKey: "update_template",
  },

  // 5. delete template
  deleteTemplate: {
    endpoint: `/template/form/delete/`,
    endpointKey: "delete_template",
  },

  //   6. create form response
  createFormResponse: {
    endpoint: `/template/formresponse/create`,
    endpointKey: "create_form_response",
  },

  //   7. update form response
  updateFormResponse: {
    endpoint: `/template/formresponse/update/`,
    endpointKey: "update_form_response",
  },
  //   9. Get Uploaded Document from s3
  getS3Document: {
    endpoint: `/template/form/gets3link/`,
    endpointKey: "get s3 document",
  },
};
