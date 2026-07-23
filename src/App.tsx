import { useMemo, useState } from 'react';
import { GeneralAdaptorForm } from './components/GeneralAdaptorForm';
import { GeneralAdaptorConfigForm } from './components/GeneralAdaptorConfigForm';
import { HrmsIntegrationSqlForm } from './components/HrmsIntegrationSqlForm';
import { JsonPreview } from './components/JsonPreview';
import { SqlPreview } from './components/SqlPreview';
import {
  buildGeneralAdaptorExport,
  createDefaultGeneralAdaptorConfig,
  deriveFieldTypeOverridesFromImport,
} from './utils/generalAdaptorConfig';
import {
  buildGeneralAdaptorConfigExport,
  createDefaultGeneralAdaptorConfigForm,
  parseGeneralAdaptorConfigImport,
} from './utils/generalAdaptorConfigForm';
import {
  buildHrmsIntegrationInsertSql,
  createDefaultHrmsIntegrationSqlForm,
  hasHrmsIntegrationSqlValidationErrors,
  validateHrmsIntegrationSqlForm,
} from './utils/hrmsIntegrationSql';
import { parseAdvancedSettingsFromImport } from './utils/advancedSettings';
import { parseConditionalTransformationsFromImport } from './utils/conditionalFieldTransformations';
import {
  parseCompositeFieldsImport,
  parseEmployeeRestrictionImport,
  parseExcludeEmployeeCodes,
  parseMobileSanitizeFieldsImport,
  parseStringArray,
} from './utils/infoFieldExtensions';
import { DEFAULT_DATE_FORMAT } from './constants/dateFormats';
import type { GeneralAdaptorConfig, GeneralAdaptorInfoConfig } from './types/hrmsConfig';
import './App.css';

type AppTab = 'general_info' | 'general_config' | 'sql_insert';

