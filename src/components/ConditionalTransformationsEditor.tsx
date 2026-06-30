import type {
  ConditionalFieldTransformationForm,
  GroupTransformationCondition,
  TransformationOperator,
} from '../types/hrmsConfig';
import { AMBER_KEYS } from '../constants/amberKeys';
import {
  createEmptyGroupCondition,
  createEmptyGroupedTransformation,
  createEmptyIndividualTransformation,
} from '../utils/conditionalFieldTransformations';
import { CommaSeparatedInput } from './CommaSeparatedInput';
import { CollapsibleSection } from './CollapsibleSection';

type ConditionalTransformationsEditorProps = {
  transformations: ConditionalFieldTransformationForm[];
  onChange: (transformations: ConditionalFieldTransformationForm[]) => void;
};

const OPERATORS: TransformationOperator[] = ['in', 'not_in', 'starts_with', 'ends_with'];

type ConditionFieldsProps = {
  condition_field: string;
  operator: TransformationOperator;
  condition_value: string[];
  onConditionFieldChange: (value: string) => void;
  onOperatorChange: (value: TransformationOperator) => void;
  onConditionValueChange: (values: string[]) => void;
};

function ConditionFields({
  condition_field,
  operator,
  condition_value,
  onConditionFieldChange,
  onOperatorChange,
  onConditionValueChange,
}: ConditionFieldsProps) {
  return (
    <>
      <label>
        Condition Field
        <select value={condition_field} onChange={(event) => onConditionFieldChange(event.target.value)}>
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
          value={operator}
          onChange={(event) => onOperatorChange(event.target.value as TransformationOperator)}
        >
          {OPERATORS.map((operator_option) => (
            <option key={operator_option} value={operator_option}>
              {operator_option}
            </option>
          ))}
        </select>
      </label>

      <CommaSeparatedInput
        label="Condition Values (comma separated)"
        values={condition_value}
        placeholder="involuntary, voluntary"
        onChange={onConditionValueChange}
      />
    </>
  );
}

type TargetFieldsProps = {
  target_field: string;
  target_value: string | number;
  onTargetFieldChange: (value: string) => void;
  onTargetValueChange: (value: string | number) => void;
};

function TargetFields({
  target_field,
  target_value,
  onTargetFieldChange,
  onTargetValueChange,
}: TargetFieldsProps) {
  return (
    <>
      <label>
        Target Field
        <select value={target_field} onChange={(event) => onTargetFieldChange(event.target.value)}>
          <option value="">Select amber key</option>
          {AMBER_KEYS.map((definition) => (
            <option key={definition.key} value={definition.key}>
              {definition.key}
            </option>
          ))}
        </select>
      </label>

      <label>
        Target Value
        <input
          type="text"
          value={String(target_value)}
          onChange={(event) => {
            const raw_value = event.target.value;
            const numeric_value = Number(raw_value);
            const parsed_value =
              raw_value !== '' && !Number.isNaN(numeric_value) ? numeric_value : raw_value;

            onTargetValueChange(parsed_value);
          }}
        />
      </label>
    </>
  );
}

type IndividualTransformationCardProps = {
  transformation: ConditionalFieldTransformationForm;
  onChange: (transformation: ConditionalFieldTransformationForm) => void;
  onRemove: () => void;
};

