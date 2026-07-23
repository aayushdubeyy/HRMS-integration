export type AllowedEmployeeRule = {
  field_name: string;
  values: string[];
  operator: 'equals' | 'not_equals' | 'starts_with' | 'not_starts_with';
};

export type AllowedEmployeesConfig = {
  logic: 'AND' | 'OR';
  rules: Array<AllowedEmployeeRule | AllowedEmployeesConfig>;
};

export type MapEntry = {
  entry_id: string;
  source_value: string;
  mapped_value: string;
};

export type MapTransformation = {
  condition_field: string;
  target_field: string;
  map_entries: MapEntry[];
};

export type MapTransformationExport = {
  condition_field: string;
  target_field: string;
  map: Record<string, string | number>;
};

export type HrmsAdvancedSettings = {
  hardcode_fields: Record<string, string>;
  specific_user_hardcodes: Record<string, Record<string, string>>;
  map_transformations: MapTransformation[];
  allowed_employees_config: AllowedEmployeesConfig | null;
  custom_date_format: string;
};

export type TransformationOperator = 'in' | 'not_in' | 'starts_with' | 'ends_with';

export type GroupTransformationCondition = {
  condition_id: string;
  condition_field: string;
  condition_value: string[];
  operator: TransformationOperator;
};

export type IndividualConditionalTransformation = {
  transformation_id: string;
  mode: 'individual';
  condition_field: string;
  condition_value: string[];
  operator: TransformationOperator;
  target_field: string;
  target_value: string | number;
};

export type GroupedConditionalTransformation = {
  transformation_id: string;
  mode: 'grouped';
  group_conditions: GroupTransformationCondition[];
  logic_operator: 'and' | 'or';
  target_field: string;
  target_value: string | number;
};

export type ConditionalFieldTransformationForm =
  | IndividualConditionalTransformation
  | GroupedConditionalTransformation;

export type ConditionalFieldTransformationIndividualExport = {
  condition_field: string;
  condition_value: string[];
  operator: TransformationOperator;
  target_field: string;
  target_value: string | number;
};

export type ConditionalFieldTransformationGroupedExport = {
  group_conditions: Array<{
    condition_field: string;
    condition_value: string[];
    operator: TransformationOperator;
  }>;
  logic_operator: 'and' | 'or';
  target_field: string;
  target_value: string | number;
};

export type ConditionalFieldTransformationExport =
  | ConditionalFieldTransformationIndividualExport
  | ConditionalFieldTransformationGroupedExport;

export type FieldPathType = 'date' | 'string';

export type GeneralAdaptorInfoConfig = HrmsAdvancedSettings & {
  date_format: string;
  conditional_field_transformations: ConditionalFieldTransformationForm[];
  mandatoryFields: string[];
  response_list_path: string;
  date_fields_path_mapping: Record<string, string>;
  path_mapping: Record<string, string>;
  mapping: Record<string, string>;
  phone_fields_to_transform: string[];
  field_type_overrides: Record<string, FieldPathType>;
};

export type HrmsAdvancedSettingsExport = Partial<{
  hardcode_fields: Record<string, string | number>;
  specific_user_hardcodes: Record<string, Record<string, string | number>>;
  map_transformations: MapTransformationExport[];
  allowed_employees_config: AllowedEmployeesConfig;
  custom_date_format: string;
}>;

export type GeneralAdaptorInfoExport = {
  date_format: string;
  conditional_field_transformations?: ConditionalFieldTransformationExport[];
  mandatoryFields: string[];
  response_list_path?: string;
  date_fields_path_mapping: Record<string, string>;
  path_mapping: Record<string, string>;
  mapping: Record<string, string>;
  phone_fields_to_transform?: string[];
} & HrmsAdvancedSettingsExport;

export type HrmsAuthBodyField = {
  key: string;
  value: string;
  is_already_encrypted: boolean;
};

export type HrmsAuthFormConfig = {
  auth_type: 'basic' | 'bearer' | 'api_key';
  content_type: string;
  body_type: 'none' | 'json' | 'form' | 'xml';
  user: string;
  password: string;
  password_is_already_encrypted: boolean;
  bearer_token: string;
  bearer_token_is_already_encrypted: boolean;
  token: string;
  token_is_already_encrypted: boolean;
  api_key: string;
  api_key_is_already_encrypted: boolean;
  api_key_header: string;
  body_fields: HrmsAuthBodyField[];
  body_xml: string;
  body_xml_is_already_encrypted: boolean;
};

export type ApiSourceFormConfig = {
  source_id: string;
  name: string;
  data_url: string;
  method: 'get' | 'post';
  response_list_path: string;
  headers: Array<{ key: string; value: string }>;
  auth: HrmsAuthFormConfig;
};

export type GeneralAdaptorConfig = {
  api_sources: ApiSourceFormConfig[];
};

export type GeneralAdaptorConfigExport = {
  api_sources: Array<{
    name?: string;
    data_url: string;
    method: string;
    response_list_path?: string;
    headers?: Record<string, string>;
    auth: Record<string, unknown>;
  }>;
};

export function isAllowedEmployeesGroup(
  rule: AllowedEmployeeRule | AllowedEmployeesConfig,
): rule is AllowedEmployeesConfig {
  return 'rules' in rule;
}
