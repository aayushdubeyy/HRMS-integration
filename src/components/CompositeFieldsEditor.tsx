import type { CompositeFieldRow } from '../types/hrmsConfig';
import { AMBER_KEYS } from '../constants/amberKeys';
import { createEmptyCompositeFieldRow } from '../utils/infoFieldExtensions';
import { CollapsibleSection } from './CollapsibleSection';

type CompositeFieldsEditorProps = {
  composite_fields: CompositeFieldRow[];
  onChange: (composite_fields: CompositeFieldRow[]) => void;
};

export function CompositeFieldsEditor({
  composite_fields,
  onChange,
}: CompositeFieldsEditorProps) {
  function updateRow(row_id: string, next_row: CompositeFieldRow) {
    onChange(composite_fields.map((row) => (row.row_id === row_id ? next_row : row)));
  }

  function toggleSourceField(row: CompositeFieldRow, amber_key: string) {
    const has_field = row.source_fields.includes(amber_key);
    const source_fields = has_field
      ? row.source_fields.filter((field) => field !== amber_key)
      : [...row.source_fields, amber_key];
    updateRow(row.row_id, { ...row, source_fields });
  }

  function removeRow(row_id: string) {
    onChange(composite_fields.filter((row) => row.row_id !== row_id));
  }

  return (
    <CollapsibleSection
      title="Composite Fields"
      description="Join already-mapped fields into one target field (space-separated)."
    >
      {composite_fields.length === 0 && (
        <p className="empty-state">No composite fields configured.</p>
      )}

      {composite_fields.map((row) => (
        <div key={row.row_id} className="nested-card">
          <div className="settings-grid">
            <label>
              Target Field
              <select
                value={row.target_field}
                onChange={(event) =>
                  updateRow(row.row_id, { ...row, target_field: event.target.value })
                }
              >
                <option value="">Select amber field</option>
                {AMBER_KEYS.map((definition) => (
                  <option key={definition.key} value={definition.key}>
                    {definition.key}
                  </option>
                ))}
              </select>
            </label>
            <div className="full-width-field">
              <span className="field-label">Source Fields (order matters)</span>
              <div className="chip-grid">
                {AMBER_KEYS.map((definition) => {
                  const is_selected = row.source_fields.includes(definition.key);
                  return (
                    <button
                      key={definition.key}
                      type="button"
                      className={`chip ${is_selected ? 'chip-selected' : ''}`}
                      onClick={() => toggleSourceField(row, definition.key)}
                    >
                      {definition.key}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="button-danger button-compact"
            onClick={() => removeRow(row.row_id)}
          >
            Remove Composite Field
          </button>
        </div>
      ))}

      <button
        type="button"
        className="button-secondary button-compact panel-action"
        onClick={() => onChange([...composite_fields, createEmptyCompositeFieldRow()])}
      >
        Add Composite Field
      </button>
    </CollapsibleSection>
  );
}
