import type {
  ApiSourceFormConfig,
  ApiSourcePaginationExport,
  ApiSourcePaginationForm,
  GeneralAdaptorConfig,
  GeneralAdaptorConfigExport,
  HrmsAuthFormConfig,
} from '../types/hrmsConfig';
import {
  DEFAULT_API_KEY_HEADER,
  DEFAULT_PAGINATION_DATE_FORMAT,
  DEFAULT_PAGINATION_PAGE_SIZE,
} from '../constants/hrmsAuth';
import { isLikelyEncryptedValue } from './encryptionService';

export function createDefaultAuthConfig(): HrmsAuthFormConfig {
  return {
    auth_type: 'basic',
    content_type: 'application/json',
    body_type: 'none',
    user: '',
    password: '',
    password_is_already_encrypted: false,
    bearer_token: '',
    bearer_token_is_already_encrypted: false,
    token: '',
    token_is_already_encrypted: false,
    api_key: '',
    api_key_is_already_encrypted: false,
    api_key_header: DEFAULT_API_KEY_HEADER,
    body_fields: [{ key: '', value: '', is_already_encrypted: false }],
    body_xml: '',
    body_xml_is_already_encrypted: false,
  };
}

export function createDefaultPaginationConfig(): ApiSourcePaginationForm {
  return {
    is_enabled: false,
    page_size: DEFAULT_PAGINATION_PAGE_SIZE,
    date_format: DEFAULT_PAGINATION_DATE_FORMAT,
    default_from_date: '',
  };
}

export function createDefaultApiSource(): ApiSourceFormConfig {
  return {
    source_id: `source-${Date.now()}`,
    name: '',
    data_url: '',
    method: 'post',
    response_list_path: '',
    headers: [{ key: '', value: '' }],
    request_body_fields: [{ key: '', value: '' }],
    pagination: createDefaultPaginationConfig(),
    auth: createDefaultAuthConfig(),
  };
}

export function createDefaultGeneralAdaptorConfigForm(): GeneralAdaptorConfig {
  return {
    api_sources: [createDefaultApiSource()],
  };
}

function keyValueRowsToRecord(
  rows: Array<{ key: string; value: string }>,
): Record<string, string> | undefined {
  const record = Object.fromEntries(
    rows
      .filter((row) => row.key.trim().length > 0)
      .map((row) => [row.key.trim(), row.value]),
  );

  return Object.keys(record).length > 0 ? record : undefined;
}

function buildPaginationExport(
  pagination: ApiSourcePaginationForm,
): ApiSourcePaginationExport | undefined {
  if (!pagination.is_enabled) return undefined;

  const page_size = Number(pagination.page_size);
  const export_pagination: ApiSourcePaginationExport = {
    page_size: Number.isFinite(page_size) && page_size > 0 ? page_size : 100,
    date_format: pagination.date_format.trim() || DEFAULT_PAGINATION_DATE_FORMAT,
  };

  if (pagination.default_from_date.trim()) {
    export_pagination.default_from_date = pagination.default_from_date.trim();
  }

  return export_pagination;
}

function buildAuthBodyExport(auth: HrmsAuthFormConfig): string | Record<string, string> | undefined {
  if (auth.body_type === 'xml') {
    return auth.body_xml.trim() || undefined;
  }

  if (auth.body_type === 'json' || auth.body_type === 'form') {
    const body = Object.fromEntries(
      auth.body_fields
        .filter((field) => field.key.trim().length > 0)
        .map((field) => [field.key.trim(), field.value]),
    );

    return Object.keys(body).length > 0 ? body : undefined;
  }

  return undefined;
}

function buildAuthExport(auth: HrmsAuthFormConfig): Record<string, unknown> {
  const export_auth: Record<string, unknown> = {
    auth_type: auth.auth_type,
    body_type: auth.body_type,
  };

  if (auth.content_type.trim()) {
    export_auth.content_type = auth.content_type.trim();
  }

  if (auth.auth_type === 'basic') {
    export_auth.user = auth.user;
    export_auth.password = auth.password;
  }

  if (auth.auth_type === 'bearer') {
    if (auth.bearer_token.trim()) export_auth.bearer_token = auth.bearer_token;
    if (auth.token.trim()) export_auth.token = auth.token;
  }

  if (auth.auth_type === 'api_key') {
    export_auth.api_key = auth.api_key;
    if (auth.api_key_header.trim()) {
      export_auth.api_key_header = auth.api_key_header.trim();
    }
  }

  const body = buildAuthBodyExport(auth);
  if (body !== undefined) {
    export_auth.body = body;
  }

  return export_auth;
}

