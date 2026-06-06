/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { isNil } from 'lodash-es';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, BaseMessageLike } from '@langchain/core/messages';
import {
  ExecutionContext,
  ExecutionResult,
  FlowGramNode,
  INodeExecutor,
} from '@flowgram.ai/runtime-interface';

export interface LLMExecutorInputs {
  modelName: string;
  apiKey: string;
  apiHost: string;
  temperature: number;
  systemPrompt?: string;
  prompt: string;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  enableThinking?: boolean;
}

export class LLMExecutor implements INodeExecutor {
  public readonly type = FlowGramNode.LLM;

  public async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const inputs = context.inputs as LLMExecutorInputs;
    this.checkInputs(inputs);

    const {
      modelName,
      temperature,
      apiKey,
      apiHost,
      systemPrompt,
      prompt,
      maxTokens,
      timeout,
      maxRetries,
    } = inputs;

    const model = new ChatOpenAI({
      modelName,
      temperature,
      apiKey,
      configuration: {
        baseURL: apiHost,
      },
      maxRetries: maxRetries ?? 3,
      ...(maxTokens !== undefined ? { maxTokens } : {}),
      ...(timeout !== undefined ? { timeout } : {}),
      ...this.createProviderOptions(inputs),
    });

    const messages: BaseMessageLike[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(prompt));

    let apiMessage;
    try {
      apiMessage = await model.invoke(messages);
    } catch (error) {
      // 调用 LLM API 失败
      const errorMessage = (error as Error)?.message;
      if (errorMessage === 'Connection error.') {
        throw new Error(`Network error: unreachable api "${apiHost}"`);
      }
      throw error;
    }

    const result = apiMessage.content;
    return {
      outputs: {
        result,
      },
    };
  }

  protected checkInputs(inputs: LLMExecutorInputs) {
    const { modelName, temperature, apiKey, apiHost, prompt } = inputs;
    const missingInputs = [];

    if (!modelName) missingInputs.push('modelName');
    if (isNil(temperature)) missingInputs.push('temperature');
    if (!apiKey) missingInputs.push('apiKey');
    if (!apiHost) missingInputs.push('apiHost');
    if (!prompt) missingInputs.push('prompt');

    if (missingInputs.length > 0) {
      throw new Error(`LLM node missing required inputs: "${missingInputs.join('", "')}"`);
    }

    this.checkApiHost(apiHost);
    this.checkOptionalPositiveInteger(inputs.maxTokens, 'maxTokens');
    this.checkOptionalPositiveInteger(inputs.timeout, 'timeout');
    this.checkOptionalNonNegativeInteger(inputs.maxRetries, 'maxRetries');
    if (inputs.enableThinking !== undefined && typeof inputs.enableThinking !== 'boolean') {
      throw new Error(`Invalid LLM input "enableThinking": expected boolean`);
    }
  }

  private checkApiHost(apiHost: string): void {
    if (!apiHost || typeof apiHost !== 'string') {
      throw new Error(`Invalid API host format - ${apiHost}`);
    }

    const url = new URL(apiHost);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`Invalid API host protocol - ${url.protocol}`);
    }
  }

  private createProviderOptions(inputs: LLMExecutorInputs): {
    modelKwargs?: Record<string, boolean>;
  } {
    if (inputs.enableThinking === undefined) {
      return {};
    }

    return {
      modelKwargs: {
        enable_thinking: inputs.enableThinking,
      },
    };
  }

  private checkOptionalPositiveInteger(value: number | undefined, name: string): void {
    if (value === undefined) {
      return;
    }

    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`Invalid LLM input "${name}": expected a positive integer`);
    }
  }

  private checkOptionalNonNegativeInteger(value: number | undefined, name: string): void {
    if (value === undefined) {
      return;
    }

    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid LLM input "${name}": expected a non-negative integer`);
    }
  }
}
