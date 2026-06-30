import type { HrmsAuthFormConfig } from '../types/hrmsConfig';
import {
  AUTH_TYPE_LABELS,
  AUTH_TYPES,
  BODY_TYPE_LABELS,
  BODY_TYPES,
  DEFAULT_API_KEY_HEADER,
} from '../constants/hrmsAuth';
import { SecretFieldInput } from './SecretFieldInput';

type HrmsAuthEditorProps = {
  auth: HrmsAuthFormConfig;
  onChange: (auth: HrmsAuthFormConfig) => void;
};

export function HrmsAuthEditor({ auth, onChange }: HrmsAuthEditorProps) {
  function updateAuthField<K extends keyof HrmsAuthFormConfig>(
    field: K,
    value: HrmsAuthFormConfig[K],
  ) {
    onChange({ ...auth, [field]: value });
  }

  return (
    <div className="nested-card">
      <div className="panel-header">
        <h3>Authentication</h3>
        <p>Matches HrmsAuth in chatbot-api. Secret values are decrypted at runtime via decryptSecretVal.</p>
      </div>

      <div className="settings-grid">
        <label>
          Auth Type
          <select
            value={auth.auth_type}
            onChange={(event) =>
              updateAuthField(
                'auth_type',
                event.target.value as HrmsAuthFormConfig['auth_type'],
              )
            }
          >
            {AUTH_TYPES.map((auth_type) => (
              <option key={auth_type} value={auth_type}>
                {AUTH_TYPE_LABELS[auth_type]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Content Type
          <input
            type="text"
            value={auth.content_type}
            placeholder="application/json"
            onChange={(event) => updateAuthField('content_type', event.target.value)}
          />
        </label>

        <label>
          Body Type
          <select
            value={auth.body_type}
            onChange={(event) =>
              updateAuthField('body_type', event.target.value as HrmsAuthFormConfig['body_type'])
            }
          >
            {BODY_TYPES.map((body_type) => (
              <option key={body_type} value={body_type}>
                {BODY_TYPE_LABELS[body_type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {auth.auth_type === 'basic' && (
        <div className="settings-grid">
          <label>
            User
            <input
              type="text"
              value={auth.user}
              onChange={(event) => updateAuthField('user', event.target.value)}
            />
          </label>

          <SecretFieldInput
            label="Password"
            value={auth.password}
            is_already_encrypted={auth.password_is_already_encrypted}
            placeholder="API password"
            onChange={(password, password_is_already_encrypted) =>
              onChange({ ...auth, password, password_is_already_encrypted })
            }
          />
        </div>
      )}

      {auth.auth_type === 'bearer' && (
        <div className="settings-grid">
          <SecretFieldInput
            label="Bearer Token"
            value={auth.bearer_token}
            is_already_encrypted={auth.bearer_token_is_already_encrypted}
            placeholder="bearer_token"
            onChange={(bearer_token, bearer_token_is_already_encrypted) =>
              onChange({ ...auth, bearer_token, bearer_token_is_already_encrypted })
            }
          />

          <SecretFieldInput
            label="Token (alternative key)"
            value={auth.token}
            is_already_encrypted={auth.token_is_already_encrypted}
            placeholder="token"
            onChange={(token, token_is_already_encrypted) =>
              onChange({ ...auth, token, token_is_already_encrypted })
            }
          />
        </div>
      )}

      {auth.auth_type === 'api_key' && (
        <div className="settings-grid">
          <SecretFieldInput
            label="API Key"
            value={auth.api_key}
            is_already_encrypted={auth.api_key_is_already_encrypted}
            placeholder="api_key"
            onChange={(api_key, api_key_is_already_encrypted) =>
              onChange({ ...auth, api_key, api_key_is_already_encrypted })
            }
          />

          <label>
            API Key Header
            <input
              type="text"
              value={auth.api_key_header}
              placeholder={DEFAULT_API_KEY_HEADER}
              onChange={(event) => updateAuthField('api_key_header', event.target.value)}
            />
          </label>
        </div>
      )}

      {(auth.body_type === 'json' || auth.body_type === 'form') && (
        <div className="panel-section">
          <h4>Auth Body Fields</h4>
          <p>All body values are passed through decryptSecretVal before the API call.</p>

          <div className="mapping-table compact-table">
            <div className="mapping-table-header with-actions">
              <span>Body Key</span>
              <span>Body Value (secret)</span>
              <span />
            </div>

            {auth.body_fields.map((field, index) => (
              <div key={`body-field-${index}`} className="mapping-row with-actions">
                <input
                  type="text"
                  value={field.key}
                  placeholder="client_id"
                  onChange={(event) => {
                    const body_fields = auth.body_fields.map((body_field, field_index) =>
                      field_index === index
                        ? { ...body_field, key: event.target.value }
                        : body_field,
                    );
                    onChange({ ...auth, body_fields });
                  }}
                />
                <input
                  type="password"
                  value={field.value}
                  placeholder="secret value"
                  onChange={(event) => {
                    const next_value = event.target.value;
                    const body_fields = auth.body_fields.map((body_field, field_index) =>
                      field_index === index
                        ? {
                            ...body_field,
                            value: next_value,
                            is_already_encrypted: false,
                          }
                        : body_field,
                    );
                    onChange({ ...auth, body_fields });
                  }}
                />
                <button
                  type="button"
                  className="button-danger button-compact"
                  onClick={() => {
                    const body_fields = auth.body_fields.filter((_, field_index) => field_index !== index);
                    onChange({
                      ...auth,
                      body_fields:
                        body_fields.length > 0
                          ? body_fields
                          : [{ key: '', value: '', is_already_encrypted: false }],
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="button-secondary button-compact panel-action"
            onClick={() =>
              onChange({
                ...auth,
                body_fields: [
                  ...auth.body_fields,
                  { key: '', value: '', is_already_encrypted: false },
                ],
              })
            }
          >
            Add Body Field
          </button>
        </div>
      )}

      {auth.body_type === 'xml' && (
        <SecretFieldInput
          label="XML Body"
          value={auth.body_xml}
          is_already_encrypted={auth.body_xml_is_already_encrypted}
          placeholder="<Request>...</Request>"
          onChange={(body_xml, body_xml_is_already_encrypted) =>
            onChange({ ...auth, body_xml, body_xml_is_already_encrypted })
          }
        />
      )}
    </div>
  );
}
