import { describe, expect, it } from 'vitest';
import {
  buildSftpConfigExport,
  createDefaultSftpConfigForm,
  parseSftpConfigImport,
} from '../src/utils/sftpAdaptorConfigForm';

describe('sftpAdaptorConfigForm', () => {
  it('exports required connection fields with password auth', () => {
    const form = {
      ...createDefaultSftpConfigForm(),
      host: 'sftp.example.com',
      port: '22',
      username: 'sftp_user',
      auth_mode: 'password' as const,
      password: 'secret',
      remoteFolderPath: '/uploads/employees',
    };
    const exported = buildSftpConfigExport(form);

    expect(exported).toMatchObject({
      host: 'sftp.example.com',
      port: 22,
      username: 'sftp_user',
      password: 'secret',
      remoteFolderPath: '/uploads/employees',
    });
    expect(exported.ssh_key_path).toBeUndefined();
  });

  it('exports ssh_key_path instead of password when ssh auth is selected', () => {
    const form = {
      ...createDefaultSftpConfigForm(),
      host: 'sftp.example.com',
      port: '22',
      username: 'sftp_user',
      auth_mode: 'ssh_key' as const,
      ssh_key_path: '/keys/sftp.pem',
      ssh_passphrase: 'phrase',
      remoteFolderPath: '/data',
    };
    const exported = buildSftpConfigExport(form);

    expect(exported.ssh_key_path).toBe('/keys/sftp.pem');
    expect(exported.ssh_passphrase).toBe('phrase');
    expect(exported.password).toBeUndefined();
  });

  it('omits empty optional flags and strings from export', () => {
    const exported = buildSftpConfigExport({
      ...createDefaultSftpConfigForm(),
      host: 'host',
      port: '22',
      username: 'user',
      password: 'pw',
      remoteFolderPath: '/path',
    });

    expect(exported.contains_large_files).toBeUndefined();
    expect(exported.is_xlsx_file).toBeUndefined();
    expect(exported.path).toBeUndefined();
    expect(exported.private_key).toBeUndefined();
  });

  it('exports optional file and error upload options when set', () => {
    const form = {
      ...createDefaultSftpConfigForm(),
      host: 'host',
      port: '22',
      username: 'user',
      password: 'pw',
      remoteFolderPath: '/path',
      is_xlsx_file: true,
      contains_pipe_separated_data: true,
      is_pgp_encrypted: true,
      private_key: '-----BEGIN PGP-----',
      passphrase: 'pgp-pass',
      path: '/errors',
      record_failures: true,
      send_error_file: true,
      priority_alert: true,
    };
    const exported = buildSftpConfigExport(form);

    expect(exported.is_xlsx_file).toBe(true);
    expect(exported.contains_pipe_separated_data).toBe(true);
    expect(exported.is_pgp_encrypted).toBe(true);
    expect(exported.private_key).toBe('-----BEGIN PGP-----');
    expect(exported.passphrase).toBe('pgp-pass');
    expect(exported.path).toBe('/errors');
    expect(exported.record_failures).toBe(true);
    expect(exported.send_error_file).toBe(true);
    expect(exported.priority_alert).toBe(true);
  });

  it('imports password auth config from json', () => {
    const imported = parseSftpConfigImport({
      host: 'sftp.example.com',
      port: 22,
      username: 'sftp_user',
      password: 'enc-password',
      remoteFolderPath: '/uploads',
      is_xlsx_file: true,
    });

    expect(imported.host).toBe('sftp.example.com');
    expect(imported.port).toBe('22');
    expect(imported.auth_mode).toBe('password');
    expect(imported.password).toBe('enc-password');
    expect(imported.remoteFolderPath).toBe('/uploads');
    expect(imported.is_xlsx_file).toBe(true);
  });

  it('imports ssh key auth when ssh_key_path is present', () => {
    const imported = parseSftpConfigImport({
      host: 'host',
      port: '2222',
      username: 'user',
      ssh_key_path: '/keys/id_rsa',
      ssh_passphrase: 'phrase',
      remoteFolderPath: '/remote',
    });

    expect(imported.auth_mode).toBe('ssh_key');
    expect(imported.ssh_key_path).toBe('/keys/id_rsa');
    expect(imported.ssh_passphrase).toBe('phrase');
  });
});
