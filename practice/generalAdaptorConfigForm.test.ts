import { describe, expect, it } from 'vitest';
import {
  buildGeneralAdaptorConfigExport,
  createDefaultApiSource,
  createDefaultAuthConfig,
  createDefaultGeneralAdaptorConfigForm,
  createDefaultTokenApiConfig,
  parseGeneralAdaptorConfigImport,
} from '../src/utils/generalAdaptorConfigForm';

describe('api source pagination export and import', () => {
  it('exports pagination when enabled on an api source', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      method: 'get',
      pagination: {
        is_enabled: true,
        page_size: '50',
        date_format: 'YYYY-MM-DD',
        default_from_date: '2024-01-01',
      },
    };

    const exported = buildGeneralAdaptorConfigExport(config);

    expect(exported.api_sources[0].pagination).toEqual({
      page_size: 50,
      date_format: 'YYYY-MM-DD',
      default_from_date: '2024-01-01',
    });
  });

  it('omits pagination when disabled', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      pagination: {
        is_enabled: false,
        page_size: '100',
        date_format: 'YYYY-MM-DD',
        default_from_date: '',
      },
    };

    const exported = buildGeneralAdaptorConfigExport(config);
    expect(exported.api_sources[0].pagination).toBeUndefined();
  });

  it('imports pagination into form state', () => {
    const imported = parseGeneralAdaptorConfigImport({
      api_sources: [
        {
          data_url: 'https://api.example.com/employees',
          method: 'get',
          auth: { auth_type: 'basic', body_type: 'none', user: 'u', password: 'p' },
          pagination: {
            page_size: 25,
            date_format: 'DD-MM-YYYY',
            default_from_date: '2023-06-01',
          },
        },
      ],
    });

    expect(imported.api_sources[0].pagination).toEqual({
      is_enabled: true,
      page_size: '25',
      date_format: 'DD-MM-YYYY',
      default_from_date: '2023-06-01',
    });
  });
});

describe('api source request_body export and import', () => {
  it('exports request_body from filled key value rows', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      request_body_fields: [
        { key: 'page', value: '{{page_number}}' },
        { key: 'size', value: '{{page_size}}' },
      ],
    };

    const exported = buildGeneralAdaptorConfigExport(config);

    expect(exported.api_sources[0].request_body).toEqual({
      page: '{{page_number}}',
      size: '{{page_size}}',
    });
  });

  it('omits request_body when empty', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      request_body_fields: [{ key: '', value: '' }],
    };

    const exported = buildGeneralAdaptorConfigExport(config);
    expect(exported.api_sources[0].request_body).toBeUndefined();
  });

  it('imports request_body into form rows', () => {
    const imported = parseGeneralAdaptorConfigImport({
      api_sources: [
        {
          data_url: 'https://api.example.com/employees',
          method: 'post',
          auth: { auth_type: 'basic', body_type: 'none', user: 'u', password: 'p' },
          request_body: {
            from_date: '{{from_date}}',
            to_date: '{{to_date}}',
          },
        },
      ],
    });

    expect(imported.api_sources[0].request_body_fields).toEqual([
      { key: 'from_date', value: '{{from_date}}' },
      { key: 'to_date', value: '{{to_date}}' },
    ]);
  });
});

