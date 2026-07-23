import type { ApiSourceFormConfig } from '../types/hrmsConfig';
import { HTTP_METHODS } from '../constants/hrmsAuth';
import { KeyValueEditor } from './KeyValueEditor';
import { HrmsAuthEditor } from './HrmsAuthEditor';
import { CollapsibleSection } from './CollapsibleSection';
import { RequestTemplatePlaceholders } from './RequestTemplatePlaceholders';

type ApiSourceEditorProps = {
  source: ApiSourceFormConfig;
  source_index: number;
  onChange: (source: ApiSourceFormConfig) => void;
  onRemove: () => void;
};

export function ApiSourceEditor({
  source,
  source_index,
  onChange,
  onRemove,
}: ApiSourceEditorProps) {
  function updatePagination(field: keyof ApiSourceFormConfig['pagination'], value: string | boolean) {
    onChange({
      ...source,
      pagination: {
        ...source.pagination,
        [field]: value,
      },
    });
  }

  return (
    <CollapsibleSection
      title={`API Source ${source_index + 1}`}
      description="Each source is fetched and merged into one employee list."
      header_actions={
        <button type="button" className="button-danger button-compact" onClick={onRemove}>
          Remove Source
        </button>
      }
    >
      <div className="settings-grid">
        <label>
          Source Name
          <input
            type="text"
            value={source.name}
            placeholder="Employees API"
            onChange={(event) => onChange({ ...source, name: event.target.value })}
          />
        </label>

        <label>
          HTTP Method
          <select
            value={source.method}
            onChange={(event) =>
              onChange({
                ...source,
                method: event.target.value as ApiSourceFormConfig['method'],
              })
            }
          >
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method}>
                {method.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="full-width-field">
          Data URL
          <input
            type="text"
            value={source.data_url}
            placeholder="https://client-api.example.com/employees"
            onChange={(event) => onChange({ ...source, data_url: event.target.value })}
          />
        </label>

        <label className="full-width-field">
          Response List Path (optional)
          <input
            type="text"
            value={source.response_list_path}
            placeholder="data.response.data"
            onChange={(event) =>
              onChange({ ...source, response_list_path: event.target.value })
            }
          />
        </label>
      </div>

      <div className="panel-section">
        <h3>Pagination</h3>
        <p className="field-hint">
          If API Source 1 has pagination enabled, GeneralAdaptor uses paginated mode and only
          fetches the first source.
        </p>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={source.pagination.is_enabled}
            onChange={(event) => updatePagination('is_enabled', event.target.checked)}
          />
          Enable pagination
        </label>
        {source.pagination.is_enabled && (
          <div className="settings-grid">
            <label>
              Page Size
              <input
                type="number"
                min="1"
                value={source.pagination.page_size}
                onChange={(event) => updatePagination('page_size', event.target.value)}
              />
            </label>
            <label>
              Pagination Date Format
              <input
                type="text"
                value={source.pagination.date_format}
                placeholder="YYYY-MM-DD"
                onChange={(event) => updatePagination('date_format', event.target.value)}
              />
            </label>
            <label className="full-width-field">
              Default From Date (optional)
              <input
                type="text"
                value={source.pagination.default_from_date}
                placeholder="2024-01-01"
                onChange={(event) => updatePagination('default_from_date', event.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      <div className="panel-section">
        <h3>Extra Headers</h3>
        <RequestTemplatePlaceholders />
        <KeyValueEditor
          rows={source.headers}
          key_label="Header"
          value_label="Value"
          value_placeholder="{{page_number}} or static value"
          onChange={(headers) => onChange({ ...source, headers })}
        />
      </div>

      <div className="panel-section">
        <h3>Request Body Override</h3>
        <p className="field-hint">
          When set, this replaces the auth-derived body and supports RequestTemplate placeholders.
        </p>
        <RequestTemplatePlaceholders description="Click a placeholder chip to copy it into a request_body value." />
        <KeyValueEditor
          rows={source.request_body_fields}
          key_label="Body Key"
          value_label="Body Value"
          value_placeholder="{{from_date}}"
          onChange={(request_body_fields) => onChange({ ...source, request_body_fields })}
        />
      </div>

      <HrmsAuthEditor
        auth={source.auth}
        onChange={(auth) => onChange({ ...source, auth })}
      />
    </CollapsibleSection>
  );
}
