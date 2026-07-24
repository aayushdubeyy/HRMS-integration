import { describe, expect, it } from 'vitest';
import {
  buildSftpInfoExport,
  createDefaultSftpInfoConfig,
  parseSftpInfoImport,
  updateSftpMappingValue,
} from '../src/utils/sftpAdaptorConfig';

describe('sftpAdaptorConfig', () => {
  it('omits empty file headers from mapping export', () => {
    const with_name = updateSftpMappingValue(
      createDefaultSftpInfoConfig(),
      'full_name',
      'Full Name',
    );
    const with_empty_email = updateSftpMappingValue(with_name, 'email', '   ');
    const exported = buildSftpInfoExport(with_empty_email);

    expect(exported.mapping).toEqual({ full_name: 'Full Name' });
    expect(exported.mapping.email).toBeUndefined();
  });

  it('exports fetch_latest_file_only and skip_custom_logic when enabled', () => {
    const config = {
      ...createDefaultSftpInfoConfig(),
      fetch_latest_file_only: true,
      skip_custom_logic: true,
    };
    const exported = buildSftpInfoExport(config);

    expect(exported.fetch_latest_file_only).toBe(true);
    expect(exported.skip_custom_logic).toBe(true);
  });

  it('omits fetch_latest_file_only and skip_custom_logic when false', () => {
    const exported = buildSftpInfoExport(createDefaultSftpInfoConfig());

    expect(exported.fetch_latest_file_only).toBeUndefined();
    expect(exported.skip_custom_logic).toBeUndefined();
  });

  it('imports mapping and sftp flags from json', () => {
    const imported = parseSftpInfoImport({
      mapping: { full_name: 'Full Name', email: 'Email ID' },
      mandatoryFields: ['email'],
      fetch_latest_file_only: true,
      skip_custom_logic: true,
      modify_full_name: false,
    });

    expect(imported.mapping).toEqual({
      full_name: 'Full Name',
      email: 'Email ID',
    });
    expect(imported.mandatoryFields).toEqual(['email']);
    expect(imported.fetch_latest_file_only).toBe(true);
    expect(imported.skip_custom_logic).toBe(true);
    expect(imported.modify_full_name).toBe(false);
  });

  it('clears mapping entry when file header is emptied', () => {
    const with_name = updateSftpMappingValue(
      createDefaultSftpInfoConfig(),
      'full_name',
      'Full Name',
    );
    const cleared = updateSftpMappingValue(with_name, 'full_name', '');

    expect(cleared.mapping.full_name).toBeUndefined();
  });
});
