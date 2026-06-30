import { AMBER_KEYS } from '../constants/amberKeys';
import type { AllowedEmployeeRule, AllowedEmployeesConfig } from '../types/hrmsConfig';
import { isAllowedEmployeesGroup } from '../types/hrmsConfig';
import { createEmptyAllowedEmployeesConfig } from '../utils/advancedSettings';
import { CommaSeparatedInput } from './CommaSeparatedInput';
import { CollapsibleSection } from './CollapsibleSection';

type AllowedEmployeesConfigEditorProps = {
  allowed_employees_config: AllowedEmployeesConfig | null;
  onChange: (allowed_employees_config: AllowedEmployeesConfig | null) => void;
};

const RULE_OPERATORS: AllowedEmployeeRule['operator'][] = [
  'equals',
  'not_equals',
  'starts_with',
  'not_starts_with',
];

function createEmptyRule(): AllowedEmployeeRule {
  return {
    field_name: '',
    values: [],
    operator: 'equals',
  };
}

type RuleGroupEditorProps = {
  config: AllowedEmployeesConfig;
  onChange: (config: AllowedEmployeesConfig) => void;
  onRemove?: () => void;
  depth?: number;
  group_label?: string;
};

function getGroupTitle(depth: number): string {
  if (depth === 0) return 'Root Group';
  return `Nested Group · Level ${depth + 1}`;
}

function RuleGroupEditor({
  config,
  onChange,
  onRemove,
  depth = 0,
  group_label,
}: RuleGroupEditorProps) {
  function updateLogic(logic: AllowedEmployeesConfig['logic']) {
    onChange({ ...config, logic });
  }

  function updateRule(index: number, next_rule: AllowedEmployeeRule | AllowedEmployeesConfig) {
    onChange({
      ...config,
      rules: config.rules.map((rule, rule_index) => (rule_index === index ? next_rule : rule)),
    });
  }

  function addRule() {
    onChange({
      ...config,
      rules: [...config.rules, createEmptyRule()],
    });
  }

  function addGroup() {
    onChange({
      ...config,
      rules: [...config.rules, createEmptyAllowedEmployeesConfig()],
    });
  }

  function removeRule(index: number) {
    onChange({
      ...config,
      rules: config.rules.filter((_, rule_index) => rule_index !== index),
    });
  }

  return (
    <div className={`rule-group depth-${Math.min(depth, 3)}`}>
      <div className="rule-group-header">
        <div className="rule-group-heading">
          <span className="rule-type-badge rule-type-group">Group</span>
          <div>
            <h4 className="rule-group-title">{group_label ?? getGroupTitle(depth)}</h4>
            <label className="rule-logic-field">
              Combine child rules with
              <select
                value={config.logic}
                onChange={(event) => updateLogic(event.target.value as 'AND' | 'OR')}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </label>
          </div>
          <span className="logic-pill logic-pill-large">{config.logic}</span>
        </div>
        {onRemove && (
          <button type="button" className="button-danger button-compact" onClick={onRemove}>
            Remove Group
          </button>
        )}
      </div>

      {config.rules.length === 0 && (
        <p className="empty-state">No allow rules configured in this group.</p>
      )}

      <div className="rule-tree-list">
        {config.rules.map((rule, index) => {
          const item_label = isAllowedEmployeesGroup(rule)
            ? `Nested Group ${index + 1}`
            : `Rule ${index + 1}`;

          return (
            <div key={`tree-item-${depth}-${index}`} className="rule-tree-branch">
              {index > 0 && (
                <div className="rule-logic-connector" aria-hidden="true">
                  <span className="logic-pill">{config.logic}</span>
                </div>
              )}

              <div className="rule-tree-item">
                {isAllowedEmployeesGroup(rule) ? (
                  <RuleGroupEditor
                    config={rule}
                    depth={depth + 1}
                    group_label={item_label}
                    onChange={(next_group) => updateRule(index, next_group)}
                    onRemove={() => removeRule(index)}
                  />
                ) : (
                  <div className="rule-card">
                    <div className="rule-item-header">
                      <span className="rule-type-badge rule-type-leaf">Leaf Rule</span>
                      <span className="rule-item-label">{item_label}</span>
                    </div>

                    <div className="transformation-grid">
                      <label>
                        Field Name
                        <select
                          value={rule.field_name}
                          onChange={(event) =>
                            updateRule(index, { ...rule, field_name: event.target.value })
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
                        Operator
                        <select
                          value={rule.operator}
                          onChange={(event) =>
                            updateRule(index, {
                              ...rule,
                              operator: event.target.value as AllowedEmployeeRule['operator'],
                            })
                          }
                        >
                          {RULE_OPERATORS.map((operator) => (
                            <option key={operator} value={operator}>
                              {operator}
                            </option>
                          ))}
                        </select>
                      </label>

                      <CommaSeparatedInput
                        label="Values (comma separated)"
                        values={rule.values}
                        onChange={(values) => updateRule(index, { ...rule, values })}
                      />
                    </div>

                    <button
                      type="button"
                      className="button-danger button-compact"
                      onClick={() => removeRule(index)}
                    >
                      Remove Rule
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="inline-actions">
        <button type="button" className="button-secondary button-compact" onClick={addRule}>
          Add Rule
        </button>
        <button type="button" className="button-secondary button-compact" onClick={addGroup}>
          Add Nested Group
        </button>
      </div>
    </div>
  );
}

export function AllowedEmployeesConfigEditor({
  allowed_employees_config,
  onChange,
}: AllowedEmployeesConfigEditorProps) {
  const is_enabled = allowed_employees_config !== null;
  const config = allowed_employees_config ?? createEmptyAllowedEmployeesConfig();

  function toggleEnabled() {
    if (is_enabled) {
      onChange(null);
      return;
    }

    onChange(createEmptyAllowedEmployeesConfig());
  }

  return (
    <CollapsibleSection
      title="Allowed Employees Config"
      description="Include only employees that match nested AND/OR allow rules."
      header_actions={
        <button type="button" className="button-secondary" onClick={toggleEnabled}>
          {is_enabled ? 'Disable Filter' : 'Enable Filter'}
        </button>
      }
    >
      {is_enabled && (
        <RuleGroupEditor config={config} onChange={onChange} />
      )}
    </CollapsibleSection>
  );
}
