import type {
  AllowedEmployeesConfig,
  HrmsAdvancedSettings,
  HrmsAdvancedSettingsExport,
  MapEntry,
  MapTransformation,
  MapTransformationExport,
} from '../types/hrmsConfig';
import { isAllowedEmployeesGroup } from '../types/hrmsConfig';

export function createDefaultAdvancedSettings(): HrmsAdvancedSettings {
  return {
    hardcode_fields: {},
    specific_user_hardcodes: {},
    map_transformations: [],
    allowed_employees_config: null,
    custom_date_format: '',
  };
}

export function createEmptyAllowedEmployeesConfig(): AllowedEmployeesConfig {
  return {
    logic: 'AND',
    rules: [],
  };
}

export function createEmptyMapEntry(): MapEntry {
  return {
    entry_id: `entry-${Date.now()}`,
    source_value: '',
    mapped_value: '',
  };
}

export function createEmptyMapTransformation(): MapTransformation {
  return {
    condition_field: '',
    target_field: '',
    map_entries: [createEmptyMapEntry()],
  };
}

function parseMappedValue(mapped_value: string): string | number {
  const trimmed_value = mapped_value.trim();
  const numeric_value = Number(trimmed_value);
  if (trimmed_value !== '' && !Number.isNaN(numeric_value)) {
    return numeric_value;
  }

  return trimmed_value;
}

export function mapEntriesToRecord(
  map_entries: MapEntry[],
): Record<string, string | number> {
  return Object.fromEntries(
    map_entries
      .filter(
        (entry) => entry.source_value.trim().length > 0 && entry.mapped_value.trim().length > 0,
      )
      .map((entry) => [
        entry.source_value.trim().toLowerCase(),
        parseMappedValue(entry.mapped_value),
      ]),
  );
}

function mapRecordToEntries(map: Record<string, unknown>): MapEntry[] {
  const entries = Object.entries(map).map(([source_value, mapped_value], index) => ({
    entry_id: `entry-import-${index}`,
    source_value,
    mapped_value: String(mapped_value ?? ''),
  }));

  return entries.length > 0 ? entries : [createEmptyMapEntry()];
}

function hasAllowedEmployeesRules(config: AllowedEmployeesConfig | null): boolean {
  if (!config) return false;
  return config.rules.length > 0;
}

function buildAllowedEmployeesExport(
  config: AllowedEmployeesConfig | null,
): AllowedEmployeesConfig | undefined {
  if (!hasAllowedEmployeesRules(config) || !config) return undefined;

  const rules = config.rules
    .map((rule) => {
      if (isAllowedEmployeesGroup(rule)) {
        const nested_config = buildAllowedEmployeesExport(rule);
        return nested_config ?? null;
      }

      if (!rule.field_name || rule.values.length === 0) return null;
      return rule;
    })
    .filter((rule): rule is AllowedEmployeesConfig | NonNullable<typeof rule> => rule !== null);

  if (rules.length === 0) return undefined;

  return {
    logic: config.logic,
    rules,
  };
}

function buildHardcodeFieldsExport(
  hardcode_fields: Record<string, string>,
): Record<string, string | number> | undefined {
  const entries = Object.entries(hardcode_fields).filter(
    ([field_name, field_value]) => field_name && field_value.trim().length > 0,
  );

  if (entries.length === 0) return undefined;

  return Object.fromEntries(
    entries.map(([field_name, field_value]) => {
      const numeric_value = Number(field_value);
      if (field_value !== '' && !Number.isNaN(numeric_value)) {
        return [field_name, numeric_value];
      }

      return [field_name, field_value];
    }),
  );
}

