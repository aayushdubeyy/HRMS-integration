import { AMBER_KEYS } from '../constants/amberKeys';
import { CollapsibleSection } from './CollapsibleSection';

type HardcodeFieldsEditorProps = {
  hardcode_fields: Record<string, string>;
  onChange: (hardcode_fields: Record<string, string>) => void;
};

type HardcodeFieldRow = {
  row_id: string;
  field_name: string;
  field_value: string;
};

function buildRows(hardcode_fields: Record<string, string>): HardcodeFieldRow[] {
  const rows = Object.entries(hardcode_fields).map(([field_name, field_value], index) => ({
    row_id: `${field_name}-${index}`,
    field_name,
    field_value,
  }));

  if (rows.length === 0) {
    return [{ row_id: 'empty-0', field_name: '', field_value: '' }];
  }

  return rows;
}

function rowsToRecord(rows: HardcodeFieldRow[]): Record<string, string> {
  return Object.fromEntries(
    rows
      .filter((row) => row.field_name.trim().length > 0)
      .map((row) => [row.field_name, row.field_value]),
  );
}

export function HardcodeFieldsEditor({
  hardcode_fields,
  onChange,
}: HardcodeFieldsEditorProps) {
  const rows = buildRows(hardcode_fields);

  function updateRows(next_rows: HardcodeFieldRow[]) {
    onChange(rowsToRecord(next_rows));
  }

  function updateRow(row_id: string, field: 'field_name' | 'field_value', value: string) {
    updateRows(
      rows.map((row) => (row.row_id === row_id ? { ...row, [field]: value } : row)),
    );
  }

  function addRow() {
    updateRows([
      ...rows,
      { row_id: `row-${Date.now()}`, field_name: '', field_value: '' },
    ]);
  }

  function removeRow(row_id: string) {
    const next_rows = rows.filter((row) => row.row_id !== row_id);
    updateRows(next_rows.length > 0 ? next_rows : [{ row_id: 'empty-0', field_name: '', field_value: '' }]);
  }

  return (
    <CollapsibleSection
      title="Hardcode Fields"
      description="Apply the same field value to every employee after mapping."
    >
      <div className="mapping-table">
        <div className="mapping-table-header">
          <span>Field</span>
          <span>Value</span>
          <span />
        </div>

        {rows.map((row) => (
          <div key={row.row_id} className="mapping-row with-actions">
            <select
              value={row.field_name}
              onChange={(event) => updateRow(row.row_id, 'field_name', event.target.value)}
            >
              <option value="">Select field</option>
              {AMBER_KEYS.map((definition) => (
                <option key={definition.key} value={definition.key}>
                  {definition.key}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={row.field_value}
              placeholder="Hardcoded value"
              onChange={(event) => updateRow(row.row_id, 'field_value', event.target.value)}
            />
            <button
              type="button"
              className="button-danger button-compact"
              onClick={() => removeRow(row.row_id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="button-secondary panel-action" onClick={addRow}>
        Add Hardcode Field
      </button>
    </CollapsibleSection>
  );
}