describe('fetch_token_from_api and auth.token_api', () => {
  it('exports token api when fetch_token_from_api is enabled', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      method: 'get',
      fetch_token_from_api: true,
      auth: {
        ...createDefaultAuthConfig(),
        auth_type: 'bearer',
        token_api: {
          ...createDefaultTokenApiConfig(),
          data_url: 'https://api.example.com/oauth/token',
          method: 'post',
          token_path: 'access_token',
          auth: {
            ...createDefaultAuthConfig(),
            auth_type: 'basic',
            user: 'client_id',
            password: 'client_secret',
          },
          request_body_fields: [{ key: 'grant_type', value: 'client_credentials' }],
        },
      },
    };

    const exported = buildGeneralAdaptorConfigExport(config);
    const source = exported.api_sources[0];

    expect(source.fetch_token_from_api).toBe(true);
    expect(source.auth.token_api).toEqual({
      data_url: 'https://api.example.com/oauth/token',
      method: 'post',
      token_path: 'access_token',
      auth: {
        auth_type: 'basic',
        body_type: 'none',
        content_type: 'application/json',
        user: 'client_id',
        password: 'client_secret',
      },
      request_body: { grant_type: 'client_credentials' },
    });
  });

  it('omits token_api when fetch_token_from_api is false', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      fetch_token_from_api: false,
      auth: {
        ...createDefaultAuthConfig(),
        token_api: createDefaultTokenApiConfig(),
      },
    };

    const exported = buildGeneralAdaptorConfigExport(config);
    expect(exported.api_sources[0].fetch_token_from_api).toBeUndefined();
    expect(exported.api_sources[0].auth.token_api).toBeUndefined();
  });

  it('imports fetch_token_from_api and token_api into form state', () => {
    const imported = parseGeneralAdaptorConfigImport({
      api_sources: [
        {
          data_url: 'https://api.example.com/employees',
          method: 'get',
          fetch_token_from_api: true,
          auth: {
            auth_type: 'bearer',
            body_type: 'none',
            token_api: {
              data_url: 'https://api.example.com/token',
              method: 'post',
              token_path: 'data.token',
              auth: { auth_type: 'basic', body_type: 'none', user: 'u', password: 'p' },
              headers: { Accept: 'application/json' },
            },
          },
        },
      ],
    });

    expect(imported.api_sources[0].fetch_token_from_api).toBe(true);
    expect(imported.api_sources[0].auth.token_api.data_url).toBe(
      'https://api.example.com/token',
    );
    expect(imported.api_sources[0].auth.token_api.token_path).toBe('data.token');
    expect(imported.api_sources[0].auth.token_api.headers).toEqual([
      { key: 'Accept', value: 'application/json' },
    ]);
  });
});

describe('query_params and body_encoding', () => {
  it('exports query_params and body_encoding on api source', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      query_params_fields: [
        { key: 'page', value: '{{page_number}}' },
        { key: 'from', value: '{{from_date}}' },
      ],
      body_encoding: 'form-urlencoded',
    };

    const exported = buildGeneralAdaptorConfigExport(config);

    expect(exported.api_sources[0].query_params).toEqual({
      page: '{{page_number}}',
      from: '{{from_date}}',
    });
    expect(exported.api_sources[0].body_encoding).toBe('form-urlencoded');
  });

  it('omits json body_encoding and empty query_params', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      body_encoding: 'json',
      query_params_fields: [{ key: '', value: '' }],
    };

    const exported = buildGeneralAdaptorConfigExport(config);
    expect(exported.api_sources[0].body_encoding).toBeUndefined();
    expect(exported.api_sources[0].query_params).toBeUndefined();
  });

  it('exports body_encoding and query_params on token_api', () => {
    const config = createDefaultGeneralAdaptorConfigForm();
    config.api_sources[0] = {
      ...createDefaultApiSource(),
      data_url: 'https://api.example.com/employees',
      fetch_token_from_api: true,
      auth: {
        ...createDefaultAuthConfig(),
        auth_type: 'bearer',
        token_api: {
          ...createDefaultTokenApiConfig(),
          data_url: 'https://api.example.com/token',
          method: 'post',
          token_path: 'access_token',
          body_encoding: 'form-urlencoded',
          query_params_fields: [{ key: 'tenant', value: 'acme' }],
          auth: createDefaultAuthConfig(),
        },
      },
    };

    const exported = buildGeneralAdaptorConfigExport(config);
    const token_api = exported.api_sources[0].auth.token_api as Record<string, unknown>;

    expect(token_api.body_encoding).toBe('form-urlencoded');
    expect(token_api.query_params).toEqual({ tenant: 'acme' });
  });

  it('imports query_params and body_encoding', () => {
    const imported = parseGeneralAdaptorConfigImport({
      api_sources: [
        {
          data_url: 'https://api.example.com/employees',
          method: 'get',
          body_encoding: 'urlencoded',
          query_params: { page: '{{page_number}}' },
          auth: { auth_type: 'bearer', body_type: 'none' },
        },
      ],
    });

    expect(imported.api_sources[0].body_encoding).toBe('form-urlencoded');
    expect(imported.api_sources[0].query_params_fields).toEqual([
      { key: 'page', value: '{{page_number}}' },
    ]);
  });
});
