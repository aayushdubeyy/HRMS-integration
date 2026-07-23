import type { GeneralAdaptorInfoConfig } from '../types/hrmsConfig';
import { AMBER_KEYS } from '../constants/amberKeys';
import { DATE_FORMAT_OPTIONS, DEFAULT_DATE_FORMAT, isKnownDateFormat } from '../constants/dateFormats';
import {
  updateAmberApiPath,
  updateAmberFieldType,
  getAmberApiPath,
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
  function togglePhoneField(amber_key: string) {
    const is_selected = config.phone_fields_to_transform.includes(amber_key);
    const phone_fields_to_transform = is_selected
      ? config.phone_fields_to_transform.filter((field) => field !== amber_key)
      : [...config.phone_fields_to_transform, amber_key];

    onChange({ ...config, phone_fields_to_transform });
  }

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
        title="Final Mapping"
        description="Fill the client API path for each amber field. Mapping and path_mapping are created automatically in the export JSON."
      >
        <div className="mapping-table">
          <div className="mapping-table-header mapping-row three-column">
            <span>Amber Field</span>
            <span>Client API Field Path</span>
            <span>Type</span>
          </div>

          {AMBER_KEYS.map((definition) => {
            const field_type = getAmberFieldType(definition.key, config.field_type_overrides);
            const default_field_type = getDefaultAmberFieldType(definition.key);
            const is_overridden = field_type !== default_field_type;

            return (
              <div key={definition.key} className="mapping-row three-column">
                <span className="amber-key-label">{definition.key}</span>
                <input
                  type="text"
                  value={getAmberApiPath(config, definition.key)}
                  placeholder={`API path for ${definition.key}`}
                  onChange={(event) =>
                    onChange(updateAmberApiPath(config, definition.key, event.target.value))
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
              </div>
            );
          })}
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
