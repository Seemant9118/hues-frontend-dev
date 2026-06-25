export const templateBuilderApi = {
  // 1. Get all templates
  getTemplates: {
    endpoint: '/agreements/templates',
    endpointKey: 'get_builder_templates',
  },

  // 2. Delete template by id (soft delete)
  deleteTemplate: {
    endpoint: '/agreements/templates/',
    endpointKey: 'delete_builder_template',
  },

  // 3. Get supported variables list
  getVariables: {
    endpoint: '/agreements/variables',
    endpointKey: 'get_builder_variables',
  },

  // 4. Create a new template (POST)
  createTemplate: {
    endpoint: '/agreements/templates',
    endpointKey: 'create_builder_template',
  },

  // 5. Get template details by ID (GET)
  getTemplate: {
    endpoint: '/agreements/templates/',
    endpointKey: 'get_builder_template',
  },

  // 6. Update template by ID (PUT)
  updateTemplate: {
    endpoint: '/agreements/templates/',
    endpointKey: 'update_builder_template',
  },

  // 7. Publish/Unpublish template by ID (PATCH)
  publishTemplate: {
    endpoint: '/agreements/templates/',
    endpointKey: 'publish_builder_template',
  },

  // 8. Get user agreements (GET)
  getUserAgreements: {
    endpoint: '/agreements/users/agreements',
    endpointKey: 'get_user_agreements',
  },
};
