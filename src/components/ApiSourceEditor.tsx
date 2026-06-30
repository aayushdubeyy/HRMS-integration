import type { ApiSourceFormConfig } from '../types/hrmsConfig';
import { HTTP_METHODS } from '../constants/hrmsAuth';
import { KeyValueEditor } from './KeyValueEditor';
import { HrmsAuthEditor } from './HrmsAuthEditor';
import { CollapsibleSection } from './CollapsibleSection';

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
        <h3>Extra Headers</h3>
        <KeyValueEditor
          rows={source.headers}
          key_label="Header"
          value_label="Value"
          onChange={(headers) => onChange({ ...source, headers })}
        />
      </div>

      <HrmsAuthEditor
        auth={source.auth}
        onChange={(auth) => onChange({ ...source, auth })}
      />
    </CollapsibleSection>
  );
}
