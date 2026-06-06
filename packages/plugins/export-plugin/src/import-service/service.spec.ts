/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest';

import { FlowImportService } from './service';
import { FlowImportFormat } from './parser';

function createContext(readonly = false) {
  const fromJSON = vi.fn();
  const fitView = vi.fn(() => Promise.resolve());
  const node = document.createElement('div');

  return {
    playground: {
      node,
      config: {
        readonly,
      },
    },
    document: {
      fromJSON,
    },
    operation: {
      fromJSON,
    },
    tools: {
      fitView,
    },
  };
}

async function waitForAssertion(assertion: () => void): Promise<void> {
  let lastError: unknown;

  for (let index = 0; index < 10; index++) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  throw lastError;
}

describe('FlowImportService', () => {
  it('imports a YAML file into the workflow operation and fits view', async () => {
    const ctx = createContext();
    const onImportSuccess = vi.fn();
    const service = new FlowImportService();

    service.init(ctx as any, {
      enableDrop: false,
      onImportSuccess,
    });

    const file = new File(
      [
        `
nodes:
  - id: start_0
    type: start
edges: []
`,
      ],
      'workflow.yaml',
      { type: 'application/x-yaml' }
    );

    await service.importFile(file);

    expect(ctx.operation.fromJSON).toHaveBeenCalledWith({
      nodes: [{ id: 'start_0', type: 'start' }],
      edges: [],
    });
    expect(ctx.tools.fitView).toHaveBeenCalledWith(false);
    expect(onImportSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        file,
        format: FlowImportFormat.YAML,
      })
    );
  });

  it('rejects import while the playground is readonly', async () => {
    const ctx = createContext(true);
    const onImportError = vi.fn();
    const service = new FlowImportService();

    service.init(ctx as any, {
      enableDrop: false,
      onImportError,
    });

    const file = new File(['{"nodes":[]}'], 'workflow.json', { type: 'application/json' });

    await expect(service.importFile(file)).rejects.toThrow('readonly');
    expect(ctx.operation.fromJSON).not.toHaveBeenCalled();
    expect(onImportError).toHaveBeenCalledWith(
      expect.objectContaining({
        file,
        format: FlowImportFormat.JSON,
      })
    );
  });

  it('rejects multiple dropped workflow files', async () => {
    const ctx = createContext();
    const onImportError = vi.fn();
    const service = new FlowImportService();

    service.init(ctx as any, {
      enableDrop: false,
      onImportError,
    });

    const first = new File(['{"nodes":[]}'], 'one.json', { type: 'application/json' });
    const second = new File(['{"nodes":[]}'], 'two.json', { type: 'application/json' });

    await expect(service.importFiles([first, second])).rejects.toThrow('one workflow file');
    expect(ctx.operation.fromJSON).not.toHaveBeenCalled();
    expect(onImportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
      })
    );
  });

  it('imports a dropped YAML file from the bound playground node', async () => {
    const ctx = createContext();
    const service = new FlowImportService();

    service.init(ctx as any);
    service.bindDropTarget();

    const file = new File(
      [
        `
nodes:
  - id: dropped_0
    type: start
edges: []
`,
      ],
      'dropped.yml',
      { type: 'application/x-yaml' }
    );
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: {
        types: ['Files'],
        files: [file],
      },
    });

    ctx.playground.node.dispatchEvent(event);

    await waitForAssertion(() => {
      expect(ctx.operation.fromJSON).toHaveBeenCalledWith({
        nodes: [{ id: 'dropped_0', type: 'start' }],
        edges: [],
      });
    });
  });
});
