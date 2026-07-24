import type { HrmsIntegrationSqlForm } from '../types/hrmsIntegrationSql';
import {
  hasHrmsIntegrationSqlValidationErrors,
  prettifyJsonText,
  validateHrmsIntegrationSqlForm,
} from '../utils/hrmsIntegrationSql';
import { CollapsibleSection } from './CollapsibleSection';

type HrmsIntegrationSqlFormProps = {
  form: HrmsIntegrationSqlForm;
  onChange: (form: HrmsIntegrationSqlForm) => void;
  onLoadConfigJson: () => void;
  onLoadInfoJson: () => void;
};

function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return <span className="validation-error">{message}</span>;
}

export function HrmsIntegrationSqlForm({
  form,
  onChange,
  onLoadConfigJson,
  onLoadInfoJson,
}: HrmsIntegrationSqlFormProps) {
  const validation = validateHrmsIntegrationSqlForm(form);

  function updateField<K extends keyof HrmsIntegrationSqlForm>(
    field: K,
    value: HrmsIntegrationSqlForm[K],
  ) {
    onChange({ ...form, [field]: value });
  }

  function prettifyJsonField(field: 'config_json' | 'info_json') {
    try {
      updateField(field, prettifyJsonText(form[field]));
    } catch {
      window.alert(`Invalid ${field === 'config_json' ? 'config' : 'info'} JSON`);
    }
  }

  return (
    <div className="form-stack">
      <CollapsibleSection
        title="Integration Metadata"
        description="Fields required for the hrms_integrations insert statement."
      >
        <div className="settings-grid">
          <label>
            Client ID
            <input
              type="number"
              value={form.client_id}
              placeholder="40165"
              onChange={(event) => updateField('client_id', event.target.value)}
            />
            <FieldError message={validation.client_id_error} />
          </label>

          <label>
            HRMS Type
            <select
              value={form.hrms_type}
              onChange={(event) => updateField('hrms_type', event.target.value)}
            >
              <option value="general">general</option>
              <option value="sftp">sftp</option>
            </select>
          </label>

          <label>
            Execution At
            <input
              type="text"
              value={form.execution_at}
              placeholder="11:00:00"
              onChange={(event) => updateField('execution_at', event.target.value)}
            />
            <FieldError message={validation.execution_at_error} />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="HRMS Config"
        description="Name and type are combined into the hrms_config JSON column."
      >
        <div className="settings-grid">
          <label>
            HRMS Config Name
            <input
              type="text"
              value={form.hrms_config_name}
              placeholder="Internal API"
              onChange={(event) => updateField('hrms_config_name', event.target.value)}
            />
            <FieldError message={validation.hrms_config_name_error} />
          </label>

          <label>
            HRMS Config Type
            <input
              type="text"
              value={form.hrms_config_type}
              placeholder="API Pull"
              onChange={(event) => updateField('hrms_config_type', event.target.value)}
            />
            <FieldError message={validation.hrms_config_type_error} />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Config JSON"
        description="Paste the config column JSON directly."
        header_actions={
          <div className="inline-actions">
            <button type="button" className="button-secondary button-compact" onClick={onLoadConfigJson}>
              Load From Config Tab
            </button>
            <button
              type="button"
              className="button-secondary button-compact"
              onClick={() => prettifyJsonField('config_json')}
            >
              Prettify
            </button>
          </div>
        }
      >
        <textarea
          className="json-textarea"
          value={form.config_json}
          placeholder='{"api_sources":[...]}'
          onChange={(event) => updateField('config_json', event.target.value)}
        />
        <FieldError message={validation.config_json_error} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Info JSON"
        description="Paste the info column JSON directly."
        header_actions={
          <div className="inline-actions">
            <button type="button" className="button-secondary button-compact" onClick={onLoadInfoJson}>
              Load From Info Tab
            </button>
            <button
              type="button"
              className="button-secondary button-compact"
              onClick={() => prettifyJsonField('info_json')}
            >
              Prettify
            </button>
          </div>
        }
      >
        <textarea
          className="json-textarea"
          value={form.info_json}
          placeholder='{"mapping":{...},"path_mapping":{...}}'
          onChange={(event) => updateField('info_json', event.target.value)}
        />
        <FieldError message={validation.info_json_error} />
      </CollapsibleSection>

      {hasHrmsIntegrationSqlValidationErrors(validation) && (
        <p className="validation-error panel-error">
          Fix the highlighted fields to generate a valid INSERT statement.
        </p>
      )}
    </div>
  );
}
