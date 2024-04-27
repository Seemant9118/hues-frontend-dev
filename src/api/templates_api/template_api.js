export const template_api = {
  // 1 . get all template
  getTemplates: {
    endpoint: `/api/v1/template/form/gettemplates`,
    endpointKey: "get_templates",
  },

  // 2. get template by id
  getTemplate: {
    endpoint: `/api/v1/template/form/get/`,
    endpointKey: "get_template",
  },

  // 3. Upload template
  uploadTemplate: {
    endpoint: `/api/v1/template/form/upload/?enterprise_id=`,
    endpointKey: "upload_template",
  },

  // 4. update template
  updateTemplate: {
    endpoint: `/api/v1/template/form/update/`,
    endpointKey: "update_template",
  },

  // 5. delete template
  deleteTemplate: {
    endpoint: `/api/v1/template/form/delete/`,
    endpointKey: "delete_template",
  },

  //   6. create form response
  createFormResponse: {
    endpoint: `/api/v1/template/formresponse/create`,
    endpointKey: "create_form_response",
  },

  //   7. update form response
  updateFormResponse: {
    endpoint: `/api/v1/template/formresponse/update/`,
    endpointKey: "update_form_response",
  },
};
