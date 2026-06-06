/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { IFlowConstantValue, IFlowValue } from '@flowgram.ai/form-materials';

import { WorkflowNodeType } from '../constants';
import type { FlowDocumentJSON, FlowNodeJSON } from '../../typings';

const legacyDemoLLMConfig = {
  modelName: 'gpt-3.5-turbo',
  apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  apiHost: 'https://mock-ai-url/api/v3',
} as const;

export const demoLLMConfig = {
  modelName: normalizeEnvConfig(
    process.env.FLOWGRAM_DEMO_LLM_MODEL_NAME,
    legacyDemoLLMConfig.modelName
  ),
  apiKey: normalizeEnvConfig(process.env.FLOWGRAM_DEMO_LLM_API_KEY, legacyDemoLLMConfig.apiKey),
  apiHost: normalizeEnvConfig(process.env.FLOWGRAM_DEMO_LLM_API_HOST, legacyDemoLLMConfig.apiHost),
} as const;

const defaultSystemPrompt = '# Role\nYou are an AI assistant.\n';

type LLMConfigKey = keyof typeof demoLLMConfig;

export function createLLMInputsValues(
  options: { prompt?: string } = {}
): Record<string, IFlowValue> {
  return {
    modelName: {
      type: 'constant',
      content: demoLLMConfig.modelName,
    },
    apiKey: {
      type: 'constant',
      content: demoLLMConfig.apiKey,
    },
    apiHost: {
      type: 'constant',
      content: demoLLMConfig.apiHost,
    },
    temperature: {
      type: 'constant',
      content: 0.5,
    },
    systemPrompt: {
      type: 'template',
      content: defaultSystemPrompt,
    },
    prompt: {
      type: 'template',
      content: options.prompt ?? '',
    },
  };
}

export function applyDemoLLMConfig(document: FlowDocumentJSON): FlowDocumentJSON {
  const nextNodes = updateNodes(document.nodes);
  if (!nextNodes.changed) {
    return document;
  }

  return {
    ...document,
    nodes: nextNodes.nodes,
  };
}

function updateNodes(nodes: FlowNodeJSON[]): { nodes: FlowNodeJSON[]; changed: boolean } {
  let changed = false;
  const nextNodes = nodes.map((node) => {
    const nextNode = updateNode(node);
    changed ||= nextNode.changed;
    return nextNode.node;
  });

  return {
    nodes: nextNodes,
    changed,
  };
}

function updateNode(node: FlowNodeJSON): { node: FlowNodeJSON; changed: boolean } {
  let nextNode = node;
  let changed = false;

  if (node.type === WorkflowNodeType.LLM) {
    const nextInputsValues = updateLLMInputsValues(node.data.inputsValues);
    if (nextInputsValues.changed) {
      nextNode = {
        ...nextNode,
        data: {
          ...nextNode.data,
          inputsValues: nextInputsValues.inputsValues,
        },
      };
      changed = true;
    }
  }

  const blocks = nextNode.blocks as FlowNodeJSON[] | undefined;
  if (blocks?.length) {
    const nextBlocks = updateNodes(blocks);
    if (nextBlocks.changed) {
      nextNode = {
        ...nextNode,
        blocks: nextBlocks.nodes,
      };
      changed = true;
    }
  }

  return {
    node: nextNode,
    changed,
  };
}

function updateLLMInputsValues(inputsValues: Record<string, IFlowValue> | undefined): {
  inputsValues: Record<string, IFlowValue> | undefined;
  changed: boolean;
} {
  if (!inputsValues) {
    return {
      inputsValues,
      changed: false,
    };
  }

  let changed = false;
  const nextInputsValues = { ...inputsValues };
  (Object.keys(demoLLMConfig) as LLMConfigKey[]).forEach((key) => {
    const currentValue = nextInputsValues[key];
    if (!shouldReplaceInputValue(key, currentValue)) {
      return;
    }

    nextInputsValues[key] = {
      ...currentValue,
      content: demoLLMConfig[key],
    };
    changed = true;
  });

  return {
    inputsValues: nextInputsValues,
    changed,
  };
}

function shouldReplaceInputValue(
  key: LLMConfigKey,
  value: IFlowValue | undefined
): value is IFlowConstantValue {
  if (demoLLMConfig[key] === legacyDemoLLMConfig[key]) {
    return false;
  }

  return value?.type === 'constant' && value.content === legacyDemoLLMConfig[key];
}

function normalizeEnvConfig(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}
