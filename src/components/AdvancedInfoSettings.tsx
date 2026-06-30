import type { HrmsAdvancedSettings } from '../types/hrmsConfig';
import { HardcodeFieldsEditor } from './HardcodeFieldsEditor';
import { SpecificUserHardcodesEditor } from './SpecificUserHardcodesEditor';
import { MapTransformationsEditor } from './MapTransformationsEditor';
import { AllowedEmployeesConfigEditor } from './AllowedEmployeesConfigEditor';
import { CollapsibleSection } from './CollapsibleSection';

type AdvancedInfoSettingsProps = {
  settings: HrmsAdvancedSettings;
  onChange: (settings: HrmsAdvancedSettings) => void;
};

export function AdvancedInfoSettings({ settings, onChange }: AdvancedInfoSettingsProps) {
  function updateSettings<K extends keyof HrmsAdvancedSettings>(
    field: K,
    value: HrmsAdvancedSettings[K],
  ) {
    onChange({ ...settings, [field]: value });
  }

  return (
    <div className="form-stack">
      <CollapsibleSection
        title="Custom Date Format"
        description="Re-sanitize all string date values using this format after mapping and filtering."
      >
        <label className="single-field-label">
          Date Format
          <input
            type="text"
            value={settings.custom_date_format}
            placeholder="DD-MM-YYYY"
            onChange={(event) => updateSettings('custom_date_format', event.target.value)}
          />
        </label>
      </CollapsibleSection>

      <HardcodeFieldsEditor
        hardcode_fields={settings.hardcode_fields}
        onChange={(hardcode_fields) => updateSettings('hardcode_fields', hardcode_fields)}
      />

      <SpecificUserHardcodesEditor
        specific_user_hardcodes={settings.specific_user_hardcodes}
        onChange={(specific_user_hardcodes) =>
          updateSettings('specific_user_hardcodes', specific_user_hardcodes)
        }
      />

      <MapTransformationsEditor
        map_transformations={settings.map_transformations}
        onChange={(map_transformations) => updateSettings('map_transformations', map_transformations)}
      />

      <AllowedEmployeesConfigEditor
        allowed_employees_config={settings.allowed_employees_config}
        onChange={(allowed_employees_config) =>
          updateSettings('allowed_employees_config', allowed_employees_config)
        }
      />
    </div>
  );
}
