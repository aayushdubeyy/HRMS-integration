type KeyValueRow = {
  row_id: string;
  key: string;
  value: string;
};

type KeyValueEditorProps = {
  rows: Array<{ key: string; value: string }>;
  key_label: string;
  value_label: string;
  value_placeholder?: string;
  onChange: (rows: Array<{ key: string; value: string }>) => void;
};

function buildRows(rows: Array<{ key: string; value: string }>): KeyValueRow[] {
  if (rows.length === 0) {
    return [{ row_id: 'empty-0', key: '', value: '' }];
  }

  return rows.map((row, index) => ({
    row_id: `${row.key}-${index}`,
    key: row.key,
    value: row.value,
  }));
}

export function KeyValueEditor({
  rows,
  key_label,
  value_label,
  value_placeholder,
  onChange,
}: KeyValueEditorProps) {
  const editor_rows = buildRows(rows);

  function updateRows(next_rows: KeyValueRow[]) {
    onChange(
      next_rows
        .filter((row) => row.key.trim().length > 0 || row.value.trim().length > 0)
        .map((row) => ({ key: row.key, value: row.value })),
    );
  }

  function updateRow(row_id: string, field: 'key' | 'value', value: string) {
    updateRows(
      editor_rows.map((row) => (row.row_id === row_id ? { ...row, [field]: value } : row)),
    );
  }

  function addRow() {
    onChange([...rows, { key: '', value: '' }]);
  }

  function removeRow(row_id: string) {
    const next_rows = editor_rows.filter((row) => row.row_id !== row_id);
    updateRows(next_rows.length > 0 ? next_rows : [{ row_id: 'empty-0', key: '', value: '' }]);
  }

  return (
    <div className="mapping-table compact-table">
      <div className="mapping-table-header with-actions">
        <span>{key_label}</span>
        <span>{value_label}</span>
        <span />
      </div>

      {editor_rows.map((row) => (
        <div key={row.row_id} className="mapping-row with-actions">
          <input
            type="text"
            value={row.key}
            placeholder="key"
            onChange={(event) => updateRow(row.row_id, 'key', event.target.value)}
          />
          <input
            type="text"
            value={row.value}
            placeholder={value_placeholder ?? 'value'}
            onChange={(event) => updateRow(row.row_id, 'value', event.target.value)}
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

      <button type="button" className="button-secondary button-compact panel-action" onClick={addRow}>
        Add Row
      </button>
    </div>
  );
}
