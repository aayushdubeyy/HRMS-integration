import type {
  ConditionalFieldTransformationExport,
  ConditionalFieldTransformationForm,
  GroupedConditionalTransformation,
  GroupTransformationCondition,
  IndividualConditionalTransformation,
  TransformationOperator,
} from '../types/hrmsConfig';

function createTransformationId(): string {
  return `transformation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createConditionId(): string {
  return `condition-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeOperator(operator: unknown): TransformationOperator {
  if (operator === 'not_in' || operator === 'starts_with' || operator === 'ends_with') {
    return operator;
  }

  return 'in';
}

function normalizeConditionValues(condition_value: unknown): string[] {
  if (!Array.isArray(condition_value)) return [];
  return condition_value.map((value) => String(value));
}

function parseGroupCondition(raw_condition: unknown): GroupTransformationCondition {
  const condition = raw_condition as Record<string, unknown>;

  return {
    condition_id: createConditionId(),
    condition_field: String(condition.condition_field ?? ''),
    condition_value: normalizeConditionValues(condition.condition_value),
    operator: normalizeOperator(condition.operator),
  };
}

function parseGroupedTransformation(
  raw_transformation: Record<string, unknown>,
): ConditionalFieldTransformationForm {
  const raw_conditions = Array.isArray(raw_transformation.group_conditions)
    ? raw_transformation.group_conditions
    : [];
  const logic_operator =
    String(raw_transformation.logic_operator ?? 'and').toLowerCase() === 'or' ? 'or' : 'and';

  return {
    transformation_id: createTransformationId(),
    mode: 'grouped',
    group_conditions:
      raw_conditions.length > 0
        ? raw_conditions.map(parseGroupCondition)
        : [createEmptyGroupCondition()],
    logic_operator,
    target_field: String(raw_transformation.target_field ?? ''),
    target_value: (raw_transformation.target_value ?? '') as string | number,
  };
}

function parseIndividualTransformation(
  raw_transformation: Record<string, unknown>,
): ConditionalFieldTransformationForm {
  return {
    transformation_id: createTransformationId(),
    mode: 'individual',
    condition_field: String(raw_transformation.condition_field ?? ''),
    condition_value: normalizeConditionValues(raw_transformation.condition_value),
    operator: normalizeOperator(raw_transformation.operator),
    target_field: String(raw_transformation.target_field ?? ''),
    target_value: (raw_transformation.target_value ?? '') as string | number,
  };
}

export function createEmptyGroupCondition(): GroupTransformationCondition {
  return {
    condition_id: createConditionId(),
    condition_field: '',
    condition_value: [],
    operator: 'in',
  };
}

export function createEmptyIndividualTransformation(): IndividualConditionalTransformation {
  return {
    transformation_id: createTransformationId(),
    mode: 'individual',
    condition_field: '',
    condition_value: [],
    operator: 'in',
    target_field: '',
    target_value: '',
  };
}

export function createEmptyGroupedTransformation(): GroupedConditionalTransformation {
  return {
    transformation_id: createTransformationId(),
    mode: 'grouped',
    group_conditions: [createEmptyGroupCondition()],
    logic_operator: 'and',
    target_field: '',
    target_value: '',
  };
}

export function parseConditionalTransformationsFromImport(
  raw_transformations: unknown,
): ConditionalFieldTransformationForm[] {
  if (!Array.isArray(raw_transformations)) return [];

  return raw_transformations.map((raw_transformation) => {
    const transformation = raw_transformation as Record<string, unknown>;

    if (Array.isArray(transformation.group_conditions)) {
      return parseGroupedTransformation(transformation);
    }

    return parseIndividualTransformation(transformation);
  });
}

function buildIndividualExport(
  transformation: ConditionalFieldTransformationForm,
): ConditionalFieldTransformationExport | null {
  if (transformation.mode !== 'individual') return null;
  if (!transformation.condition_field || !transformation.target_field) return null;
  if (transformation.condition_value.length === 0) return null;

  return {
    condition_field: transformation.condition_field,
    condition_value: transformation.condition_value,
    operator: transformation.operator,
    target_field: transformation.target_field,
    target_value: transformation.target_value,
  };
}

function buildGroupedExport(
  transformation: ConditionalFieldTransformationForm,
): ConditionalFieldTransformationExport | null {
  if (transformation.mode !== 'grouped') return null;
  if (!transformation.target_field) return null;

  const group_conditions = transformation.group_conditions
    .filter(
      (condition) => condition.condition_field && condition.condition_value.length > 0,
    )
    .map(({ condition_field, condition_value, operator }) => ({
      condition_field,
      condition_value,
      operator,
    }));

  if (group_conditions.length === 0) return null;

  return {
    group_conditions,
    logic_operator: transformation.logic_operator,
    target_field: transformation.target_field,
    target_value: transformation.target_value,
  };
}

export function buildConditionalTransformationsExport(
  transformations: ConditionalFieldTransformationForm[],
): ConditionalFieldTransformationExport[] {
  return transformations
    .map((transformation) => {
      if (transformation.mode === 'grouped') {
        return buildGroupedExport(transformation);
      }

      return buildIndividualExport(transformation);
    })
    .filter((transformation): transformation is ConditionalFieldTransformationExport => {
      return transformation !== null;
    });
}
