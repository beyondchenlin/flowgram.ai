/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

/* eslint-disable import/no-relative-packages */
import { createEmptyCanvasData } from '../src/utils/canvas-document-data';
import { type WorkflowDocumentPersistenceStorage } from '../../../packages/client/editor/src/services/workflow-document-persistence';
import {
  createWorkflowDocument,
  ensureWorkflowDocumentStore,
} from '../../../packages/client/editor/src/services/workflow-document-manager';
/* eslint-enable import/no-relative-packages */

interface TestDocumentData {
  nodes: Array<{ id: string; type: string; data?: Record<string, unknown> }>;
  edges: unknown[];
}

class MemoryStorage implements WorkflowDocumentPersistenceStorage {
  private readonly data = new Map<string, unknown>();

  setData<T>(key: string, data: T): void {
    this.data.set(key, data);
  }

  getData<T>(key: string, defaultValue?: T): T {
    return (this.data.has(key) ? this.data.get(key) : defaultValue) as T;
  }
}

describe('demo free layout canvas document data', () => {
  it('creates a blank document for new canvases', () => {
    expect(createEmptyCanvasData()).toMatchObject({
      nodes: [
        {
          id: 'start_0',
          type: 'start',
          data: {
            title: '开始',
          },
        },
        {
          id: 'end_0',
          type: 'end',
          data: {
            title: '结束',
          },
        },
      ],
      edges: [
        {
          sourceNodeID: 'start_0',
          targetNodeID: 'end_0',
        },
      ],
      globalVariable: {
        type: 'object',
        properties: {},
      },
    });
  });

  it('restores the last active blank canvas instead of the demo initial canvas', () => {
    const storage = new MemoryStorage();
    ensureWorkflowDocumentStore(createManagerOptions(storage, createDemoInitialCanvasData()));

    const blankCanvas = createEmptyCanvasData();
    const createdStore = createWorkflowDocument(createManagerOptions(storage, blankCanvas), {
      data: blankCanvas,
    });

    const reopenedStore = ensureWorkflowDocumentStore(
      createManagerOptions(storage, createDemoInitialCanvasData())
    );

    expect(reopenedStore.activeRecord.id).toBe(createdStore.activeRecord.id);
    expect(reopenedStore.activeData.nodes).toHaveLength(2);
    expect(reopenedStore.activeData.nodes.map((node) => node.type)).toEqual(['start', 'end']);
    expect(reopenedStore.activeData.edges).toEqual([
      {
        sourceNodeID: 'start_0',
        targetNodeID: 'end_0',
      },
    ]);
  });
});

function createManagerOptions(
  storage: WorkflowDocumentPersistenceStorage,
  fallbackData: TestDocumentData
) {
  return {
    storage,
    indexStorageKey: 'flowgram.demo.free-layout.documents.index',
    documentStorageKeyPrefix: 'flowgram.demo.free-layout.document.',
    defaultDocumentId: 'default',
    defaultDocumentTitle: 'Default Canvas',
    fallbackData,
  };
}

function createDemoInitialCanvasData(): TestDocumentData {
  return {
    nodes: [
      {
        id: 'start_0',
        type: 'start',
        data: {
          title: 'Start',
        },
      },
    ],
    edges: [],
  };
}