function IndividualTransformationCard({
  transformation,
  onChange,
  onRemove,
}: IndividualTransformationCardProps) {
  if (transformation.mode !== 'individual') return null;

  return (
    <div className="transformation-card">
      <div className="transformation-grid">
        <ConditionFields
          condition_field={transformation.condition_field}
          operator={transformation.operator}
          condition_value={transformation.condition_value}
          onConditionFieldChange={(condition_field) =>
            onChange({ ...transformation, condition_field })
          }
          onOperatorChange={(operator) => onChange({ ...transformation, operator })}
          onConditionValueChange={(condition_value) =>
            onChange({ ...transformation, condition_value })
          }
        />
        <TargetFields
          target_field={transformation.target_field}
          target_value={transformation.target_value}
          onTargetFieldChange={(target_field) => onChange({ ...transformation, target_field })}
          onTargetValueChange={(target_value) => onChange({ ...transformation, target_value })}
        />
      </div>

      <button type="button" className="button-danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

type GroupConditionRowProps = {
  condition: GroupTransformationCondition;
  condition_index: number;
  logic_operator: 'and' | 'or';
  onChange: (condition: GroupTransformationCondition) => void;
  onRemove: () => void;
};

function GroupConditionRow({
  condition,
  condition_index,
  logic_operator,
  onChange,
  onRemove,
}: GroupConditionRowProps) {
  return (
    <div className="rule-tree-branch">
      {condition_index > 0 && (
        <div className="rule-logic-connector" aria-hidden="true">
          <span className="logic-pill">{logic_operator.toUpperCase()}</span>
        </div>
      )}

      <div className="nested-card">
        <div className="rule-item-header">
          <span className="rule-type-badge rule-type-leaf">Condition</span>
          <span className="rule-item-label">Condition {condition_index + 1}</span>
          <button type="button" className="button-danger button-compact" onClick={onRemove}>
            Remove
          </button>
        </div>

        <div className="transformation-grid">
          <ConditionFields
            condition_field={condition.condition_field}
            operator={condition.operator}
            condition_value={condition.condition_value}
            onConditionFieldChange={(condition_field) =>
              onChange({ ...condition, condition_field })
            }
            onOperatorChange={(operator) => onChange({ ...condition, operator })}
            onConditionValueChange={(condition_value) =>
              onChange({ ...condition, condition_value })
            }
          />
        </div>
      </div>
    </div>
  );
}

type GroupedTransformationCardProps = {
  transformation: ConditionalFieldTransformationForm;
  onChange: (transformation: ConditionalFieldTransformationForm) => void;
  onRemove: () => void;
};

function GroupedTransformationCard({
  transformation,
  onChange,
  onRemove,
}: GroupedTransformationCardProps) {
  if (transformation.mode !== 'grouped') return null;

  const grouped_transformation = transformation;

  function updateCondition(
    condition_id: string,
    next_condition: GroupTransformationCondition,
  ) {
    onChange({
      ...grouped_transformation,
      group_conditions: grouped_transformation.group_conditions.map((condition) =>
        condition.condition_id === condition_id ? next_condition : condition,
      ),
    });
  }

  function addCondition() {
    onChange({
      ...grouped_transformation,
      group_conditions: [
        ...grouped_transformation.group_conditions,
        createEmptyGroupCondition(),
      ],
    });
  }

  function removeCondition(condition_id: string) {
    const next_conditions = grouped_transformation.group_conditions.filter(
      (condition) => condition.condition_id !== condition_id,
    );

    onChange({
      ...grouped_transformation,
      group_conditions:
        next_conditions.length > 0 ? next_conditions : [createEmptyGroupCondition()],
    });
  }

  return (
    <div className="transformation-card">
      <div className="rule-group depth-0">
        <div className="rule-group-header">
          <div className="rule-group-heading">
            <span className="rule-type-badge rule-type-group">Group</span>
            <label className="rule-logic-field">
              Combine conditions with
              <select
                value={grouped_transformation.logic_operator}
                onChange={(event) =>
                  onChange({
                    ...grouped_transformation,
                    logic_operator: event.target.value as 'and' | 'or',
                  })
                }
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </select>
            </label>
            <span className="logic-pill logic-pill-large">
              {grouped_transformation.logic_operator.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="rule-tree-list">
          {grouped_transformation.group_conditions.map((condition, condition_index) => (
            <GroupConditionRow
              key={condition.condition_id}
              condition={condition}
              condition_index={condition_index}
              logic_operator={grouped_transformation.logic_operator}
              onChange={(next_condition) => updateCondition(condition.condition_id, next_condition)}
              onRemove={() => removeCondition(condition.condition_id)}
            />
          ))}
        </div>

        <button type="button" className="button-secondary button-compact" onClick={addCondition}>
          Add Condition
        </button>
      </div>

      <div className="transformation-grid panel-section">
        <TargetFields
          target_field={grouped_transformation.target_field}
          target_value={grouped_transformation.target_value}
          onTargetFieldChange={(target_field) =>
            onChange({ ...grouped_transformation, target_field })
          }
          onTargetValueChange={(target_value) =>
            onChange({ ...grouped_transformation, target_value })
          }
        />
      </div>

      <button type="button" className="button-danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

type TransformationCardProps = {
  transformation: ConditionalFieldTransformationForm;
  onChange: (transformation: ConditionalFieldTransformationForm) => void;
  onRemove: () => void;
};

function TransformationCard({ transformation, onChange, onRemove }: TransformationCardProps) {
  function switchMode(mode: ConditionalFieldTransformationForm['mode']) {
    if (mode === transformation.mode) return;

    if (mode === 'grouped') {
      const grouped = createEmptyGroupedTransformation();
      grouped.target_field = transformation.target_field;
      grouped.target_value = transformation.target_value;

      if (transformation.mode === 'individual' && transformation.condition_field) {
        grouped.group_conditions = [
          {
            condition_id: grouped.group_conditions[0].condition_id,
            condition_field: transformation.condition_field,
            condition_value: transformation.condition_value,
            operator: transformation.operator,
          },
        ];
      }

      onChange(grouped);
      return;
    }

    const individual = createEmptyIndividualTransformation();
    individual.target_field = transformation.target_field;
    individual.target_value = transformation.target_value;

    if (transformation.mode === 'grouped') {
      const first_condition = transformation.group_conditions[0];
      if (first_condition) {
        individual.condition_field = first_condition.condition_field;
        individual.condition_value = first_condition.condition_value;
        individual.operator = first_condition.operator;
      }
    }

    onChange(individual);
  }

  return (
    <div className="nested-card">
      <div className="nested-card-header">
        <label>
          Condition Type
          <select
            value={transformation.mode}
            onChange={(event) =>
              switchMode(event.target.value as ConditionalFieldTransformationForm['mode'])
            }
          >
            <option value="individual">Single Condition</option>
            <option value="grouped">Group Conditions</option>
          </select>
        </label>
      </div>

      {transformation.mode === 'individual' ? (
        <IndividualTransformationCard
          transformation={transformation}
          onChange={onChange}
          onRemove={onRemove}
        />
      ) : (
        <GroupedTransformationCard
          transformation={transformation}
          onChange={onChange}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

export function ConditionalTransformationsEditor({
  transformations,
  onChange,
}: ConditionalTransformationsEditorProps) {
  function updateTransformation(
    index: number,
    next_transformation: ConditionalFieldTransformationForm,
  ) {
    onChange(
      transformations.map((transformation, row_index) =>
        row_index === index ? next_transformation : transformation,
      ),
    );
  }

  function addIndividualTransformation() {
    onChange([...transformations, createEmptyIndividualTransformation()]);
  }

  function addGroupedTransformation() {
    onChange([...transformations, createEmptyGroupedTransformation()]);
  }

  function removeTransformation(index: number) {
    onChange(transformations.filter((_, row_index) => row_index !== index));
  }

  return (
    <CollapsibleSection
      title="Conditional Field Transformations"
      description="Apply target values when one or more conditions match. Use group conditions with AND/OR logic for multiple fields."
    >
      {transformations.length === 0 && (
        <p className="empty-state">No conditional transformations configured.</p>
      )}

      {transformations.map((transformation, index) => (
        <TransformationCard
          key={transformation.transformation_id}
          transformation={transformation}
          onChange={(next_transformation) => updateTransformation(index, next_transformation)}
          onRemove={() => removeTransformation(index)}
        />
      ))}

      <div className="inline-actions">
        <button type="button" className="button-secondary" onClick={addIndividualTransformation}>
          Add Single Condition
        </button>
        <button type="button" className="button-secondary" onClick={addGroupedTransformation}>
          Add Group Conditions
        </button>
      </div>
    </CollapsibleSection>
  );
}
