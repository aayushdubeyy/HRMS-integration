import type { SftpConfigExport, SftpConfigForm } from '../types/sftpConfig';
import { isLikelyEncryptedValue } from './encryptionService';

export function createDefaultSftpConfigForm(): SftpConfigForm {
  return {
    host: '',
    port: '22',
    username: '',
    auth_mode: 'password',
    password: '',
    password_is_already_encrypted: false,
    ssh_key_path: '',
    ssh_passphrase: '',
    ssh_passphrase_is_already_encrypted: false,
    remoteFolderPath: '',
    contains_large_files: false,
    is_xlsx_file: false,
    contains_pipe_separated_data: false,
    contains_employee_number: false,
    is_pgp_encrypted: false,
    private_key: '',
    private_key_is_already_encrypted: false,
    passphrase: '',
    passphrase_is_already_encrypted: false,
    is_binary_message: false,
    is_pipe_separated: false,
    is_base64_encrypted: false,
    path: '',
    record_failures: false,
    send_error_file: false,
    priority_alert: false,
  };
}

export function buildSftpConfigExport(form: SftpConfigForm): SftpConfigExport {
  const port_number = Number(form.port);
  const exported: SftpConfigExport = {
    host: form.host.trim(),
    port: Number.isFinite(port_number) && form.port.trim() !== '' ? port_number : form.port.trim(),
    username: form.username.trim(),
    remoteFolderPath: form.remoteFolderPath.trim(),
  };

  appendAuthExport(exported, form);
  appendOptionalBoolean(exported, 'contains_large_files', form.contains_large_files);
  appendOptionalBoolean(exported, 'is_xlsx_file', form.is_xlsx_file);
  appendOptionalBoolean(exported, 'contains_pipe_separated_data', form.contains_pipe_separated_data);
  appendOptionalBoolean(exported, 'contains_employee_number', form.contains_employee_number);
  appendOptionalBoolean(exported, 'is_pgp_encrypted', form.is_pgp_encrypted);
  appendOptionalString(exported, 'private_key', form.private_key);
  appendOptionalString(exported, 'passphrase', form.passphrase);
  appendOptionalBoolean(exported, 'is_binary_message', form.is_binary_message);
  appendOptionalBoolean(exported, 'is_pipe_separated', form.is_pipe_separated);
  appendOptionalBoolean(exported, 'is_base64_encrypted', form.is_base64_encrypted);
  appendOptionalString(exported, 'path', form.path);
  appendOptionalBoolean(exported, 'record_failures', form.record_failures);
  appendOptionalBoolean(exported, 'send_error_file', form.send_error_file);
  appendOptionalBoolean(exported, 'priority_alert', form.priority_alert);

  return exported;
}

function appendAuthExport(exported: SftpConfigExport, form: SftpConfigForm): void {
  if (form.auth_mode === 'ssh_key') {
    appendOptionalString(exported, 'ssh_key_path', form.ssh_key_path);
    appendOptionalString(exported, 'ssh_passphrase', form.ssh_passphrase);
    return;
  }

  appendOptionalString(exported, 'password', form.password);
}

function appendOptionalBoolean(
  exported: SftpConfigExport,
  key: keyof SftpConfigExport,
  value: boolean,
): void {
  if (value) {
    (exported as Record<string, unknown>)[key] = true;
  }
}

function appendOptionalString(
  exported: SftpConfigExport,
  key: keyof SftpConfigExport,
  value: string,
): void {
  if (value.trim()) {
    (exported as Record<string, unknown>)[key] = value.trim();
  }
}

export function parseSftpConfigImport(parsed_json: Record<string, unknown>): SftpConfigForm {
  const defaults = createDefaultSftpConfigForm();
  const has_ssh_key = Boolean(String(parsed_json.ssh_key_path ?? '').trim());
  const password = String(parsed_json.password ?? '');
  const ssh_passphrase = String(parsed_json.ssh_passphrase ?? '');
  const private_key = String(parsed_json.private_key ?? '');
  const passphrase = String(parsed_json.passphrase ?? '');

  return {
    ...defaults,
    host: String(parsed_json.host ?? ''),
    port: String(parsed_json.port ?? defaults.port),
    username: String(parsed_json.username ?? ''),
    auth_mode: has_ssh_key ? 'ssh_key' : 'password',
    password,
    password_is_already_encrypted: isLikelyEncryptedValue(password),
    ssh_key_path: String(parsed_json.ssh_key_path ?? ''),
    ssh_passphrase,
    ssh_passphrase_is_already_encrypted: isLikelyEncryptedValue(ssh_passphrase),
    remoteFolderPath: String(parsed_json.remoteFolderPath ?? ''),
    contains_large_files: parsed_json.contains_large_files === true,
    is_xlsx_file: parsed_json.is_xlsx_file === true,
    contains_pipe_separated_data: parsed_json.contains_pipe_separated_data === true,
    contains_employee_number: parsed_json.contains_employee_number === true,
    is_pgp_encrypted: parsed_json.is_pgp_encrypted === true,
    private_key,
    private_key_is_already_encrypted: isLikelyEncryptedValue(private_key),
    passphrase,
    passphrase_is_already_encrypted: isLikelyEncryptedValue(passphrase),
    is_binary_message: parsed_json.is_binary_message === true,
    is_pipe_separated: parsed_json.is_pipe_separated === true,
    is_base64_encrypted: parsed_json.is_base64_encrypted === true,
    path: String(parsed_json.path ?? ''),
    record_failures: parsed_json.record_failures === true,
    send_error_file: parsed_json.send_error_file === true,
    priority_alert: parsed_json.priority_alert === true,
  };
}
