/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { IFlowValue } from '@flowgram.ai/form-materials';

import { WorkflowNodeType } from '../constants';
import type { FlowDocumentJSON, FlowNodeJSON } from '../../typings';

const defaultSystemPrompt = '# Role\nYou are an AI assistant.\n';

const legacyDemoLLMConfig = {
  modelName: 'gpt-3.5-turbo',
  apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  apiHost: 'https://mock-ai-url/api/v3',
  temperature: 0.5,
  systemPrompt: defaultSystemPrompt,
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
  temperature: normalizeNumberEnvConfig(
    process.env.FLOWGRAM_DEMO_LLM_TEMPERATURE,
    legacyDemoLLMConfig.temperature
  ),
  systemPrompt: normalizeEnvConfig(
    process.env.FLOWGRAM_DEMO_LLM_SYSTEM_PROMPT,
    legacyDemoLLMConfig.systemPrompt
  ),
  maxTokens: normalizeOptionalNumberEnvConfig(process.env.FLOWGRAM_DEMO_LLM_MAX_TOKENS),
  timeout: normalizeOptionalNumberEnvConfig(process.env.FLOWGRAM_DEMO_LLM_TIMEOUT),
  maxRetries: normalizeOptionalNumberEnvConfig(process.env.FLOWGRAM_DEMO_LLM_MAX_RETRIES),
  enableThinking: normalizeOptionalBooleanEnvConfig(process.env.FLOWGRAM_DEMO_LLM_ENABLE_THINKING),
} as const;

const demoLLMManagedConfigKey = 'demoLLMManagedConfig';
const managedValueFingerprintPrefix = 'v1:';

type LLMConfigKey = keyof typeof demoLLMConfig;
type LLMConfigValue = (typeof demoLLMConfig)[LLMConfigKey];
type DefinedLLMConfigValue = Exclude<LLMConfigValue, undefined>;
type DemoLLMManagedConfig = Partial<Record<LLMConfigKey, string>>;

export function createLLMInputSchema(): NonNullable<FlowNodeJSON['data']['inputs']> {
  return {
    type: 'object',
    required: ['modelName', 'apiKey', 'apiHost', 'temperature', 'prompt'],
    properties: {
      modelName: {
        type: 'string',
      },
      apiKey: {
        type: 'string',
      },
      apiHost: {
        type: 'string',
      },
      temperature: {
        type: 'number',
      },
      systemPrompt: {
        type: 'string',
        extra: {
          formComponent: 'prompt-editor',
        },
      },
      prompt: {
        type: 'string',
        extra: {
          formComponent: 'prompt-editor',
        },
      },
      maxTokens: {
        type: 'number',
      },
      timeout: {
        type: 'number',
      },
      maxRetries: {
        type: 'number',
      },
      enableThinking: {
        type: 'boolean',
      },
    },
  };
}

