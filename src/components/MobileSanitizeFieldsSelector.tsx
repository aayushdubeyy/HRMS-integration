import { AMBER_KEYS } from '../constants/amberKeys';
import { CollapsibleSection } from './CollapsibleSection';

type MobileSanitizeFieldsSelectorProps = {
  selected_fields: string[];
  onChange: (selected_fields: string[]) => void;
};

export function MobileSanitizeFieldsSelector({
  selected_fields,
  onChange,
}: MobileSanitizeFieldsSelectorProps) {
  function toggleField(amber_key: string) {
    if (selected_fields.includes(amber_key)) {
      onChange(selected_fields.filter((field) => field !== amber_key));
      return;
    }

    onChange([...selected_fields, amber_key]);
  }

  return (
    <CollapsibleSection
      title="Mobile Sanitize Fields"
      description="GeneralAdaptor last-10-digit sanitize on mapped fields (different from phone country-code transform)."
    >
      <div className="chip-grid">
        {AMBER_KEYS.map((definition) => {
          const is_selected = selected_fields.includes(definition.key);

          return (
            <button
              key={definition.key}
              type="button"
              className={`chip ${is_selected ? 'chip-selected' : ''}`}
              onClick={() => toggleField(definition.key)}
            >
              {definition.key}
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
