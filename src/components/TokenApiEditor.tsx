import type { TokenApiFormConfig } from '../types/hrmsConfig';
import {
  BODY_ENCODING_LABELS,
  BODY_ENCODING_OPTIONS,
  HTTP_METHODS,
} from '../constants/hrmsAuth';
import { KeyValueEditor } from './KeyValueEditor';
import { HrmsAuthEditor } from './HrmsAuthEditor';
import { RequestTemplatePlaceholders } from './RequestTemplatePlaceholders';

type TokenApiEditorProps = {
  token_api: TokenApiFormConfig;
  onChange: (token_api: TokenApiFormConfig) => void;
};

export function TokenApiEditor({ token_api, onChange }: TokenApiEditorProps) {
  return (
    <div className="nested-card">
      <div className="panel-header">
        <h3>Token API</h3>
        <p>
          Fetched before the data request. The token at token_path is used as runtime Bearer auth
          for the main API call.
        </p>
      </div>

      <div className="settings-grid">
        <label className="full-width-field">
          Token API Data URL
          <input
            type="text"
            value={token_api.data_url}
            placeholder="https://client-api.example.com/oauth/token"
            onChange={(event) => onChange({ ...token_api, data_url: event.target.value })}
          />
        </label>

        <label>
          Method
          <select
            value={token_api.method}
            onChange={(event) =>
              onChange({
                ...token_api,
                method: event.target.value as TokenApiFormConfig['method'],
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

        <label>
          Token Path
          <input
            type="text"
            value={token_api.token_path}
            placeholder="access_token or data.token"
            onChange={(event) => onChange({ ...token_api, token_path: event.target.value })}
          />
        </label>

        <label>
          Body Encoding
          <select
            value={token_api.body_encoding}
            onChange={(event) =>
              onChange({
                ...token_api,
                body_encoding: event.target.value as TokenApiFormConfig['body_encoding'],
              })
            }
          >
            {BODY_ENCODING_OPTIONS.map((encoding) => (
              <option key={encoding} value={encoding}>
                {BODY_ENCODING_LABELS[encoding]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel-section">
        <h4>Token API Query Params</h4>
        <RequestTemplatePlaceholders />
        <KeyValueEditor
          rows={token_api.query_params_fields}
          key_label="Param"
          value_label="Value"
          value_placeholder="{{page_number}}"
          onChange={(query_params_fields) => onChange({ ...token_api, query_params_fields })}
        />
      </div>

      <div className="panel-section">
        <h4>Token API Headers</h4>
        <KeyValueEditor
          rows={token_api.headers}
          key_label="Header"
          value_label="Value"
          onChange={(headers) => onChange({ ...token_api, headers })}
        />
      </div>

      <div className="panel-section">
        <h4>Token API Request Body</h4>
        <KeyValueEditor
          rows={token_api.request_body_fields}
          key_label="Body Key"
          value_label="Body Value"
          onChange={(request_body_fields) => onChange({ ...token_api, request_body_fields })}
        />
      </div>

      <HrmsAuthEditor
        auth={token_api.auth}
        title="Token API Authentication"
        description="Credentials used only for the token endpoint call."
        onChange={(auth) => onChange({ ...token_api, auth })}
      />
    </div>
  );
}
