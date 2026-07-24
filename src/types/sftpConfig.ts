import type {
  ConditionalFieldTransformationForm,
  EmployeeRestrictionRow,
  HrmsAdvancedSettings,
  HrmsAdvancedSettingsExport,
} from './hrmsConfig';

export type SftpInfoConfig = HrmsAdvancedSettings & {
  mapping: Record<string, string>;
  mandatoryFields: string[];
  phone_fields_to_transform: string[];
  conditional_field_transformations: ConditionalFieldTransformationForm[];
  employee_restriction_config: EmployeeRestrictionRow[];
  customMandatoryFields: string[];
  exclude_employee_codes: string[];
  dont_insert_inactive_employees: boolean;
  leaving_date_format: string;
  modify_full_name: boolean;
  fetch_latest_file_only: boolean;
  skip_custom_logic: boolean;
};

export type SftpInfoExport = {
  mapping: Record<string, string>;
  mandatoryFields: string[];
  phone_fields_to_transform?: string[];
  conditional_field_transformations?: unknown[];
  employee_restriction_config?: EmployeeRestrictionRow[];
  customMandatoryFields?: string[];
  exclude_employee_codes?: string[];
  dont_insert_inactive_employees?: boolean;
  leaving_date_format?: string;
  modify_full_name?: boolean;
  fetch_latest_file_only?: boolean;
  skip_custom_logic?: boolean;
} & HrmsAdvancedSettingsExport;

export type SftpAuthMode = 'password' | 'ssh_key';

export type SftpConfigForm = {
  host: string;
  port: string;
  username: string;
  auth_mode: SftpAuthMode;
  password: string;
  password_is_already_encrypted: boolean;
  ssh_key_path: string;
  ssh_passphrase: string;
  ssh_passphrase_is_already_encrypted: boolean;
  remoteFolderPath: string;
  contains_large_files: boolean;
  is_xlsx_file: boolean;
  contains_pipe_separated_data: boolean;
  contains_employee_number: boolean;
  is_pgp_encrypted: boolean;
  private_key: string;
  private_key_is_already_encrypted: boolean;
  passphrase: string;
  passphrase_is_already_encrypted: boolean;
  is_binary_message: boolean;
  is_pipe_separated: boolean;
  is_base64_encrypted: boolean;
  path: string;
  record_failures: boolean;
  send_error_file: boolean;
  priority_alert: boolean;
};

export type SftpConfigExport = {
  host: string;
  port: number | string;
  username: string;
  password?: string;
  ssh_key_path?: string;
  ssh_passphrase?: string;
  remoteFolderPath: string;
  contains_large_files?: boolean;
  is_xlsx_file?: boolean;
  contains_pipe_separated_data?: boolean;
  contains_employee_number?: boolean;
  is_pgp_encrypted?: boolean;
  private_key?: string;
  passphrase?: string;
  is_binary_message?: boolean;
  is_pipe_separated?: boolean;
  is_base64_encrypted?: boolean;
  path?: string;
  record_failures?: boolean;
  send_error_file?: boolean;
  priority_alert?: boolean;
};

export type AdaptorType = 'general' | 'sftp';
