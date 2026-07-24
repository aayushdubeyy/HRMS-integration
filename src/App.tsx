import { useMemo, useState } from 'react';
import { AdaptorChooser } from './components/AdaptorChooser';
import { GeneralAdaptorForm } from './components/GeneralAdaptorForm';
import { GeneralAdaptorConfigForm } from './components/GeneralAdaptorConfigForm';
import { SftpAdaptorForm } from './components/SftpAdaptorForm';
import { SftpAdaptorConfigForm } from './components/SftpAdaptorConfigForm';
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
  buildSftpInfoExport,
  createDefaultSftpInfoConfig,
  parseSftpInfoImport,
} from './utils/sftpAdaptorConfig';
import {
  buildSftpConfigExport,
  createDefaultSftpConfigForm,
  parseSftpConfigImport,
} from './utils/sftpAdaptorConfigForm';
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
import type { AdaptorType, SftpConfigForm, SftpInfoConfig } from './types/sftpConfig';
import './App.css';

type AppTab = 'info' | 'config' | 'sql_insert';

function App() {
  const [adaptor_type, setAdaptorType] = useState<AdaptorType | null>(null);
  const [active_tab, setActiveTab] = useState<AppTab>('info');
  const [general_info_config, setGeneralInfoConfig] = useState<GeneralAdaptorInfoConfig>(
    createDefaultGeneralAdaptorConfig,
  );
  const [general_adaptor_config, setGeneralAdaptorConfig] = useState<GeneralAdaptorConfig>(
    createDefaultGeneralAdaptorConfigForm,
  );
  const [sftp_info_config, setSftpInfoConfig] = useState<SftpInfoConfig>(
    createDefaultSftpInfoConfig,
  );
  const [sftp_adaptor_config, setSftpAdaptorConfig] = useState<SftpConfigForm>(
    createDefaultSftpConfigForm,
  );
  const [sql_form, setSqlForm] = useState(createDefaultHrmsIntegrationSqlForm);

  const exported_info_json = useMemo(() => {
    if (adaptor_type === 'sftp') {
      return buildSftpInfoExport(sftp_info_config);
    }

    return buildGeneralAdaptorExport(general_info_config);
  }, [adaptor_type, general_info_config, sftp_info_config]);

  const exported_config_json = useMemo(() => {
    if (adaptor_type === 'sftp') {
      return buildSftpConfigExport(sftp_adaptor_config);
    }

    return buildGeneralAdaptorConfigExport(general_adaptor_config);
  }, [adaptor_type, general_adaptor_config, sftp_adaptor_config]);

  const exported_json =
    active_tab === 'info' ? exported_info_json : exported_config_json;

  const sql_validation = useMemo(() => validateHrmsIntegrationSqlForm(sql_form), [sql_form]);

  const generated_sql = useMemo(() => {
    if (hasHrmsIntegrationSqlValidationErrors(sql_validation)) {
      return '';
    }

    try {
      return buildHrmsIntegrationInsertSql(sql_form);
    } catch {
      return '';
    }
  }, [sql_form, sql_validation]);

  const preview_meta = useMemo(
    () => buildPreviewMeta(active_tab, adaptor_type),
    [active_tab, adaptor_type],
  );

  if (!adaptor_type) {
    return (
      <AdaptorChooser
        onSelect={(selected_adaptor_type) => {
          setAdaptorType(selected_adaptor_type);
          setActiveTab('info');
          setSqlForm((current_form) => ({
            ...current_form,
            hrms_type: selected_adaptor_type,
          }));
        }}
      />
    );
  }

  const selected_adaptor_type = adaptor_type;

  function loadInfoJsonIntoSqlForm() {
    setSqlForm((current_form) => ({
      ...current_form,
      hrms_type: selected_adaptor_type,
      info_json: JSON.stringify(exported_info_json, null, 2),
    }));
  }

  function loadConfigJsonIntoSqlForm() {
    setSqlForm((current_form) => ({
      ...current_form,
      hrms_type: selected_adaptor_type,
      config_json: JSON.stringify(exported_config_json, null, 2),
    }));
  }

  function importJson() {
    const raw_json = window.prompt(
      active_tab === 'config'
        ? 'Paste HRMS config JSON to import'
        : 'Paste HRMS info JSON to import',
    );
    if (!raw_json) {
      return;
    }

    try {
      const parsed_json = JSON.parse(raw_json);
      applyImportedJson(parsed_json);
    } catch {
      window.alert('Invalid JSON. Please check the pasted content and try again.');
    }
  }

  function applyImportedJson(parsed_json: Record<string, unknown>) {
    if (adaptor_type === 'sftp') {
      applySftpImport(parsed_json);
      return;
    }

    applyGeneralImport(parsed_json);
  }

  function applySftpImport(parsed_json: Record<string, unknown>) {
    if (active_tab === 'config') {
      setSftpAdaptorConfig(parseSftpConfigImport(parsed_json));
      return;
    }

    setSftpInfoConfig(parseSftpInfoImport(parsed_json));
  }

  function applyGeneralImport(parsed_json: Record<string, unknown>) {
    if (active_tab === 'config') {
      setGeneralAdaptorConfig(parseGeneralAdaptorConfigImport(parsed_json));
      return;
    }

    setGeneralInfoConfig({
      ...parseAdvancedSettingsFromImport(parsed_json),
      date_format: String(parsed_json.date_format ?? DEFAULT_DATE_FORMAT),
      conditional_field_transformations: parseConditionalTransformationsFromImport(
        parsed_json.conditional_field_transformations,
      ),
      mandatoryFields: parseStringArray(parsed_json.mandatoryFields),
      response_list_path: String(parsed_json.response_list_path ?? ''),
      date_fields_path_mapping: asStringRecord(parsed_json.date_fields_path_mapping),
      path_mapping: asStringRecord(parsed_json.path_mapping),
      mapping: asStringRecord(parsed_json.mapping),
      phone_fields_to_transform: parseStringArray(parsed_json.phone_fields_to_transform),
      field_type_overrides: deriveFieldTypeOverridesFromImport(
        asStringRecord(parsed_json.mapping),
        asStringRecord(parsed_json.path_mapping),
        asStringRecord(parsed_json.date_fields_path_mapping),
      ),
      composite_fields: parseCompositeFieldsImport(
        parsed_json.composite_fields,
        asStringRecord(parsed_json.mapping),
      ),
      mobile_sanitize_fields: parseMobileSanitizeFieldsImport(
        parsed_json.mobile_sanitize_fields,
        asStringRecord(parsed_json.mapping),
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
  }

  const header_copy = getAdaptorHeaderCopy(adaptor_type);

  function returnToAdaptorChooser() {
    setAdaptorType(null);
    setActiveTab('info');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <button
            type="button"
            className="back-to-chooser-link"
            onClick={returnToAdaptorChooser}
          >
            ← All Adaptors
          </button>
          <p className="eyebrow">Infeedo HRMS</p>
          <h1>{header_copy.title}</h1>
          <p className="subtitle">{header_copy.subtitle}</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={returnToAdaptorChooser}
          >
            Change Adaptor
          </button>
          {active_tab !== 'sql_insert' && (
            <button type="button" className="button-secondary" onClick={importJson}>
              Import JSON
            </button>
          )}
        </div>
      </header>

      <div className="tab-bar">
        <button
          type="button"
          className="tab-button tab-back-button"
          onClick={returnToAdaptorChooser}
        >
          ← Adaptors
        </button>
        <button
          type="button"
          className={`tab-button ${active_tab === 'info' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
        <button
          type="button"
          className={`tab-button ${active_tab === 'config' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('config')}
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
          {active_tab === 'info' && adaptor_type === 'general' && (
            <GeneralAdaptorForm config={general_info_config} onChange={setGeneralInfoConfig} />
          )}
          {active_tab === 'info' && adaptor_type === 'sftp' && (
            <SftpAdaptorForm config={sftp_info_config} onChange={setSftpInfoConfig} />
          )}
          {active_tab === 'config' && adaptor_type === 'general' && (
            <GeneralAdaptorConfigForm
              config={general_adaptor_config}
              onChange={setGeneralAdaptorConfig}
            />
          )}
          {active_tab === 'config' && adaptor_type === 'sftp' && (
            <SftpAdaptorConfigForm
              config={sftp_adaptor_config}
              onChange={setSftpAdaptorConfig}
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

function buildPreviewMeta(active_tab: AppTab, adaptor_type: AdaptorType | null) {
  if (active_tab === 'sql_insert') {
    return {
      title: 'Generated SQL',
      description: 'Copy and run this INSERT against hrms_integrations.',
      copy_button_label: 'Copy SQL',
    };
  }

  const adaptor_label = adaptor_type === 'sftp' ? 'SFTP Adaptor' : 'GeneralAdaptor';
  const column_label = active_tab === 'info' ? 'Info' : 'Config';

  return {
    title: `${adaptor_label} ${column_label} JSON`,
    description: `Copy this JSON into the HRMS integration ${column_label.toLowerCase()} column.`,
    copy_button_label: 'Copy JSON',
  };
}

function getAdaptorHeaderCopy(adaptor_type: AdaptorType) {
  if (adaptor_type === 'sftp') {
    return {
      title: 'SFTP Adaptor Builder',
      subtitle: 'Build SFTP info and config, then generate hrms_integrations SQL.',
    };
  }

  return {
    title: 'GeneralAdaptor Builder',
    subtitle: 'Build GeneralAdaptor info and config, then generate hrms_integrations SQL.',
  };
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry_value]) => [
      key,
      String(entry_value ?? ''),
    ]),
  );
}

export default App;
