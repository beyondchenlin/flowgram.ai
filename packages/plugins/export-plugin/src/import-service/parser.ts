/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { load as loadYaml } from 'js-yaml';

export enum FlowImportFormat {
  JSON = 'json',
  YAML = 'yaml',
}

export interface ParseWorkflowDataOptions {
  format: FlowImportFormat;
  fileName?: string;
}

export type WorkflowImportData = Record<string, unknown> & {
  nodes: unknown[];
  edges?: unknown[];
};

const FLOW_IMPORT_EXTENSION_MAP: Record<string, FlowImportFormat> = {
  json: FlowImportFormat.JSON,
  yaml: FlowImportFormat.YAML,
  yml: FlowImportFormat.YAML,
};

export function detectFlowImportFormat(fileName: string): FlowImportFormat | undefined {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? FLOW_IMPORT_EXTENSION_MAP[extension] : undefined;
}

export function parseWorkflowData(
  content: string,
  options: ParseWorkflowDataOptions
): WorkflowImportData {
  if (!content.trim()) {
    throw new Error('Workflow file is empty.');
  }

  const data = options.format === FlowImportFormat.YAML ? loadYaml(content) : JSON.parse(content);

  return assertWorkflowImportData(data, options.fileName);
}

function assertWorkflowImportData(data: unknown, fileName?: string): WorkflowImportData {
  const fileLabel = fileName ? ` "${fileName}"` : '';

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Workflow file${fileLabel} must contain an object.`);
  }

  const workflow = data as Partial<WorkflowImportData>;

  if (!Array.isArray(workflow.nodes)) {
    throw new Error(`Workflow file${fileLabel} must contain a nodes array.`);
  }

  if (workflow.edges !== undefined && !Array.isArray(workflow.edges)) {
    throw new Error(`Workflow file${fileLabel} edges field must be an array.`);
  }

  return workflow as WorkflowImportData;
}
