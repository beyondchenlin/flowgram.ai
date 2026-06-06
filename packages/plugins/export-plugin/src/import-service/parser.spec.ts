/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

import { FlowImportFormat, detectFlowImportFormat, parseWorkflowData } from './parser';

describe('workflow import parser', () => {
  it('parses FlowGram YAML workflow data', () => {
    const data = parseWorkflowData(
      `
nodes:
  - id: start_0
    type: start
    meta:
      position:
        x: 0
        y: 0
    data:
      title: Start
edges:
  - sourceNodeID: start_0
    targetNodeID: end_0
`,
      {
        format: FlowImportFormat.YAML,
        fileName: 'workflow.yaml',
      }
    );

    expect(data).toEqual({
      nodes: [
        {
          id: 'start_0',
          type: 'start',
          meta: {
            position: {
              x: 0,
              y: 0,
            },
          },
          data: {
            title: 'Start',
          },
        },
      ],
      edges: [
        {
          sourceNodeID: 'start_0',
          targetNodeID: 'end_0',
        },
      ],
    });
  });

  it('parses FlowGram JSON workflow data', () => {
    const data = parseWorkflowData('{"nodes":[{"id":"start_0","type":"start"}],"edges":[]}', {
      format: FlowImportFormat.JSON,
      fileName: 'workflow.json',
    });

    expect(data).toEqual({
      nodes: [{ id: 'start_0', type: 'start' }],
      edges: [],
    });
  });

  it('rejects YAML that is not workflow-shaped', () => {
    expect(() =>
      parseWorkflowData('name: not a workflow', {
        format: FlowImportFormat.YAML,
        fileName: 'bad.yaml',
      })
    ).toThrow('nodes');
  });

  it('detects supported workflow file extensions', () => {
    expect(detectFlowImportFormat('workflow.yaml')).toBe(FlowImportFormat.YAML);
    expect(detectFlowImportFormat('workflow.yml')).toBe(FlowImportFormat.YAML);
    expect(detectFlowImportFormat('workflow.json')).toBe(FlowImportFormat.JSON);
    expect(detectFlowImportFormat('workflow.txt')).toBeUndefined();
  });
});
