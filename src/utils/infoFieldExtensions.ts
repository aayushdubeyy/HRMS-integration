import { AMBER_KEYS, amberKeyToPascalCase } from '../constants/amberKeys';
import type {
  CompositeFieldRow,
  EmployeeRestrictionOperator,
  EmployeeRestrictionRow,
} from '../types/hrmsConfig';

export function createEmptyCompositeFieldRow(): CompositeFieldRow {
  return {
    row_id: `composite-${Date.now()}`,
    target_field: '',
    source_fields: [],
  };
}

export function createEmptyEmployeeRestrictionRow(): EmployeeRestrictionRow {
  return {
    row_id: `restriction-${Date.now()}`,
    field_name: '',
    allowed_values: [],
    operator: 'equals',
  };
}

export function resolveAmberToPathKey(
  amber_key: string,
  mapping: Record<string, string>,
): string {
  if (mapping[amber_key]?.trim()) {
    return mapping[amber_key].trim();
  }

  const amber_definition = AMBER_KEYS.find((definition) => definition.key === amber_key);
  return amber_definition?.pascal_case ?? amberKeyToPascalCase(amber_key);
}

export function resolvePathKeyToAmber(
  path_key: string,
  mapping: Record<string, string>,
): string {
  const amber_entry = Object.entries(mapping).find(([, value]) => value === path_key);
  if (amber_entry) {
    return amber_entry[0];
  }

  const amber_definition = AMBER_KEYS.find(
    (definition) => definition.pascal_case === path_key,
  );
  return amber_definition?.key ?? path_key;
}

export function buildCompositeFieldsExport(
  composite_fields: CompositeFieldRow[],
  mapping: Record<string, string>,
): Record<string, string[]> | undefined {
  const export_fields = Object.fromEntries(
    composite_fields
      .filter(
        (row) => row.target_field.trim().length > 0 && row.source_fields.length > 0,
      )
      .map((row) => [
        resolveAmberToPathKey(row.target_field, mapping),
        row.source_fields.map((amber_key) => resolveAmberToPathKey(amber_key, mapping)),
      ]),
  );

  return Object.keys(export_fields).length > 0 ? export_fields : undefined;
}

export function parseCompositeFieldsImport(
  value: unknown,
  mapping: Record<string, string>,
): CompositeFieldRow[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).map(
    ([target_path_key, source_fields], index) => ({
      row_id: `composite-import-${index}`,
      target_field: resolvePathKeyToAmber(target_path_key, mapping),
      source_fields: Array.isArray(source_fields)
        ? source_fields.map((source_field) =>
            resolvePathKeyToAmber(String(source_field), mapping),
          )
        : [],
    }),
  );
}

export function buildMobileSanitizeFieldsExport(
  mobile_sanitize_fields: string[],
  mapping: Record<string, string>,
): string[] | undefined {
  const path_keys = mobile_sanitize_fields
    .filter((amber_key) => amber_key.trim().length > 0)
    .map((amber_key) => resolveAmberToPathKey(amber_key, mapping));

  return path_keys.length > 0 ? path_keys : undefined;
}

export function parseMobileSanitizeFieldsImport(
  value: unknown,
  mapping: Record<string, string>,
): string[] {
  if (!Array.isArray(value)) return [];

  return value.map((path_key) => resolvePathKeyToAmber(String(path_key), mapping));
}

export function buildEmployeeRestrictionExport(
  employee_restriction_config: EmployeeRestrictionRow[],
):
  | Array<{
      field_name: string;
      allowed_values: string[];
      operator: EmployeeRestrictionOperator;
    }>
  | undefined {
  const rules = employee_restriction_config
    .filter(
      (row) => row.field_name.trim().length > 0 && row.allowed_values.length > 0,
    )
    .map((row) => ({
      field_name: row.field_name.trim(),
      allowed_values: row.allowed_values.map((value) => value.trim().toLowerCase()),
      operator: row.operator,
    }));

  return rules.length > 0 ? rules : undefined;
}

export function parseEmployeeRestrictionImport(value: unknown): EmployeeRestrictionRow[] {
  if (!Array.isArray(value)) return [];

  return value.map((rule, index) => {
    const restriction = (rule ?? {}) as Record<string, unknown>;
    const operator = restriction.operator;
    const parsed_operator: EmployeeRestrictionOperator =
      operator === 'not_equals' ||
      operator === 'starts_with' ||
      operator === 'not_starts_with'
        ? operator
        : 'equals';

    return {
      row_id: `restriction-import-${index}`,
      field_name: String(restriction.field_name ?? ''),
      allowed_values: Array.isArray(restriction.allowed_values)
        ? restriction.allowed_values.map((allowed_value) => String(allowed_value))
        : [],
      operator: parsed_operator,
    };
  });
}

export function parseExcludeEmployeeCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((code) => String(code)).filter((code) => code.trim().length > 0);
}

export function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter((item) => item.trim().length > 0);
}
