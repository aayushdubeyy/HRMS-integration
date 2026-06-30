import { AMBER_KEYS } from '../constants/amberKeys';
import { CollapsibleSection } from './CollapsibleSection';

type SpecificUserHardcodesEditorProps = {
  specific_user_hardcodes: Record<string, Record<string, string>>;
  onChange: (specific_user_hardcodes: Record<string, Record<string, string>>) => void;
};

type EmployeeHardcodeEntry = {
  employee_code: string;
  field_rows: Array<{ row_id: string; field_name: string; field_value: string }>;
};

function buildEntries(
  specific_user_hardcodes: Record<string, Record<string, string>>,
): EmployeeHardcodeEntry[] {
  const entries = Object.entries(specific_user_hardcodes).map(([employee_code, field_values]) => ({
    employee_code,
    field_rows: Object.entries(field_values).map(([field_name, field_value], index) => ({
      row_id: `${employee_code}-${field_name}-${index}`,
      field_name,
      field_value,
    })),
  }));

  if (entries.length === 0) {
    return [{
      employee_code: '',
      field_rows: [{ row_id: 'empty-0', field_name: '', field_value: '' }],
    }];
  }

  return entries;
}

function entriesToRecord(
  entries: EmployeeHardcodeEntry[],
): Record<string, Record<string, string>> {
  return Object.fromEntries(
    entries
      .filter((entry) => entry.employee_code.trim().length > 0)
      .map((entry) => [
        entry.employee_code.trim(),
        Object.fromEntries(
          entry.field_rows
            .filter((row) => row.field_name.trim().length > 0)
            .map((row) => [row.field_name, row.field_value]),
        ),
      ])
      .filter(([, field_values]) => Object.keys(field_values).length > 0),
  );
}

export function SpecificUserHardcodesEditor({
  specific_user_hardcodes,
  onChange,
}: SpecificUserHardcodesEditorProps) {
  const entries = buildEntries(specific_user_hardcodes);

  function updateEntries(next_entries: EmployeeHardcodeEntry[]) {
    onChange(entriesToRecord(next_entries));
  }

  function updateEmployeeCode(index: number, employee_code: string) {
    updateEntries(
      entries.map((entry, entry_index) =>
        entry_index === index ? { ...entry, employee_code } : entry,
      ),
    );
  }

  function updateFieldRow(
    entry_index: number,
    row_id: string,
    field: 'field_name' | 'field_value',
    value: string,
  ) {
    updateEntries(
      entries.map((entry, index) => {
        if (index !== entry_index) return entry;

        return {
          ...entry,
          field_rows: entry.field_rows.map((row) =>
            row.row_id === row_id ? { ...row, [field]: value } : row,
          ),
        };
      }),
    );
  }

  function addFieldRow(entry_index: number) {
    updateEntries(
      entries.map((entry, index) => {
        if (index !== entry_index) return entry;

        return {
          ...entry,
          field_rows: [
            ...entry.field_rows,
            { row_id: `row-${Date.now()}`, field_name: '', field_value: '' },
          ],
        };
      }),
    );
  }

  function removeFieldRow(entry_index: number, row_id: string) {
    updateEntries(
      entries.map((entry, index) => {
        if (index !== entry_index) return entry;

        const next_rows = entry.field_rows.filter((row) => row.row_id !== row_id);
        return {
          ...entry,
          field_rows:
            next_rows.length > 0
              ? next_rows
              : [{ row_id: 'empty-0', field_name: '', field_value: '' }],
        };
      }),
    );
  }

  function addEmployeeEntry() {
    updateEntries([
      ...entries,
      {
        employee_code: '',
        field_rows: [{ row_id: `row-${Date.now()}`, field_name: '', field_value: '' }],
      },
    ]);
  }

  function removeEmployeeEntry(entry_index: number) {
    const next_entries = entries.filter((_, index) => index !== entry_index);
    updateEntries(
      next_entries.length > 0
        ? next_entries
        : [{
            employee_code: '',
            field_rows: [{ row_id: 'empty-0', field_name: '', field_value: '' }],
          }],
    );
  }

  return (
    <CollapsibleSection
      title="Specific User Hardcodes"
      description="Override field values for specific employee codes after mapping."
    >
      {entries.map((entry, entry_index) => (
        <div key={`employee-entry-${entry_index}`} className="nested-card">
          <div className="nested-card-header">
            <label>
              Employee Code
              <input
                type="text"
                value={entry.employee_code}
                placeholder="EMP001"
                onChange={(event) => updateEmployeeCode(entry_index, event.target.value)}
              />
            </label>
            <button
              type="button"
              className="button-danger button-compact"
              onClick={() => removeEmployeeEntry(entry_index)}
            >
              Remove Employee
            </button>
          </div>

          <div className="mapping-table compact-table">
            {entry.field_rows.map((row) => (
              <div key={row.row_id} className="mapping-row with-actions">
                <select
                  value={row.field_name}
                  onChange={(event) =>
                    updateFieldRow(entry_index, row.row_id, 'field_name', event.target.value)
                  }
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
                  placeholder="Override value"
                  onChange={(event) =>
                    updateFieldRow(entry_index, row.row_id, 'field_value', event.target.value)
                  }
                />
                <button
                  type="button"
                  className="button-danger button-compact"
                  onClick={() => removeFieldRow(entry_index, row.row_id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="button-secondary button-compact"
            onClick={() => addFieldRow(entry_index)}
          >
            Add Field Override
          </button>
        </div>
      ))}

      <button type="button" className="button-secondary panel-action" onClick={addEmployeeEntry}>
        Add Employee Override
      </button>
    </CollapsibleSection>
  );
}
