import { AMBER_KEYS, DEFAULT_MANDATORY_FIELDS } from '../constants/amberKeys';
import { DEFAULT_DATE_FORMAT } from '../constants/dateFormats';
import type { GeneralAdaptorInfoConfig, GeneralAdaptorInfoExport, FieldPathType } from '../types/hrmsConfig';
import { appendAdvancedSettingsExport, createDefaultAdvancedSettings } from './advancedSettings';
import { buildConditionalTransformationsExport } from './conditionalFieldTransformations';
import {
  buildCompositeFieldsExport,
  buildEmployeeRestrictionExport,
  buildMobileSanitizeFieldsExport,
} from './infoFieldExtensions';

export function createDefaultGeneralAdaptorConfig(): GeneralAdaptorInfoConfig {
  return {
    ...createDefaultAdvancedSettings(),
    date_format: DEFAULT_DATE_FORMAT,
    conditional_field_transformations: [],
    mandatoryFields: [...DEFAULT_MANDATORY_FIELDS],
    response_list_path: '',
    date_fields_path_mapping: {},
    path_mapping: {},
    mapping: {},
    phone_fields_to_transform: [],
    field_type_overrides: {},
    composite_fields: [],
    mobile_sanitize_fields: [],
    employee_restriction_config: [],
    customMandatoryFields: [],
    exclude_employee_codes: [],
    dont_insert_inactive_employees: false,
    leaving_date_format: '',
    modify_full_name: true,
  };
}

export function getDefaultAmberFieldType(amber_key: string): FieldPathType {
  const amber_definition = AMBER_KEYS.find((definition) => definition.key === amber_key);
  return amber_definition?.is_date_field ? 'date' : 'string';
}

export function getAmberFieldType(
  amber_key: string,
  field_type_overrides: Record<string, FieldPathType>,
): FieldPathType {
  return field_type_overrides[amber_key] ?? getDefaultAmberFieldType(amber_key);
}

export function deriveFieldTypeOverridesFromImport(
  mapping: Record<string, string>,
  path_mapping: Record<string, string>,
  date_fields_path_mapping: Record<string, string>,
): Record<string, FieldPathType> {
  const field_type_overrides: Record<string, FieldPathType> = {};

  Object.entries(mapping).forEach(([amber_key, pascal_key]) => {
    if (!pascal_key) return;

    const default_type = getDefaultAmberFieldType(amber_key);
    const is_in_date_mapping = pascal_key in date_fields_path_mapping;
    const is_in_path_mapping = pascal_key in path_mapping;

    if (is_in_date_mapping && default_type === 'string') {
      field_type_overrides[amber_key] = 'date';
      return;
    }

    if (is_in_path_mapping && default_type === 'date' && !is_in_date_mapping) {
      field_type_overrides[amber_key] = 'string';
    }
  });

  return field_type_overrides;
}

export function updateAmberFieldType(
  config: GeneralAdaptorInfoConfig,
  amber_key: string,
  next_type: FieldPathType,
): GeneralAdaptorInfoConfig {
  const default_type = getDefaultAmberFieldType(amber_key);
  const next_overrides = { ...config.field_type_overrides };

  if (next_type === default_type) {
    delete next_overrides[amber_key];
  } else {
    next_overrides[amber_key] = next_type;
  }

  const pascal_key = config.mapping[amber_key];
  let path_mapping = { ...config.path_mapping };
  let date_fields_path_mapping = { ...config.date_fields_path_mapping };

  if (pascal_key) {
    if (next_type === 'date') {
      date_fields_path_mapping[pascal_key] =
        path_mapping[pascal_key] ?? date_fields_path_mapping[pascal_key] ?? '';
      delete path_mapping[pascal_key];
    } else {
      path_mapping[pascal_key] =
        date_fields_path_mapping[pascal_key] ?? path_mapping[pascal_key] ?? '';
      delete date_fields_path_mapping[pascal_key];
    }
  }

  return syncPathMappingsFromAmberMapping({
    ...config,
    field_type_overrides: next_overrides,
    path_mapping,
    date_fields_path_mapping,
  });
}

export function syncPathMappingsFromAmberMapping(
  config: GeneralAdaptorInfoConfig,
): GeneralAdaptorInfoConfig {
  const next_path_mapping = { ...config.path_mapping };
  const next_date_fields_path_mapping = { ...config.date_fields_path_mapping };
  const active_pascal_keys = new Set(Object.values(config.mapping).filter(Boolean));

  Object.keys(next_path_mapping).forEach((pascal_key) => {
    if (!active_pascal_keys.has(pascal_key)) {
      delete next_path_mapping[pascal_key];
    }
  });

  Object.keys(next_date_fields_path_mapping).forEach((pascal_key) => {
    if (!active_pascal_keys.has(pascal_key)) {
      delete next_date_fields_path_mapping[pascal_key];
    }
  });

  Object.entries(config.mapping).forEach(([amber_key, pascal_key]) => {
    if (!pascal_key) return;

    const field_type = getAmberFieldType(amber_key, config.field_type_overrides);

    if (field_type === 'date') {
      delete next_path_mapping[pascal_key];
      if (!(pascal_key in next_date_fields_path_mapping)) {
        next_date_fields_path_mapping[pascal_key] = '';
      }
      return;
    }

    delete next_date_fields_path_mapping[pascal_key];
    if (!(pascal_key in next_path_mapping)) {
      next_path_mapping[pascal_key] = '';
    }
  });

  return {
    ...config,
    path_mapping: next_path_mapping,
    date_fields_path_mapping: next_date_fields_path_mapping,
  };
}

