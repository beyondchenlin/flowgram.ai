/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';
import { type DebugOutputNodeData } from '@flowgram.ai/runtime-interface';
import { WorkflowPortEntity } from '@flowgram.ai/free-layout-editor';
import { IFlowValue } from '@flowgram.ai/form-materials';

import { WorkflowNodeType } from '../constants';
import { FlowNodeRegistry } from '../../typings';
import { JsonSchema } from '../../typings';
import { t } from '../../i18n';
import iconDebugOutput from '../../assets/icon-debug-output.svg';
import { formMeta } from './form-meta';

let index = 0;

type DebugOutputObjectSchema = DebugOutputNodeData['inputs'];

const createEmptyObjectSchema = (): DebugOutputObjectSchema => ({
  type: 'object',
  properties: {},
});

const cloneSchema = <T>(schema: T): T => JSON.parse(JSON.stringify(schema)) as T;

const getSourceOutputsSchema = (fromPort?: WorkflowPortEntity): DebugOutputObjectSchema => {
  const outputs = fromPort?.node.form?.getValueIn<JsonSchema>('outputs');
  if (outputs?.type === 'object' && outputs.properties) {
    return cloneSchema(outputs) as DebugOutputObjectSchema;
  }
  return createEmptyObjectSchema();
};

const createInputsValuesFromOutputs = (
  sourceNodeID: string | undefined,
  outputs: DebugOutputObjectSchema
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
  type: WorkflowNodeType.DebugOutput,
  info: {
    icon: iconDebugOutput,
    description: t(
      'Pass upstream values through unchanged and display runtime outputs for debugging.'
    ),
  },
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
    size: {
      width: 360,
      height: 240,
    },
  },
  onAdd(_ctx, addContext) {
    const outputs = getSourceOutputsSchema(addContext?.fromPort);

    return {
      id: `debug_output_${nanoid(5)}`,
      type: WorkflowNodeType.DebugOutput,
      data: {
        title: t('Debug Output_{{index}}', { index: ++index }),
        inputsValues: createInputsValuesFromOutputs(addContext?.fromPort?.node.id, outputs),
        inputs: cloneSchema(outputs),
        outputs,
      } satisfies DebugOutputNodeData,
    };
  },
  formMeta,
};
