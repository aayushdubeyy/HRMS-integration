import { AMBER_KEYS } from '../constants/amberKeys';
import type { MapEntry, MapTransformation } from '../types/hrmsConfig';
import {
  createEmptyMapEntry,
  createEmptyMapTransformation,
} from '../utils/advancedSettings';
import { CollapsibleSection } from './CollapsibleSection';

type MapTransformationsEditorProps = {
  map_transformations: MapTransformation[];
  onChange: (map_transformations: MapTransformation[]) => void;
};

export function MapTransformationsEditor({
  map_transformations,
  onChange,
}: MapTransformationsEditorProps) {
  function updateTransformation(
    index: number,
    field: 'condition_field' | 'target_field',
    value: string,
  ) {
    onChange(
      map_transformations.map((transformation, row_index) => {
        if (row_index !== index) return transformation;
        return { ...transformation, [field]: value };
      }),
    );
  }

  function updateMapEntry(
    transformation_index: number,
    entry_id: string,
    field: keyof MapEntry,
    value: string,
  ) {
    onChange(
      map_transformations.map((transformation, row_index) => {
        if (row_index !== transformation_index) return transformation;

        return {
          ...transformation,
          map_entries: transformation.map_entries.map((entry) =>
            entry.entry_id === entry_id ? { ...entry, [field]: value } : entry,
          ),
        };
      }),
    );
  }

  function addMapEntry(transformation_index: number) {
    onChange(
      map_transformations.map((transformation, row_index) => {
        if (row_index !== transformation_index) return transformation;

        return {
          ...transformation,
          map_entries: [...transformation.map_entries, createEmptyMapEntry()],
        };
      }),
    );
  }

  function removeMapEntry(transformation_index: number, entry_id: string) {
    onChange(
      map_transformations.map((transformation, row_index) => {
        if (row_index !== transformation_index) return transformation;

        const next_entries = transformation.map_entries.filter(
          (entry) => entry.entry_id !== entry_id,
        );

        return {
          ...transformation,
          map_entries: next_entries.length > 0 ? next_entries : [createEmptyMapEntry()],
        };
      }),
    );
  }

  function addTransformation() {
    onChange([...map_transformations, createEmptyMapTransformation()]);
  }

  function removeTransformation(index: number) {
    onChange(map_transformations.filter((_, row_index) => row_index !== index));
  }

  return (
    <CollapsibleSection
      title="Map Transformations"
      description="Reads an amber field value, matches it against map keys (case-insensitive), and writes the mapped value to the target field."
    >
      {map_transformations.length === 0 && (
        <p className="empty-state">No map transformations configured.</p>
      )}

      {map_transformations.map((transformation, index) => (
        <div key={`map-transformation-${index}`} className="transformation-card">
          <div className="transformation-grid">
            <label>
              Condition Field
              <select
                value={transformation.condition_field}
                onChange={(event) =>
                  updateTransformation(index, 'condition_field', event.target.value)
                }
              >
                <option value="">Select amber key</option>
                {AMBER_KEYS.map((definition) => (
                  <option key={definition.key} value={definition.key}>
                    {definition.key}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Target Field
              <input
                type="text"
                list="amber-field-options"
                value={transformation.target_field}
                placeholder="e.g. exclude_exit"
                onChange={(event) =>
                  updateTransformation(index, 'target_field', event.target.value)
                }
              />
            </label>
          </div>

          <div className="mapping-table compact-table">
            <div className="mapping-table-header with-actions">
              <span>Source Value (map key)</span>
              <span>Mapped Value</span>
              <span />
            </div>

            {transformation.map_entries.map((entry) => (
              <div key={entry.entry_id} className="mapping-row with-actions">
                <input
                  type="text"
                  value={entry.source_value}
                  placeholder="involuntary"
                  onChange={(event) =>
                    updateMapEntry(index, entry.entry_id, 'source_value', event.target.value)
                  }
                />
                <input
                  type="text"
                  value={entry.mapped_value}
                  placeholder="1"
                  onChange={(event) =>
                    updateMapEntry(index, entry.entry_id, 'mapped_value', event.target.value)
                  }
                />
                <button
                  type="button"
                  className="button-danger button-compact"
                  onClick={() => removeMapEntry(index, entry.entry_id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="inline-actions">
            <button
              type="button"
              className="button-secondary button-compact"
              onClick={() => addMapEntry(index)}
            >
              Add Map Entry
            </button>
            <button
              type="button"
              className="button-danger button-compact"
              onClick={() => removeTransformation(index)}
            >
              Remove Transformation
            </button>
          </div>
        </div>
      ))}

      <datalist id="amber-field-options">
        {AMBER_KEYS.map((definition) => (
          <option key={definition.key} value={definition.key} />
        ))}
      </datalist>

      <button type="button" className="button-secondary panel-action" onClick={addTransformation}>
        Add Map Transformation
      </button>
    </CollapsibleSection>
  );
}