function buildApiSourceExport(source: ApiSourceFormConfig) {
  const headers = keyValueRowsToRecord(source.headers);
  const request_body = keyValueRowsToRecord(source.request_body_fields);
  const pagination = buildPaginationExport(source.pagination);

  return {
    ...(source.name.trim() ? { name: source.name.trim() } : {}),
    data_url: source.data_url.trim(),
    method: source.method,
    ...(source.response_list_path.trim()
      ? { response_list_path: source.response_list_path.trim() }
      : {}),
    ...(headers ? { headers } : {}),
    ...(request_body ? { request_body } : {}),
    ...(pagination ? { pagination } : {}),
    auth: buildAuthExport(source.auth),
  };
}

export function buildGeneralAdaptorConfigExport(
  config: GeneralAdaptorConfig,
): GeneralAdaptorConfigExport {
  const api_sources = config.api_sources
    .map(buildApiSourceExport)
    .filter((source) => source.data_url && source.auth);

  return { api_sources };
}

export function parseGeneralAdaptorConfigImport(
  parsed_json: Record<string, unknown>,
): GeneralAdaptorConfig {
  const api_sources = Array.isArray(parsed_json.api_sources)
    ? parsed_json.api_sources.map((source, index) => parseApiSourceImport(source, index))
    : [createDefaultApiSource()];

  return { api_sources };
}

function parseApiSourceImport(source: Record<string, unknown>, index: number): ApiSourceFormConfig {
  const auth = parseAuthImport((source.auth as Record<string, unknown>) ?? {});
  const headers = parseKeyValueImport(source.headers);
  const request_body_fields = parseKeyValueImport(source.request_body);

  return {
    source_id: `source-import-${index}`,
    name: String(source.name ?? ''),
    data_url: String(source.data_url ?? ''),
    method: source.method === 'get' ? 'get' : 'post',
    response_list_path: String(source.response_list_path ?? ''),
    headers: headers.length > 0 ? headers : [{ key: '', value: '' }],
    request_body_fields:
      request_body_fields.length > 0 ? request_body_fields : [{ key: '', value: '' }],
    pagination: parsePaginationImport(source.pagination),
    auth,
  };
}

function parsePaginationImport(value: unknown): ApiSourcePaginationForm {
  const defaults = createDefaultPaginationConfig();
  if (!value || typeof value !== 'object') {
    return defaults;
  }

  const pagination = value as Record<string, unknown>;
  return {
    is_enabled: true,
    page_size: String(pagination.page_size ?? DEFAULT_PAGINATION_PAGE_SIZE),
    date_format: String(pagination.date_format ?? DEFAULT_PAGINATION_DATE_FORMAT),
    default_from_date: String(pagination.default_from_date ?? ''),
  };
}

function parseKeyValueImport(value: unknown): Array<{ key: string; value: string }> {
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value as Record<string, unknown>).map(([key, field_value]) => ({
    key,
    value: String(field_value ?? ''),
  }));
}

function parseAuthImport(auth: Record<string, unknown>): HrmsAuthFormConfig {
  const default_auth = createDefaultAuthConfig();
  const body_type = String(auth.body_type ?? 'none');
  const parsed_body_type =
    body_type === 'json' || body_type === 'form' || body_type === 'xml' ? body_type : 'none';

  return {
    ...default_auth,
    auth_type:
      auth.auth_type === 'bearer' || auth.auth_type === 'api_key' ? auth.auth_type : 'basic',
    content_type: String(auth.content_type ?? 'application/json'),
    body_type: parsed_body_type,
    user: String(auth.user ?? ''),
    password: String(auth.password ?? ''),
    password_is_already_encrypted: isLikelyEncryptedValue(String(auth.password ?? '')),
    bearer_token: String(auth.bearer_token ?? ''),
    bearer_token_is_already_encrypted: isLikelyEncryptedValue(String(auth.bearer_token ?? '')),
    token: String(auth.token ?? ''),
    token_is_already_encrypted: isLikelyEncryptedValue(String(auth.token ?? '')),
    api_key: String(auth.api_key ?? ''),
    api_key_is_already_encrypted: isLikelyEncryptedValue(String(auth.api_key ?? '')),
    api_key_header: String(auth.api_key_header ?? DEFAULT_API_KEY_HEADER),
    body_xml: typeof auth.body === 'string' ? auth.body : '',
    body_xml_is_already_encrypted:
      typeof auth.body === 'string' && isLikelyEncryptedValue(auth.body),
    body_fields: parseBodyFieldsImport(auth.body),
  };
}

function parseBodyFieldsImport(body: unknown): HrmsAuthFormConfig['body_fields'] {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [{ key: '', value: '', is_already_encrypted: false }];
  }

  const fields = Object.entries(body as Record<string, unknown>).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
    is_already_encrypted: isLikelyEncryptedValue(String(value ?? '')),
  }));

  return fields.length > 0 ? fields : [{ key: '', value: '', is_already_encrypted: false }];
}
