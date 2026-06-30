import type {
  HrmsIntegrationSqlForm,
  HrmsIntegrationSqlValidation,
} from '../types/hrmsIntegrationSql';

export function createDefaultHrmsIntegrationSqlForm(): HrmsIntegrationSqlForm {
  return {
    client_id: '',
    hrms_type: 'general',
    config_json: '',
    info_json: '',
    execution_at: '11:00:00',
    hrms_config_name: 'Internal API',
    hrms_config_type: 'API Pull',
  };
}

function escapeSqlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function parseJsonText(json_text: string, field_name: string): string {
  const trimmed_json = json_text.trim();
  if (!trimmed_json) {
    throw new Error(`${field_name} JSON is required`);
  }

  return JSON.stringify(JSON.parse(trimmed_json));
}

export function validateHrmsIntegrationSqlForm(
  form: HrmsIntegrationSqlForm,
): HrmsIntegrationSqlValidation {
  const validation: HrmsIntegrationSqlValidation = {
    config_json_error: '',
    info_json_error: '',
    client_id_error: '',
    hrms_config_name_error: '',
    hrms_config_type_error: '',
    execution_at_error: '',
  };

  const client_id = Number(form.client_id);
  if (!form.client_id.trim() || !Number.isInteger(client_id) || client_id <= 0) {
    validation.client_id_error = 'client_id must be a positive integer';
  }

  if (!form.hrms_config_name.trim()) {
    validation.hrms_config_name_error = 'HRMS config name is required';
  }

  if (!form.hrms_config_type.trim()) {
    validation.hrms_config_type_error = 'HRMS config type is required';
  }

  if (!/^\d{2}:\d{2}:\d{2}$/.test(form.execution_at.trim())) {
    validation.execution_at_error = 'execution_at must use HH:mm:ss format';
  }

  try {
    parseJsonText(form.config_json, 'config');
  } catch (error) {
    validation.config_json_error =
      error instanceof Error ? error.message : 'config JSON is invalid';
  }

  try {
    parseJsonText(form.info_json, 'info');
  } catch (error) {
    validation.info_json_error =
      error instanceof Error ? error.message : 'info JSON is invalid';
  }

  return validation;
}

export function hasHrmsIntegrationSqlValidationErrors(
  validation: HrmsIntegrationSqlValidation,
): boolean {
  return Object.values(validation).some((error_message) => error_message.length > 0);
}

export function buildHrmsIntegrationInsertSql(form: HrmsIntegrationSqlForm): string {
  const validation = validateHrmsIntegrationSqlForm(form);
  if (hasHrmsIntegrationSqlValidationErrors(validation)) {
    throw new Error('Fix validation errors before generating SQL');
  }

  const config_json = parseJsonText(form.config_json, 'config');
  const info_json = parseJsonText(form.info_json, 'info');
  const hrms_config_json = JSON.stringify({
    name: form.hrms_config_name.trim(),
    type: form.hrms_config_type.trim(),
  });

  return [
    'INSERT INTO `hrms_integrations` (`client_id`, `hrms_type`, `config`, `info`, `execution_at`, `hrms_config`)',
    `VALUES(${Number(form.client_id)},`,
    `'${escapeSqlString(form.hrms_type.trim())}',`,
    `'${escapeSqlString(config_json)}',`,
    `'${escapeSqlString(info_json)}',`,
    `'${escapeSqlString(form.execution_at.trim())}',`,
    `'${escapeSqlString(hrms_config_json)}');`,
  ].join('\n');
}

export function prettifyJsonText(json_text: string): string {
  return JSON.stringify(JSON.parse(json_text.trim()), null, 2);
}
