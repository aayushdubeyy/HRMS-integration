import type { SftpInfoConfig, SftpInfoExport } from '../types/sftpConfig';
import {
  appendAdvancedSettingsExport,
  createDefaultAdvancedSettings,
  parseAdvancedSettingsFromImport,
} from './advancedSettings';
import {
  buildConditionalTransformationsExport,
  parseConditionalTransformationsFromImport,
} from './conditionalFieldTransformations';
import {
  buildEmployeeRestrictionExport,
  parseEmployeeRestrictionImport,
  parseExcludeEmployeeCodes,
  parseStringArray,
} from './infoFieldExtensions';
import { DEFAULT_MANDATORY_FIELDS } from '../constants/amberKeys';

export function createDefaultSftpInfoConfig(): SftpInfoConfig {
  return {
    ...createDefaultAdvancedSettings(),
    mapping: {},
    mandatoryFields: [...DEFAULT_MANDATORY_FIELDS],
    phone_fields_to_transform: [],
    conditional_field_transformations: [],
    employee_restriction_config: [],
    customMandatoryFields: [],
    exclude_employee_codes: [],
    dont_insert_inactive_employees: false,
    leaving_date_format: '',
    modify_full_name: true,
    fetch_latest_file_only: false,
    skip_custom_logic: false,
  };
}

export function updateSftpMappingValue(
  config: SftpInfoConfig,
  amber_key: string,
  file_header: string,
): SftpInfoConfig {
  const next_mapping = { ...config.mapping };

  if (!file_header.trim()) {
    delete next_mapping[amber_key];
  } else {
    next_mapping[amber_key] = file_header;
  }

  return {
    ...config,
    mapping: next_mapping,
  };
}

export function buildSftpInfoExport(config: SftpInfoConfig): SftpInfoExport {
  const active_mapping = Object.fromEntries(
    Object.entries(config.mapping).filter(([, value]) => value.trim().length > 0),
  );
  const conditional_field_transformations = buildConditionalTransformationsExport(
    config.conditional_field_transformations,
  );
  const employee_restriction_config = buildEmployeeRestrictionExport(
    config.employee_restriction_config,
  );

  return appendAdvancedSettingsExport(
    {
      mapping: active_mapping,
      mandatoryFields: config.mandatoryFields,
      ...(config.phone_fields_to_transform.length > 0
        ? { phone_fields_to_transform: config.phone_fields_to_transform }
        : {}),
      ...(conditional_field_transformations.length > 0
        ? { conditional_field_transformations }
        : {}),
      ...(employee_restriction_config ? { employee_restriction_config } : {}),
      ...(config.customMandatoryFields.length > 0
        ? { customMandatoryFields: config.customMandatoryFields }
        : {}),
      ...(config.exclude_employee_codes.length > 0
        ? { exclude_employee_codes: config.exclude_employee_codes }
        : {}),
      ...(config.dont_insert_inactive_employees
        ? { dont_insert_inactive_employees: true }
        : {}),
      ...(config.leaving_date_format.trim()
        ? { leaving_date_format: config.leaving_date_format.trim() }
        : {}),
      ...(config.modify_full_name === false ? { modify_full_name: false } : {}),
      ...(config.fetch_latest_file_only ? { fetch_latest_file_only: true } : {}),
      ...(config.skip_custom_logic ? { skip_custom_logic: true } : {}),
    },
    config,
  );
}

export function parseSftpInfoImport(parsed_json: Record<string, unknown>): SftpInfoConfig {
  return {
    ...parseAdvancedSettingsFromImport(parsed_json),
    mapping: stringifyMapping(parsed_json.mapping),
    mandatoryFields: parseStringArray(parsed_json.mandatoryFields),
    phone_fields_to_transform: parseStringArray(parsed_json.phone_fields_to_transform),
    conditional_field_transformations: parseConditionalTransformationsFromImport(
      parsed_json.conditional_field_transformations,
    ),
    employee_restriction_config: parseEmployeeRestrictionImport(
      parsed_json.employee_restriction_config,
    ),
    customMandatoryFields: parseStringArray(parsed_json.customMandatoryFields),
    exclude_employee_codes: parseExcludeEmployeeCodes(parsed_json.exclude_employee_codes),
    dont_insert_inactive_employees: parsed_json.dont_insert_inactive_employees === true,
    leaving_date_format: String(parsed_json.leaving_date_format ?? ''),
    modify_full_name: parsed_json.modify_full_name !== false,
    fetch_latest_file_only: parsed_json.fetch_latest_file_only === true,
    skip_custom_logic: parsed_json.skip_custom_logic === true,
  };
}

function stringifyMapping(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([amber_key, file_header]) => [
      amber_key,
      String(file_header ?? ''),
    ]),
  );
}
