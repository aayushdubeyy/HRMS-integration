import { describe, expect, it } from 'vitest';
import {
  buildGeneralAdaptorExport,
  createDefaultGeneralAdaptorConfig,
  getAmberApiPath,
  updateAmberApiPath,
  updateAmberFieldType,
} from '../src/utils/generalAdaptorConfig';

describe('updateAmberApiPath', () => {
  it('creates default mapping and path_mapping when filling an amber api path', () => {
    const config = createDefaultGeneralAdaptorConfig();
    const next_config = updateAmberApiPath(config, 'full_name', 'data.employee.fullName');

    expect(next_config.mapping.full_name).toBe('FullName');
    expect(next_config.path_mapping.FullName).toBe('data.employee.fullName');
    expect(getAmberApiPath(next_config, 'full_name')).toBe('data.employee.fullName');
  });

  it('creates default mapping and date_fields_path_mapping for date amber fields', () => {
    const config = createDefaultGeneralAdaptorConfig();
    const next_config = updateAmberApiPath(config, 'joining_date', 'data.employee.doj');

    expect(next_config.mapping.joining_date).toBe('JoiningDate');
    expect(next_config.date_fields_path_mapping.JoiningDate).toBe('data.employee.doj');
    expect(next_config.path_mapping.JoiningDate).toBeUndefined();
    expect(getAmberApiPath(next_config, 'joining_date')).toBe('data.employee.doj');
  });

  it('removes mapping and path entries when api path is cleared', () => {
    const config = updateAmberApiPath(
      createDefaultGeneralAdaptorConfig(),
      'email',
      'data.employee.email',
    );
    const next_config = updateAmberApiPath(config, 'email', '');

    expect(next_config.mapping.email).toBeUndefined();
    expect(next_config.path_mapping.Email).toBeUndefined();
    expect(getAmberApiPath(next_config, 'email')).toBe('');
  });

  it('preserves imported custom path keys when updating api path', () => {
    const config = {
      ...createDefaultGeneralAdaptorConfig(),
      mapping: { full_name: 'CustomFullName' },
      path_mapping: { CustomFullName: 'old.path' },
    };
    const next_config = updateAmberApiPath(config, 'full_name', 'new.path');

    expect(next_config.mapping.full_name).toBe('CustomFullName');
    expect(next_config.path_mapping.CustomFullName).toBe('new.path');
  });

  it('exports mapping and path_mapping from a single api path fill', () => {
    const config = updateAmberApiPath(
      createDefaultGeneralAdaptorConfig(),
      'full_name',
      'data.employee.fullName',
    );
    const exported = buildGeneralAdaptorExport(config);

    expect(exported.mapping).toEqual({ full_name: 'FullName' });
    expect(exported.path_mapping).toEqual({ FullName: 'data.employee.fullName' });
  });

  it('routes api path to date map after type override', () => {
    const with_path = updateAmberApiPath(
      createDefaultGeneralAdaptorConfig(),
      'email',
      'data.employee.email',
    );
    const with_date_type = updateAmberFieldType(with_path, 'email', 'date');

    expect(with_date_type.date_fields_path_mapping.Email).toBe('data.employee.email');
    expect(with_date_type.path_mapping.Email).toBeUndefined();
    expect(getAmberApiPath(with_date_type, 'email')).toBe('data.employee.email');
  });
});