function buildSpecificUserHardcodesExport(
  specific_user_hardcodes: Record<string, Record<string, string>>,
): Record<string, Record<string, string | number>> | undefined {
  const employee_entries = Object.entries(specific_user_hardcodes)
    .map(([employee_code, field_values]) => {
      const active_fields = Object.fromEntries(
        Object.entries(field_values).filter(
          ([field_name, field_value]) => field_name && field_value.trim().length > 0,
        ),
      );

      if (!employee_code.trim() || Object.keys(active_fields).length === 0) {
        return null;
      }

      const parsed_fields = Object.fromEntries(
        Object.entries(active_fields).map(([field_name, field_value]) => {
          const numeric_value = Number(field_value);
          if (field_value !== '' && !Number.isNaN(numeric_value)) {
            return [field_name, numeric_value];
          }

          return [field_name, field_value];
        }),
      );

      return [employee_code.trim(), parsed_fields];
    })
    .filter((entry): entry is [string, Record<string, string | number>] => entry !== null);

  if (employee_entries.length === 0) return undefined;

  return Object.fromEntries(employee_entries);
}

function buildMapTransformationsExport(
  map_transformations: MapTransformation[],
): MapTransformationExport[] | undefined {
  const active_transformations = map_transformations
    .map((transformation) => {
      const active_map = mapEntriesToRecord(transformation.map_entries);

      if (
        !transformation.condition_field ||
        !transformation.target_field ||
        Object.keys(active_map).length === 0
      ) {
        return null;
      }

      return {
        condition_field: transformation.condition_field,
        target_field: transformation.target_field,
        map: active_map,
      };
    })
    .filter((transformation): transformation is MapTransformationExport => transformation !== null);

  if (active_transformations.length === 0) return undefined;

  return active_transformations;
}

export function appendAdvancedSettingsExport<T extends object>(
  base_export: T,
  settings: HrmsAdvancedSettings,
): T & HrmsAdvancedSettingsExport {
  const hardcode_fields = buildHardcodeFieldsExport(settings.hardcode_fields);
  const specific_user_hardcodes = buildSpecificUserHardcodesExport(
    settings.specific_user_hardcodes,
  );
  const map_transformations = buildMapTransformationsExport(settings.map_transformations);
  const allowed_employees_config = buildAllowedEmployeesExport(settings.allowed_employees_config);
  const custom_date_format = settings.custom_date_format.trim();

  return {
    ...base_export,
    ...(hardcode_fields ? { hardcode_fields } : {}),
    ...(specific_user_hardcodes ? { specific_user_hardcodes } : {}),
    ...(map_transformations ? { map_transformations } : {}),
    ...(allowed_employees_config ? { allowed_employees_config } : {}),
    ...(custom_date_format ? { custom_date_format } : {}),
  };
}

export function parseAdvancedSettingsFromImport(
  parsed_json: Record<string, unknown>,
): HrmsAdvancedSettings {
  return {
    hardcode_fields: stringifyRecordValues(parsed_json.hardcode_fields),
    specific_user_hardcodes: stringifySpecificUserHardcodes(parsed_json.specific_user_hardcodes),
    map_transformations: Array.isArray(parsed_json.map_transformations)
      ? parsed_json.map_transformations.map((transformation, index) => ({
          condition_field: String(transformation.condition_field ?? ''),
          target_field: String(transformation.target_field ?? ''),
          map_entries: mapRecordToEntries(
            (transformation.map as Record<string, unknown>) ?? {},
          ).map((entry, entry_index) => ({
            ...entry,
            entry_id: `entry-import-${index}-${entry_index}`,
          })),
        }))
      : [],
    allowed_employees_config: parseAllowedEmployeesConfig(parsed_json.allowed_employees_config),
    custom_date_format: String(parsed_json.custom_date_format ?? ''),
  };
}

function stringifyRecordValues(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([field_name, field_value]) => [
      field_name,
      String(field_value ?? ''),
    ]),
  );
}

function stringifySpecificUserHardcodes(
  value: unknown,
): Record<string, Record<string, string>> {
  if (!value || typeof value !== 'object') return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([employee_code, field_values]) => [
      employee_code,
      stringifyRecordValues(field_values),
    ]),
  );
}

function parseAllowedEmployeesConfig(value: unknown): AllowedEmployeesConfig | null {
  if (!value || typeof value !== 'object') return null;

  const config = value as AllowedEmployeesConfig;
  if (!Array.isArray(config.rules)) return null;

  return {
    logic: config.logic === 'OR' ? 'OR' : 'AND',
    rules: config.rules,
  };
}
