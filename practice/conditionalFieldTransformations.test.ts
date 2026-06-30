import { describe, expect, it } from 'vitest';
import {
  buildConditionalTransformationsExport,
  createEmptyGroupedTransformation,
  createEmptyIndividualTransformation,
  parseConditionalTransformationsFromImport,
} from '../src/utils/conditionalFieldTransformations';

describe('parseConditionalTransformationsFromImport', () => {
  it('parses individual conditional transformations', () => {
    const parsed = parseConditionalTransformationsFromImport([
      {
        condition_field: 'exit_type',
        condition_value: ['involuntary'],
        operator: 'in',
        target_field: 'exclude_exit',
        target_value: 1,
      },
    ]);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].mode).toBe('individual');
    if (parsed[0].mode !== 'individual') return;
    expect(parsed[0].condition_field).toBe('exit_type');
    expect(parsed[0].target_field).toBe('exclude_exit');
  });

  it('parses grouped conditional transformations', () => {
    const parsed = parseConditionalTransformationsFromImport([
      {
        group_conditions: [
          {
            condition_field: 'exit_type',
            condition_value: ['involuntary'],
            operator: 'in',
          },
          {
            condition_field: 'department',
            condition_value: ['sales'],
            operator: 'starts_with',
          },
        ],
        logic_operator: 'and',
        target_field: 'exclude_exit',
        target_value: 1,
      },
    ]);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].mode).toBe('grouped');
    if (parsed[0].mode !== 'grouped') return;
    expect(parsed[0].logic_operator).toBe('and');
    expect(parsed[0].group_conditions).toHaveLength(2);
    expect(parsed[0].group_conditions[0].condition_field).toBe('exit_type');
  });
});

describe('buildConditionalTransformationsExport', () => {
  it('exports individual transformations without group fields', () => {
    const exported = buildConditionalTransformationsExport([
      {
        ...createEmptyIndividualTransformation(),
        condition_field: 'exit_type',
        condition_value: ['involuntary'],
        operator: 'in',
        target_field: 'exclude_exit',
        target_value: 1,
      },
    ]);

    expect(exported).toHaveLength(1);
    expect(exported[0]).toEqual({
      condition_field: 'exit_type',
      condition_value: ['involuntary'],
      operator: 'in',
      target_field: 'exclude_exit',
      target_value: 1,
    });
  });

  it('exports grouped transformations with logic_operator', () => {
    const grouped = createEmptyGroupedTransformation();
    grouped.logic_operator = 'or';
    grouped.group_conditions[0].condition_field = 'exit_type';
    grouped.group_conditions[0].condition_value = ['involuntary'];
    grouped.group_conditions[0].operator = 'in';
    grouped.target_field = 'exclude_exit';
    grouped.target_value = 1;

    const exported = buildConditionalTransformationsExport([grouped]);

    expect(exported).toHaveLength(1);
    expect(exported[0]).toEqual({
      group_conditions: [
        {
          condition_field: 'exit_type',
          condition_value: ['involuntary'],
          operator: 'in',
        },
      ],
      logic_operator: 'or',
      target_field: 'exclude_exit',
      target_value: 1,
    });
  });

  it('drops incomplete grouped transformations', () => {
    const exported = buildConditionalTransformationsExport([createEmptyGroupedTransformation()]);
    expect(exported).toHaveLength(0);
  });
});
