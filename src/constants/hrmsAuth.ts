export const AUTH_TYPES = ['basic', 'bearer', 'api_key'] as const;
export const BODY_TYPES = ['none', 'json', 'form', 'xml'] as const;
export const HTTP_METHODS = ['get', 'post'] as const;

export type AuthType = (typeof AUTH_TYPES)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type HttpMethod = (typeof HTTP_METHODS)[number];

export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  basic: 'Basic Auth',
  bearer: 'Bearer Token',
  api_key: 'API Key Header',
};

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  none: 'No Body',
  json: 'JSON Body',
  form: 'Form Data Body',
  xml: 'XML Body',
};

export const DEFAULT_API_KEY_HEADER = 'x-api-key';

export const DEFAULT_PAGINATION_PAGE_SIZE = '100';
export const DEFAULT_PAGINATION_DATE_FORMAT = 'YYYY-MM-DD';

export const REQUEST_TEMPLATE_PLACEHOLDERS = [
  '{{page_number}}',
  '{{page_size}}',
  '{{from_date}}',
  '{{to_date}}',
  '{{from_updated_date}}',
  '{{to_updated_date}}',
] as const;
