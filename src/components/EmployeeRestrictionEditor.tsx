import type {
  EmployeeRestrictionOperator,
  EmployeeRestrictionRow,
} from '../types/hrmsConfig';
import { AMBER_KEYS } from '../constants/amberKeys';
import { createEmptyEmployeeRestrictionRow } from '../utils/infoFieldExtensions';
import { CollapsibleSection } from './CollapsibleSection';

const RESTRICTION_OPERATORS: EmployeeRestrictionOperator[] = [
  'equals',
  'not_equals',
  'starts_with',
  'not_starts_with',
];

type EmployeeRestrictionEditorProps = {
  employee_restriction_config: EmployeeRestrictionRow[];
  onChange: (employee_restriction_config: EmployeeRestrictionRow[]) => void;
};

export function EmployeeRestrictionEditor({
  employee_restriction_config,
  onChange,
}: EmployeeRestrictionEditorProps) {
  function updateRow(row_id: string, next_row: EmployeeRestrictionRow) {
    onChange(
      employee_restriction_config.map((row) => (row.row_id === row_id ? next_row : row)),
    );
  }

  function removeRow(row_id: string) {
    onChange(employee_restriction_config.filter((row) => row.row_id !== row_id));
  }

  return (
    <CollapsibleSection
      title="Employee Restriction Config"
      description="Keep employees only when every restriction rule passes (must-pass filters)."
    >
      {employee_restriction_config.length === 0 && (
        <p className="empty-state">No restriction rules configured.</p>
      )}

      {employee_restriction_config.map((row) => (
        <div key={row.row_id} className="nested-card">
          <div className="settings-grid">
            <label>
              Field Name
              <select
                value={row.field_name}
                onChange={(event) =>
                  updateRow(row.row_id, { ...row, field_name: event.target.value })
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
            <label>
              Operator
              <select
                value={row.operator}
                onChange={(event) =>
                  updateRow(row.row_id, {
                    ...row,
                    operator: event.target.value as EmployeeRestrictionOperator,
                  })
                }
              >
                {RESTRICTION_OPERATORS.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width-field">
              Allowed Values (comma-separated)
              <input
                type="text"
                value={row.allowed_values.join(', ')}
                placeholder="sales, eng"
                onChange={(event) =>
                  updateRow(row.row_id, {
                    ...row,
                    allowed_values: event.target.value
                      .split(',')
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
          </div>
          <button
            type="button"
            className="button-danger button-compact"
            onClick={() => removeRow(row.row_id)}
          >
            Remove Rule
          </button>
        </div>
      ))}

      <button
        type="button"
        className="button-secondary button-compact panel-action"
        onClick={() =>
          onChange([...employee_restriction_config, createEmptyEmployeeRestrictionRow()])
        }
      >
        Add Restriction Rule
      </button>
    </CollapsibleSection>
  );
}
