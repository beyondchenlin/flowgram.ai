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
  apiHost: normalizeApiHostConfig(
    process.env.FLOWGRAM_DEMO_LLM_API_HOST,
    legacyDemoLLMConfig.apiHost
  ),
} as const;

const defaultSystemPrompt = '# Role\nYou are an AI assistant.\n';
const demoLLMManagedConfigKey = 'demoLLMManagedConfig';
const managedValueFingerprintPrefix = 'v1:';

type LLMConfigKey = keyof typeof demoLLMConfig;
type DemoLLMManagedConfig = Partial<Record<LLMConfigKey, string>>;

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

export function createLLMDefaultData(options: { prompt?: string } = {}): {
  inputsValues: Record<string, IFlowValue>;
  [demoLLMManagedConfigKey]: DemoLLMManagedConfig;
} {
  return {
    inputsValues: createLLMInputsValues(options),
    [demoLLMManagedConfigKey]: createManagedConfig(),
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
    const nextLLMDefaults = updateLLMDefaults(node.data);
    if (nextLLMDefaults.changed) {
      nextNode = {
        ...nextNode,
        data: {
          ...nextNode.data,
          inputsValues: nextLLMDefaults.inputsValues,
          [demoLLMManagedConfigKey]: nextLLMDefaults.managedConfig,
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

function updateLLMDefaults(data: FlowNodeJSON['data']): {
  inputsValues: Record<string, IFlowValue> | undefined;
  managedConfig: DemoLLMManagedConfig;
  changed: boolean;
} {
  const inputsValues = data.inputsValues;
  const currentManagedConfig = normalizeManagedConfig(data[demoLLMManagedConfigKey]);
  if (!inputsValues) {
    return {
      inputsValues,
      managedConfig: currentManagedConfig,
      changed: false,
    };
  }

  let changed = false;
  const nextInputsValues = { ...inputsValues };
  const nextManagedConfig: DemoLLMManagedConfig = {};
  (Object.keys(demoLLMConfig) as LLMConfigKey[]).forEach((key) => {
    const currentValue = nextInputsValues[key];
    if (!isManagedDefaultValue(key, currentValue, currentManagedConfig)) {
      return;
    }

    nextManagedConfig[key] = createManagedValueFingerprint(demoLLMConfig[key]);
    if (currentValue.content !== demoLLMConfig[key]) {
      nextInputsValues[key] = {
        ...currentValue,
        content: demoLLMConfig[key],
      };
      changed = true;
    }
  });

  if (!isSameManagedConfig(currentManagedConfig, nextManagedConfig)) {
    changed = true;
  }

  return {
    inputsValues: nextInputsValues,
    managedConfig: nextManagedConfig,
    changed,
  };
}

function isManagedDefaultValue(
  key: LLMConfigKey,
  value: IFlowValue | undefined,
  managedConfig: DemoLLMManagedConfig
): value is IFlowConstantValue {
  if (value?.type !== 'constant' || typeof value.content !== 'string') {
    return false;
  }

  const previousManagedValue = managedConfig[key];
  if (previousManagedValue !== undefined) {
    return createManagedValueFingerprint(value.content) === previousManagedValue;
  }

  return value.content === legacyDemoLLMConfig[key] || value.content === demoLLMConfig[key];
}

function normalizeManagedConfig(value: unknown): DemoLLMManagedConfig {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const candidate = value as Partial<Record<string, unknown>>;
  return (Object.keys(demoLLMConfig) as LLMConfigKey[]).reduce<DemoLLMManagedConfig>(
    (result, key) => {
      if (typeof candidate[key] === 'string') {
        result[key] = normalizeManagedValueFingerprint(candidate[key]);
      }
      return result;
    },
    {}
  );
}

function createManagedConfig(): DemoLLMManagedConfig {
  return {
    modelName: createManagedValueFingerprint(demoLLMConfig.modelName),
    apiKey: createManagedValueFingerprint(demoLLMConfig.apiKey),
    apiHost: createManagedValueFingerprint(demoLLMConfig.apiHost),
  };
}

function isSameManagedConfig(left: DemoLLMManagedConfig, right: DemoLLMManagedConfig): boolean {
  return (Object.keys(demoLLMConfig) as LLMConfigKey[]).every((key) => left[key] === right[key]);
}

function normalizeManagedValueFingerprint(value: string): string {
  if (value.startsWith(managedValueFingerprintPrefix)) {
    return value;
  }

  return createManagedValueFingerprint(value);
}

// Keep managed-default detection without duplicating API keys in document metadata.
function createManagedValueFingerprint(value: string): string {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < value.length; index++) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }

  return `${managedValueFingerprintPrefix}${value.length}:${hash.toString(36)}`;
}

function normalizeEnvConfig(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function normalizeApiHostConfig(value: string | undefined, fallback: string): string {
  const apiHost = normalizeEnvConfig(value, fallback);

  try {
    const url = new URL(apiHost);
    const pathname = url.pathname.replace(/\/+$/, '');
    if (!pathname) {
      url.pathname = '/v1';
      return url.toString();
    }

    url.pathname = pathname;
    return url.toString();
  } catch {
    return apiHost;
  }
}
