import { describe, expect, it } from 'vitest';
import {
  buildGeneralAdaptorExport,
  createDefaultGeneralAdaptorConfig,
} from '../src/utils/generalAdaptorConfig';
import { parseAdvancedSettingsFromImport } from '../src/utils/advancedSettings';
import {
  buildCompositeFieldsExport,
  parseCompositeFieldsImport,
  buildMobileSanitizeFieldsExport,
  parseMobileSanitizeFieldsImport,
  buildEmployeeRestrictionExport,
  parseEmployeeRestrictionImport,
} from '../src/utils/infoFieldExtensions';

describe('composite_fields', () => {
  it('exports amber composite fields as pascal-case path keys', () => {
    const config = {
      ...createDefaultGeneralAdaptorConfig(),
      mapping: { full_name: 'FullName', first_name: 'FirstName', last_name: 'LastName' },
      composite_fields: [
        {
          row_id: 'row-1',
          target_field: 'full_name',
          source_fields: ['first_name', 'last_name'],
        },
      ],
    };

    expect(buildCompositeFieldsExport(config.composite_fields, config.mapping)).toEqual({
      FullName: ['FirstName', 'LastName'],
    });
  });

  it('imports composite fields back to amber keys when mapping exists', () => {
    const mapping = { full_name: 'FullName', first_name: 'FirstName', last_name: 'LastName' };
    const rows = parseCompositeFieldsImport(
      { FullName: ['FirstName', 'LastName'] },
      mapping,
    );

    expect(rows).toEqual([
      {
        row_id: expect.any(String),
        target_field: 'full_name',
        source_fields: ['first_name', 'last_name'],
      },
    ]);
  });

  it('includes composite_fields in info export when present', () => {
    const config = {
      ...createDefaultGeneralAdaptorConfig(),
      mapping: { full_name: 'FullName', first_name: 'FirstName', last_name: 'LastName' },
      path_mapping: {
        FullName: 'a',
        FirstName: 'b',
        LastName: 'c',
      },
      composite_fields: [
        {
          row_id: 'row-1',
          target_field: 'full_name',
          source_fields: ['first_name', 'last_name'],
        },
      ],
    };

    const exported = buildGeneralAdaptorExport(config);
    expect(exported.composite_fields).toEqual({
      FullName: ['FirstName', 'LastName'],
    });
  });
});

describe('mobile_sanitize_fields', () => {
  it('exports amber keys as pascal path keys', () => {
    const mapping = { phone: 'Phone', office_phone: 'OfficePhone' };
    expect(buildMobileSanitizeFieldsExport(['phone', 'office_phone'], mapping)).toEqual([
      'Phone',
      'OfficePhone',
    ]);
  });

  it('imports pascal keys back to amber keys', () => {
    const mapping = { phone: 'Phone', office_phone: 'OfficePhone' };
    expect(parseMobileSanitizeFieldsImport(['Phone', 'OfficePhone'], mapping)).toEqual([
      'phone',
      'office_phone',
    ]);
  });
});

describe('employee_restriction_config', () => {
  it('exports filled restriction rules', () => {
    const export_rules = buildEmployeeRestrictionExport([
      {
        row_id: 'r1',
        field_name: 'department',
        allowed_values: ['sales', 'eng'],
        operator: 'equals',
      },
      {
        row_id: 'r2',
        field_name: '',
        allowed_values: [],
        operator: 'equals',
      },
    ]);

    expect(export_rules).toEqual([
      {
        field_name: 'department',
        allowed_values: ['sales', 'eng'],
        operator: 'equals',
      },
    ]);
  });

  it('imports restriction rules into form rows', () => {
    const rows = parseEmployeeRestrictionImport([
      {
        field_name: 'department',
        allowed_values: ['sales'],
        operator: 'not_equals',
      },
    ]);

    expect(rows).toEqual([
      {
        row_id: expect.any(String),
        field_name: 'department',
        allowed_values: ['sales'],
        operator: 'not_equals',
      },
    ]);
  });
});

describe('controller sync flags in info export', () => {
  it('exports customMandatoryFields, exclude codes, and inactive flags', () => {
    const config = {
      ...createDefaultGeneralAdaptorConfig(),
      mapping: { email: 'Email' },
      path_mapping: { Email: 'data.email' },
      customMandatoryFields: ['department'],
      exclude_employee_codes: ['E001', 'E002'],
      dont_insert_inactive_employees: true,
      leaving_date_format: 'DD-MMM-YYYY',
      modify_full_name: false,
    };

    const exported = buildGeneralAdaptorExport(config);

    expect(exported.customMandatoryFields).toEqual(['department']);
    expect(exported.exclude_employee_codes).toEqual(['E001', 'E002']);
    expect(exported.dont_insert_inactive_employees).toBe(true);
    expect(exported.leaving_date_format).toBe('DD-MMM-YYYY');
    expect(exported.modify_full_name).toBe(false);
  });

  it('omits inactive and modify_full_name defaults', () => {
    const config = {
      ...createDefaultGeneralAdaptorConfig(),
      mapping: { email: 'Email' },
      path_mapping: { Email: 'data.email' },
      dont_insert_inactive_employees: false,
      modify_full_name: true,
    };

    const exported = buildGeneralAdaptorExport(config);
    expect(exported.dont_insert_inactive_employees).toBeUndefined();
    expect(exported.modify_full_name).toBeUndefined();
  });
});

describe('parseAdvancedSettingsFromImport retains existing keys', () => {
  it('still parses custom_date_format', () => {
    const parsed = parseAdvancedSettingsFromImport({
      custom_date_format: 'DD-MM-YYYY',
    });
    expect(parsed.custom_date_format).toBe('DD-MM-YYYY');
  });
});
