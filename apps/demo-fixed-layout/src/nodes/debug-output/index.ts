/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';
import { IFlowValue } from '@flowgram.ai/form-materials';

import { FlowNodeRegistry } from '../../typings';
import { JsonSchema } from '../../typings';
import { t } from '../../i18n';
import iconDebugOutput from '../../assets/icon-debug-output.svg';
import { formMeta } from './form-meta';

const DEBUG_OUTPUT_NODE_TYPE = 'debug-output';

let index = 0;

const createEmptyObjectSchema = (): JsonSchema => ({
  type: 'object',
  properties: {},
});

const cloneSchema = (schema: JsonSchema): JsonSchema => JSON.parse(JSON.stringify(schema));

const getSourceOutputsSchema = (from?: Parameters<NonNullable<FlowNodeRegistry['onAdd']>>[1]) => {
  const outputs = from?.form?.getValueIn<JsonSchema>('outputs');
  if (outputs?.type === 'object' && outputs.properties) {
    return cloneSchema(outputs);
  }
  return createEmptyObjectSchema();
};

const createInputsValuesFromOutputs = (
  sourceNodeID: string | undefined,
  outputs: JsonSchema
): Record<string, IFlowValue> => {
  if (!sourceNodeID || outputs.type !== 'object' || !outputs.properties) {
    return {};
  }

  return Object.keys(outputs.properties).reduce<Record<string, IFlowValue>>((result, key) => {
    result[key] = {
      type: 'ref',
      content: [sourceNodeID, key],
    };
    return result;
  }, {});
};

export const DebugOutputNodeRegistry: FlowNodeRegistry = {
  type: DEBUG_OUTPUT_NODE_TYPE,
  info: {
    icon: iconDebugOutput,
    description: t(
      'Pass upstream values through unchanged and display runtime outputs for debugging.'
    ),
  },
  onAdd(_ctx, from) {
    const outputs = getSourceOutputsSchema(from);

    return {
      id: `debug_output_${nanoid(5)}`,
      type: DEBUG_OUTPUT_NODE_TYPE,
      data: {
        title: t('Debug Output_{{index}}', { index: ++index }),
        inputsValues: createInputsValuesFromOutputs(from?.id, outputs),
        inputs: cloneSchema(outputs),
        outputs,
      },
    };
  },
  formMeta,
};