export function updateAmberMappingValue(
  config: GeneralAdaptorInfoConfig,
  amber_key: string,
  pascal_key: string,
): GeneralAdaptorInfoConfig {
  const next_mapping = { ...config.mapping };

  if (!pascal_key.trim()) {
    delete next_mapping[amber_key];
  } else {
    next_mapping[amber_key] = pascal_key.trim();
  }

  return syncPathMappingsFromAmberMapping({
    ...config,
    mapping: next_mapping,
  });
}

export function getAmberApiPath(
  config: GeneralAdaptorInfoConfig,
  amber_key: string,
): string {
  const pascal_key = config.mapping[amber_key];
  if (!pascal_key) {
    return '';
  }

  const field_type = getAmberFieldType(amber_key, config.field_type_overrides);
  if (field_type === 'date') {
    return config.date_fields_path_mapping[pascal_key] ?? '';
  }

  return config.path_mapping[pascal_key] ?? '';
}

export function updateAmberApiPath(
  config: GeneralAdaptorInfoConfig,
  amber_key: string,
  api_path: string,
): GeneralAdaptorInfoConfig {
  if (!api_path) {
    return updateAmberMappingValue(config, amber_key, '');
  }

  const pascal_key = resolveAmberPascalKey(config, amber_key);
  const with_mapping = updateAmberMappingValue(config, amber_key, pascal_key);
  return writeAmberApiPathValue(with_mapping, amber_key, pascal_key, api_path);
}

function resolveAmberPascalKey(
  config: GeneralAdaptorInfoConfig,
  amber_key: string,
): string {
  if (config.mapping[amber_key]) {
    return config.mapping[amber_key];
  }

  const amber_definition = AMBER_KEYS.find((definition) => definition.key === amber_key);
  if (!amber_definition) {
    throw new Error(`Failed to resolve path key for unknown amber_key=${amber_key}`);
  }

  return amber_definition.pascal_case;
}

function writeAmberApiPathValue(
  config: GeneralAdaptorInfoConfig,
  amber_key: string,
  pascal_key: string,
  api_path: string,
): GeneralAdaptorInfoConfig {
  const field_type = getAmberFieldType(amber_key, config.field_type_overrides);

  if (field_type === 'date') {
    return {
      ...config,
      date_fields_path_mapping: {
        ...config.date_fields_path_mapping,
        [pascal_key]: api_path,
      },
    };
  }

  return {
    ...config,
    path_mapping: {
      ...config.path_mapping,
      [pascal_key]: api_path,
    },
  };
}

export function buildGeneralAdaptorExport(
  config: GeneralAdaptorInfoConfig,
): GeneralAdaptorInfoExport {
  const synced_config = syncPathMappingsFromAmberMapping(config);
  const active_mapping = Object.fromEntries(
    Object.entries(synced_config.mapping).filter(([, value]) => value.trim().length > 0),
  );
  const active_pascal_keys = new Set(Object.values(active_mapping));

  const path_mapping = Object.fromEntries(
    Object.entries(synced_config.path_mapping).filter(
      ([key, value]) => active_pascal_keys.has(key) && value.trim().length > 0,
    ),
  );

  const date_fields_path_mapping = Object.fromEntries(
    Object.entries(synced_config.date_fields_path_mapping).filter(
      ([key, value]) => active_pascal_keys.has(key) && value.trim().length > 0,
    ),
  );

  const conditional_field_transformations = buildConditionalTransformationsExport(
    synced_config.conditional_field_transformations,
  );

  const phone_fields_to_transform = synced_config.phone_fields_to_transform;
  const composite_fields = buildCompositeFieldsExport(
    synced_config.composite_fields,
    active_mapping,
  );
  const mobile_sanitize_fields = buildMobileSanitizeFieldsExport(
    synced_config.mobile_sanitize_fields,
    active_mapping,
  );
  const employee_restriction_config = buildEmployeeRestrictionExport(
    synced_config.employee_restriction_config,
  );

  return appendAdvancedSettingsExport(
    {
      date_format: synced_config.date_format,
      ...(conditional_field_transformations.length > 0
        ? { conditional_field_transformations }
        : {}),
      mandatoryFields: synced_config.mandatoryFields,
      ...(synced_config.response_list_path.trim()
        ? { response_list_path: synced_config.response_list_path.trim() }
        : {}),
      date_fields_path_mapping,
      path_mapping,
      mapping: active_mapping,
      ...(phone_fields_to_transform.length > 0 ? { phone_fields_to_transform } : {}),
      ...(composite_fields ? { composite_fields } : {}),
      ...(mobile_sanitize_fields ? { mobile_sanitize_fields } : {}),
      ...(employee_restriction_config ? { employee_restriction_config } : {}),
      ...(synced_config.customMandatoryFields.length > 0
        ? { customMandatoryFields: synced_config.customMandatoryFields }
        : {}),
      ...(synced_config.exclude_employee_codes.length > 0
        ? { exclude_employee_codes: synced_config.exclude_employee_codes }
        : {}),
      ...(synced_config.dont_insert_inactive_employees
        ? { dont_insert_inactive_employees: true }
        : {}),
      ...(synced_config.leaving_date_format.trim()
        ? { leaving_date_format: synced_config.leaving_date_format.trim() }
        : {}),
      ...(synced_config.modify_full_name === false ? { modify_full_name: false } : {}),
    },
    synced_config,
  );
}
