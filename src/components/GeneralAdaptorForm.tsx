import type { GeneralAdaptorInfoConfig } from '../types/hrmsConfig';
import { AMBER_KEYS } from '../constants/amberKeys';
import { DATE_FORMAT_OPTIONS, DEFAULT_DATE_FORMAT, isKnownDateFormat } from '../constants/dateFormats';
import {
  syncPathMappingsFromAmberMapping,
  updateAmberMappingValue,
  updateAmberFieldType,
  getAmberFieldType,
  getDefaultAmberFieldType,
} from '../utils/generalAdaptorConfig';
import { MandatoryFieldsSelector } from './MandatoryFieldsSelector';
import { ConditionalTransformationsEditor } from './ConditionalTransformationsEditor';
import { AdvancedInfoSettings } from './AdvancedInfoSettings';
import { CollapsibleSection } from './CollapsibleSection';

type GeneralAdaptorFormProps = {
  config: GeneralAdaptorInfoConfig;
  onChange: (config: GeneralAdaptorInfoConfig) => void;
};

export function GeneralAdaptorForm({ config, onChange }: GeneralAdaptorFormProps) {
  function updatePathMapping(pascal_key: string, api_path: string) {
    onChange({
      ...config,
      path_mapping: {
        ...config.path_mapping,
        [pascal_key]: api_path,
      },
    });
  }

  function updateDatePathMapping(pascal_key: string, api_path: string) {
    onChange({
      ...config,
      date_fields_path_mapping: {
        ...config.date_fields_path_mapping,
        [pascal_key]: api_path,
      },
    });
  }

  function togglePhoneField(amber_key: string) {
    const is_selected = config.phone_fields_to_transform.includes(amber_key);
    const phone_fields_to_transform = is_selected
      ? config.phone_fields_to_transform.filter((field) => field !== amber_key)
      : [...config.phone_fields_to_transform, amber_key];

    onChange({ ...config, phone_fields_to_transform });
  }

  const active_mappings = Object.entries(config.mapping).filter(([, pascal_key]) => pascal_key);
  const active_string_mappings = active_mappings.filter(([amber_key]) => {
    return getAmberFieldType(amber_key, config.field_type_overrides) === 'string';
  });
  const active_date_mappings = active_mappings.filter(([amber_key]) => {
    return getAmberFieldType(amber_key, config.field_type_overrides) === 'date';
  });

  return (
    <div className="form-stack">
      <CollapsibleSection title="General Settings">
        <div className="settings-grid">
          <label>
            Date Format
            <select
              value={isKnownDateFormat(config.date_format) ? config.date_format : DEFAULT_DATE_FORMAT}
              onChange={(event) => onChange({ ...config, date_format: event.target.value })}
            >
              {DATE_FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Response List Path (Optional)
            <input
              type="text"
              value={config.response_list_path}
              placeholder="data.response.data"
              onChange={(event) =>
                onChange({ ...config, response_list_path: event.target.value })
              }
            />
          </label>
        </div>
        <p className="field-hint">
          Leave response list path empty to use the path on each API source, or when the API
          response is already an array.
        </p>
      </CollapsibleSection>

      <MandatoryFieldsSelector
        selected_fields={config.mandatoryFields}
        onChange={(mandatoryFields) => onChange({ ...config, mandatoryFields })}
      />

      <CollapsibleSection
        title="Amber to Path Key Mapping"
        description="Map amber keys to path_mapping keys. Change field type to route a mapping to date or string path mapping."
        header_actions={
          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              onChange(
                syncPathMappingsFromAmberMapping({
                  ...config,
                  mapping: Object.fromEntries(
                    AMBER_KEYS.map((definition) => [
                      definition.key,
                      definition.pascal_case,
                    ]),
                  ),
                }),
              )
            }
          >
            Apply Default Path Keys
          </button>
        }
      >
        <div className="mapping-table">
          <div className="mapping-table-header mapping-row four-column">
            <span>Amber Key</span>
            <span>Path Key (PascalCase)</span>
            <span>Type</span>
            <span />
          </div>

          {AMBER_KEYS.map((definition) => {
            const pascal_key = config.mapping[definition.key] ?? '';
            const field_type = getAmberFieldType(definition.key, config.field_type_overrides);
            const default_field_type = getDefaultAmberFieldType(definition.key);
            const is_overridden = field_type !== default_field_type;

            return (
              <div key={definition.key} className="mapping-row four-column">
                <span className="amber-key-label">{definition.key}</span>
                <input
                  type="text"
                  value={pascal_key}
                  placeholder={definition.pascal_case}
                  onChange={(event) =>
                    onChange(
                      updateAmberMappingValue(config, definition.key, event.target.value),
                    )
                  }
                />
                <label className="field-type-select">
                  <span className="sr-only">Field type for {definition.key}</span>
                  <select
                    value={field_type}
                    onChange={(event) =>
                      onChange(
                        updateAmberFieldType(
                          config,
                          definition.key,
                          event.target.value as 'date' | 'string',
                        ),
                      )
                    }
                  >
                    <option value="string">String</option>
                    <option value="date">Date</option>
                  </select>
                  {is_overridden && <span className="field-type-override">overridden</span>}
                </label>
                <button
                  type="button"
                  className="button-secondary button-compact"
                  onClick={() =>
                    onChange(
                      updateAmberMappingValue(config, definition.key, definition.pascal_case),
                    )
                  }
                >
                  Apply
                </button>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Path Mapping (API Field Names)"
        description="Fill client API field paths for each active path key from the mapping above."
      >
        {active_string_mappings.length === 0 && (
          <p className="empty-state">Enable at least one string mapping to configure paths.</p>
        )}

        <div className="mapping-table">
          {active_string_mappings.length > 0 && (
            <div className="mapping-table-header">
              <span>Path Key</span>
              <span>Client API Field Path</span>
            </div>
          )}

          {active_string_mappings.map(([amber_key, pascal_key]) => (
            <div key={pascal_key} className="mapping-row">
              <span className="amber-key-label">{pascal_key}</span>
              <input
                type="text"
                value={config.path_mapping[pascal_key] ?? ''}
                placeholder={`API path for ${amber_key}`}
                onChange={(event) => updatePathMapping(pascal_key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Date Fields Path Mapping"
        description="Configure API field paths for date-type or date-overridden amber mappings."
      >
        {active_date_mappings.length === 0 && (
          <p className="empty-state">Enable at least one date mapping to configure date paths.</p>
        )}

        <div className="mapping-table">
          {active_date_mappings.length > 0 && (
            <div className="mapping-table-header">
              <span>Date Path Key</span>
              <span>Client API Field Path</span>
            </div>
          )}

          {active_date_mappings.map(([amber_key, pascal_key]) => (
            <div key={pascal_key} className="mapping-row">
              <span className="amber-key-label">{pascal_key}</span>
              <input
                type="text"
                value={config.date_fields_path_mapping[pascal_key] ?? ''}
                placeholder={`Date API path for ${amber_key}`}
                onChange={(event) => updateDatePathMapping(pascal_key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Phone Fields To Transform"
        description="Select amber phone fields that should be normalized during sync."
      >
        <div className="chip-grid">
          {AMBER_KEYS.filter((definition) =>
            ['phone', 'office_phone'].includes(definition.key),
          ).map((definition) => {
            const is_selected = config.phone_fields_to_transform.includes(definition.key);

            return (
              <button
                key={definition.key}
                type="button"
                className={`chip ${is_selected ? 'chip-selected' : ''}`}
                onClick={() => togglePhoneField(definition.key)}
              >
                {definition.key}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      <ConditionalTransformationsEditor
        transformations={config.conditional_field_transformations}
        onChange={(conditional_field_transformations) =>
          onChange({ ...config, conditional_field_transformations })
        }
      />

      <AdvancedInfoSettings
        settings={config}
        onChange={(settings) => onChange({ ...config, ...settings })}
      />
    </div>
  );
}
