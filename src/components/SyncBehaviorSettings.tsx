import { AMBER_KEYS } from '../constants/amberKeys';
import { CollapsibleSection } from './CollapsibleSection';

type SyncBehaviorSettingsProps = {
  customMandatoryFields: string[];
  exclude_employee_codes: string[];
  dont_insert_inactive_employees: boolean;
  leaving_date_format: string;
  modify_full_name: boolean;
  onCustomMandatoryFieldsChange: (customMandatoryFields: string[]) => void;
  onExcludeEmployeeCodesChange: (exclude_employee_codes: string[]) => void;
  onDontInsertInactiveChange: (dont_insert_inactive_employees: boolean) => void;
  onLeavingDateFormatChange: (leaving_date_format: string) => void;
  onModifyFullNameChange: (modify_full_name: boolean) => void;
};

export function SyncBehaviorSettings({
  customMandatoryFields,
  exclude_employee_codes,
  dont_insert_inactive_employees,
  leaving_date_format,
  modify_full_name,
  onCustomMandatoryFieldsChange,
  onExcludeEmployeeCodesChange,
  onDontInsertInactiveChange,
  onLeavingDateFormatChange,
  onModifyFullNameChange,
}: SyncBehaviorSettingsProps) {
  function toggleCustomMandatory(amber_key: string) {
    if (customMandatoryFields.includes(amber_key)) {
      onCustomMandatoryFieldsChange(
        customMandatoryFields.filter((field) => field !== amber_key),
      );
      return;
    }

    onCustomMandatoryFieldsChange([...customMandatoryFields, amber_key]);
  }

  return (
    <CollapsibleSection
      title="Sync Behavior"
      description="Controller-side validation and inactive employee handling."
    >
      <div className="panel-section">
        <h3>Custom Mandatory Fields</h3>
        <p className="field-hint">Field must exist on the employee object (empty values allowed).</p>
        <div className="chip-grid">
          {AMBER_KEYS.map((definition) => {
            const is_selected = customMandatoryFields.includes(definition.key);
            return (
              <button
                key={definition.key}
                type="button"
                className={`chip ${is_selected ? 'chip-selected' : ''}`}
                onClick={() => toggleCustomMandatory(definition.key)}
              >
                {definition.key}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel-section">
        <label className="full-width-field">
          Exclude Employee Codes (comma-separated)
          <input
            type="text"
            value={exclude_employee_codes.join(', ')}
            placeholder="E001, E002"
            onChange={(event) =>
              onExcludeEmployeeCodesChange(
                event.target.value
                  .split(',')
                  .map((code) => code.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      </div>

      <div className="panel-section">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={dont_insert_inactive_employees}
            onChange={(event) => onDontInsertInactiveChange(event.target.checked)}
          />
          Do not insert inactive employees
        </label>
        <label className="full-width-field">
          Leaving Date Format
          <input
            type="text"
            value={leaving_date_format}
            placeholder="DD-MMM-YYYY"
            onChange={(event) => onLeavingDateFormatChange(event.target.value)}
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={modify_full_name}
            onChange={(event) => onModifyFullNameChange(event.target.checked)}
          />
          Modify full name on insert/update
        </label>
      </div>
    </CollapsibleSection>
  );
}