function App() {
  const [active_tab, setActiveTab] = useState<AppTab>('general_info');
  const [general_info_config, setGeneralInfoConfig] = useState<GeneralAdaptorInfoConfig>(
    createDefaultGeneralAdaptorConfig(),
  );
  const [general_adaptor_config, setGeneralAdaptorConfig] = useState<GeneralAdaptorConfig>(
    createDefaultGeneralAdaptorConfigForm(),
  );
  const [sql_form, setSqlForm] = useState(createDefaultHrmsIntegrationSqlForm);

  const exported_info_json = useMemo(
    () => buildGeneralAdaptorExport(general_info_config),
    [general_info_config],
  );

  const exported_config_json = useMemo(
    () => buildGeneralAdaptorConfigExport(general_adaptor_config),
    [general_adaptor_config],
  );

  const exported_json =
    active_tab === 'general_info' ? exported_info_json : exported_config_json;

  const sql_validation = useMemo(() => validateHrmsIntegrationSqlForm(sql_form), [sql_form]);

  const generated_sql = useMemo(() => {
    if (hasHrmsIntegrationSqlValidationErrors(sql_validation)) return '';

    try {
      return buildHrmsIntegrationInsertSql(sql_form);
    } catch {
      return '';
    }
  }, [sql_form, sql_validation]);

  const preview_meta = useMemo(() => {
    if (active_tab === 'general_info') {
      return {
        title: 'GeneralAdaptor Info JSON',
        description: 'Copy this JSON into the HRMS integration info column.',
        copy_button_label: 'Copy JSON',
      };
    }

    if (active_tab === 'general_config') {
      return {
        title: 'GeneralAdaptor Config JSON',
        description: 'Copy this JSON into the HRMS integration config column.',
        copy_button_label: 'Copy JSON',
      };
    }

    return {
      title: 'Generated SQL',
      description: 'Copy and run this INSERT against hrms_integrations.',
      copy_button_label: 'Copy SQL',
    };
  }, [active_tab]);

  function loadInfoJsonIntoSqlForm() {
    setSqlForm((current_form) => ({
      ...current_form,
      info_json: JSON.stringify(exported_info_json, null, 2),
    }));
  }

  function loadConfigJsonIntoSqlForm() {
    setSqlForm((current_form) => ({
      ...current_form,
      config_json: JSON.stringify(exported_config_json, null, 2),
    }));
  }

  function importJson() {
    const raw_json = window.prompt(
      active_tab === 'general_config'
        ? 'Paste HRMS config JSON to import'
        : 'Paste HRMS info JSON to import',
    );
    if (!raw_json) return;

    try {
      const parsed_json = JSON.parse(raw_json);

      if (active_tab === 'general_config') {
        setGeneralAdaptorConfig(parseGeneralAdaptorConfigImport(parsed_json));
        return;
      }

      setGeneralInfoConfig({
        ...parseAdvancedSettingsFromImport(parsed_json),
        date_format: parsed_json.date_format ?? DEFAULT_DATE_FORMAT,
        conditional_field_transformations: parseConditionalTransformationsFromImport(
          parsed_json.conditional_field_transformations,
        ),
        mandatoryFields: parsed_json.mandatoryFields ?? [],
        response_list_path: parsed_json.response_list_path ?? '',
        date_fields_path_mapping: parsed_json.date_fields_path_mapping ?? {},
        path_mapping: parsed_json.path_mapping ?? {},
        mapping: parsed_json.mapping ?? {},
        phone_fields_to_transform: parsed_json.phone_fields_to_transform ?? [],
        field_type_overrides: deriveFieldTypeOverridesFromImport(
          (parsed_json.mapping as Record<string, string>) ?? {},
          (parsed_json.path_mapping as Record<string, string>) ?? {},
          (parsed_json.date_fields_path_mapping as Record<string, string>) ?? {},
        ),
        composite_fields: parseCompositeFieldsImport(
          parsed_json.composite_fields,
          (parsed_json.mapping as Record<string, string>) ?? {},
        ),
        mobile_sanitize_fields: parseMobileSanitizeFieldsImport(
          parsed_json.mobile_sanitize_fields,
          (parsed_json.mapping as Record<string, string>) ?? {},
        ),
        employee_restriction_config: parseEmployeeRestrictionImport(
          parsed_json.employee_restriction_config,
        ),
        customMandatoryFields: parseStringArray(parsed_json.customMandatoryFields),
        exclude_employee_codes: parseExcludeEmployeeCodes(parsed_json.exclude_employee_codes),
        dont_insert_inactive_employees: parsed_json.dont_insert_inactive_employees === true,
        leaving_date_format: String(parsed_json.leaving_date_format ?? ''),
        modify_full_name: parsed_json.modify_full_name !== false,
      });
    } catch {
      window.alert('Invalid JSON. Please check the pasted content and try again.');
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Infeedo HRMS</p>
          <h1>GeneralAdaptor Builder</h1>
          <p className="subtitle">
            Build GeneralAdaptor info and config, then generate hrms_integrations SQL.
          </p>
        </div>

        {active_tab !== 'sql_insert' && (
          <div className="header-actions">
            <button type="button" className="button-secondary" onClick={importJson}>
              Import JSON
            </button>
          </div>
        )}
      </header>

      <div className="tab-bar">
        <button
          type="button"
          className={`tab-button ${active_tab === 'general_info' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('general_info')}
        >
          Info
        </button>
        <button
          type="button"
          className={`tab-button ${active_tab === 'general_config' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('general_config')}
        >
          Config
        </button>
        <button
          type="button"
          className={`tab-button ${active_tab === 'sql_insert' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('sql_insert')}
        >
          SQL Insert
        </button>
      </div>

      <div className="layout-grid">
        <div className="form-column">
          {active_tab === 'general_info' && (
            <GeneralAdaptorForm config={general_info_config} onChange={setGeneralInfoConfig} />
          )}
          {active_tab === 'general_config' && (
            <GeneralAdaptorConfigForm
              config={general_adaptor_config}
              onChange={setGeneralAdaptorConfig}
            />
          )}
          {active_tab === 'sql_insert' && (
            <HrmsIntegrationSqlForm
              form={sql_form}
              onChange={setSqlForm}
              onLoadInfoJson={loadInfoJsonIntoSqlForm}
              onLoadConfigJson={loadConfigJsonIntoSqlForm}
            />
          )}
        </div>

        <div className="preview-column">
          {active_tab === 'sql_insert' ? (
            <SqlPreview
              title={preview_meta.title}
              description={preview_meta.description}
              sql_text={generated_sql}
              error_message={
                hasHrmsIntegrationSqlValidationErrors(sql_validation)
                  ? 'Fix validation errors in the form to generate SQL.'
                  : ''
              }
            />
          ) : (
            <JsonPreview
              title={preview_meta.title}
              description={preview_meta.description}
              value={exported_json}
              copy_button_label={preview_meta.copy_button_label}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
