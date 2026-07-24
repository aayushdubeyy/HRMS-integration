import type { SftpInfoConfig } from '../types/sftpConfig';
import { AMBER_KEYS } from '../constants/amberKeys';
import { updateSftpMappingValue } from '../utils/sftpAdaptorConfig';
import { MandatoryFieldsSelector } from './MandatoryFieldsSelector';
import { ConditionalTransformationsEditor } from './ConditionalTransformationsEditor';
import { EmployeeRestrictionEditor } from './EmployeeRestrictionEditor';
import { SyncBehaviorSettings } from './SyncBehaviorSettings';
import { AdvancedInfoSettings } from './AdvancedInfoSettings';
import { CollapsibleSection } from './CollapsibleSection';

type SftpAdaptorFormProps = {
  config: SftpInfoConfig;
  onChange: (config: SftpInfoConfig) => void;
};

export function SftpAdaptorForm({ config, onChange }: SftpAdaptorFormProps) {
  function togglePhoneField(amber_key: string) {
    const is_selected = config.phone_fields_to_transform.includes(amber_key);
    const phone_fields_to_transform = is_selected
      ? config.phone_fields_to_transform.filter((field) => field !== amber_key)
      : [...config.phone_fields_to_transform, amber_key];

    onChange({ ...config, phone_fields_to_transform });
  }

  return (
    <div className="form-stack">
      <CollapsibleSection
        title="SFTP File Options"
        description="Flags used by FileAdaptor when reading files from SFTP."
      >
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.fetch_latest_file_only}
            onChange={(event) =>
              onChange({ ...config, fetch_latest_file_only: event.target.checked })
            }
          />
          Fetch latest file only
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.skip_custom_logic}
            onChange={(event) =>
              onChange({ ...config, skip_custom_logic: event.target.checked })
            }
          />
          Skip custom logic
        </label>
      </CollapsibleSection>

      <MandatoryFieldsSelector
        selected_fields={config.mandatoryFields}
        onChange={(mandatoryFields) => onChange({ ...config, mandatoryFields })}
      />

      <CollapsibleSection
        title="File Column Mapping"
        description="Map each amber field to the exact column header in the SFTP file. Empty headers are omitted from export."
      >
        <div className="mapping-table">
          <div className="mapping-table-header mapping-row">
            <span>Amber Field</span>
            <span>File Column Header</span>
          </div>

          {AMBER_KEYS.map((definition) => (
            <div key={definition.key} className="mapping-row">
              <span className="amber-key-label">{definition.key}</span>
              <input
                type="text"
                value={config.mapping[definition.key] ?? ''}
                placeholder={`Header for ${definition.key}`}
                onChange={(event) =>
                  onChange(updateSftpMappingValue(config, definition.key, event.target.value))
                }
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

      <EmployeeRestrictionEditor
        employee_restriction_config={config.employee_restriction_config}
        onChange={(employee_restriction_config) =>
          onChange({ ...config, employee_restriction_config })
        }
      />

      <SyncBehaviorSettings
        customMandatoryFields={config.customMandatoryFields}
        exclude_employee_codes={config.exclude_employee_codes}
        dont_insert_inactive_employees={config.dont_insert_inactive_employees}
        leaving_date_format={config.leaving_date_format}
        modify_full_name={config.modify_full_name}
        onCustomMandatoryFieldsChange={(customMandatoryFields) =>
          onChange({ ...config, customMandatoryFields })
        }
        onExcludeEmployeeCodesChange={(exclude_employee_codes) =>
          onChange({ ...config, exclude_employee_codes })
        }
        onDontInsertInactiveChange={(dont_insert_inactive_employees) =>
          onChange({ ...config, dont_insert_inactive_employees })
        }
        onLeavingDateFormatChange={(leaving_date_format) =>
          onChange({ ...config, leaving_date_format })
        }
        onModifyFullNameChange={(modify_full_name) =>
          onChange({ ...config, modify_full_name })
        }
      />

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
