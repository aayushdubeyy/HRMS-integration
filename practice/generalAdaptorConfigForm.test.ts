import { describe, expect, it } from 'vitest';
import {
  buildGeneralAdaptorConfigExport,
  createDefaultApiSource,
  createDefaultGeneralAdaptorConfigForm,
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
