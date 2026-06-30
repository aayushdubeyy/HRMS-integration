export type HrmsIntegrationSqlForm = {
  client_id: string;
  hrms_type: string;
  config_json: string;
  info_json: string;
  execution_at: string;
  hrms_config_name: string;
  hrms_config_type: string;
};

export type HrmsIntegrationSqlValidation = {
  config_json_error: string;
  info_json_error: string;
  client_id_error: string;
  hrms_config_name_error: string;
  hrms_config_type_error: string;
  execution_at_error: string;
};