export function createLLMInputsValues(
  options: { prompt?: string } = {}
): Record<string, IFlowValue> {
  const inputsValues: Record<string, IFlowValue> = {
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
      content: demoLLMConfig.temperature,
    },
    systemPrompt: {
      type: 'template',
      content: demoLLMConfig.systemPrompt,
    },
    prompt: {
      type: 'template',
      content: options.prompt ?? '',
    },
  };

  setOptionalInputValue(inputsValues, 'maxTokens', demoLLMConfig.maxTokens);
  setOptionalInputValue(inputsValues, 'timeout', demoLLMConfig.timeout);
  setOptionalInputValue(inputsValues, 'maxRetries', demoLLMConfig.maxRetries);
  setOptionalInputValue(inputsValues, 'enableThinking', demoLLMConfig.enableThinking);

  return inputsValues;
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
    const nextInputSchema = createLLMInputSchema();
    const nextLLMDefaults = updateLLMDefaults(node.data);
    const inputSchemaChanged = !isSameJSONSchema(node.data.inputs, nextInputSchema);
    if (nextLLMDefaults.changed || inputSchemaChanged) {
      nextNode = {
        ...nextNode,
        data: {
          ...nextNode.data,
          inputs: inputSchemaChanged ? nextInputSchema : nextNode.data.inputs,
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
    const configuredValue = demoLLMConfig[key];
    const currentValue = nextInputsValues[key];
    if (configuredValue === undefined) {
      if (isManagedDefaultValue(key, currentValue, currentManagedConfig)) {
        delete nextInputsValues[key];
        changed = true;
      }
      return;
    }

    if (!currentValue) {
      nextInputsValues[key] = createLLMInputValue(key, configuredValue);
      nextManagedConfig[key] = createManagedValueFingerprint(configuredValue);
      changed = true;
      return;
    }

    if (!isManagedDefaultValue(key, currentValue, currentManagedConfig)) {
      return;
    }

    nextManagedConfig[key] = createManagedValueFingerprint(configuredValue);
    if (!isSameConfigContent(getFlowValueContent(currentValue), configuredValue)) {
      nextInputsValues[key] = createLLMInputValue(key, configuredValue);
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
): value is IFlowValue {
  const content = getFlowValueContent(value);
  if (content === undefined) {
    return false;
  }

  const previousManagedValue = managedConfig[key];
  if (previousManagedValue !== undefined) {
    return createManagedValueFingerprint(content) === previousManagedValue;
  }

  return (
    isSameConfigContent(content, getLegacyConfigValue(key)) ||
    isSameConfigContent(content, demoLLMConfig[key])
  );
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
  return (Object.keys(demoLLMConfig) as LLMConfigKey[]).reduce<DemoLLMManagedConfig>(
    (result, key) => {
      const value = demoLLMConfig[key];
      if (value !== undefined) {
        result[key] = createManagedValueFingerprint(value);
      }
      return result;
    },
    {}
  );
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
function createManagedValueFingerprint(value: DefinedLLMConfigValue): string {
  const fingerprintValue = String(value);
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < fingerprintValue.length; index++) {
    hash ^= BigInt(fingerprintValue.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }

  return `${managedValueFingerprintPrefix}${fingerprintValue.length}:${hash.toString(36)}`;
}

function normalizeEnvConfig(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function normalizeNumberEnvConfig(value: string | undefined, fallback: number): number {
  return normalizeOptionalNumberEnvConfig(value) ?? fallback;
}

function normalizeOptionalNumberEnvConfig(value: string | undefined): number | undefined {
  const normalizedValue = value?.trim();
  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function normalizeOptionalBooleanEnvConfig(value: string | undefined): boolean | undefined {
  const normalizedValue = value?.trim().toLowerCase();
  if (!normalizedValue) {
    return undefined;
  }

  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return undefined;
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

function setOptionalInputValue(
  inputsValues: Record<string, IFlowValue>,
  key: LLMConfigKey,
  value: LLMConfigValue
): void {
  if (value !== undefined) {
    inputsValues[key] = createLLMInputValue(key, value);
  }
}

function createLLMInputValue(key: LLMConfigKey, value: DefinedLLMConfigValue): IFlowValue {
  if (key === 'systemPrompt') {
    return {
      type: 'template',
      content: String(value),
    };
  }

  return {
    type: 'constant',
    content: value,
  };
}

function getFlowValueContent(value: IFlowValue | undefined): DefinedLLMConfigValue | undefined {
  if (!value || (value.type !== 'constant' && value.type !== 'template')) {
    return undefined;
  }

  const content = value.content;
  if (typeof content !== 'string' && typeof content !== 'number' && typeof content !== 'boolean') {
    return undefined;
  }

  return content;
}

function isSameConfigContent(
  left: DefinedLLMConfigValue | undefined,
  right: LLMConfigValue
): boolean {
  return left !== undefined && right !== undefined && left === right;
}

function getLegacyConfigValue(key: LLMConfigKey): LLMConfigValue {
  if (key in legacyDemoLLMConfig) {
    return legacyDemoLLMConfig[key as keyof typeof legacyDemoLLMConfig];
  }

  return undefined;
}

function isSameJSONSchema(
  left: FlowNodeJSON['data']['inputs'],
  right: NonNullable<FlowNodeJSON['data']['inputs']>
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
