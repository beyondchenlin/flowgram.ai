/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/i18n', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      Start: '开始',
      End: '结束',
    };
    return translations[key] ?? key;
  },
}));

/* eslint-disable import/no-relative-packages */
import { createEmptyCanvasData } from '../src/utils/canvas-document-data';
import { type FlowDocumentJSON } from '../src/typings';
import {
  DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_ID,
  DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_TITLE,
  DEMO_FREE_LAYOUT_DOCUMENT_INDEX_STORAGE_KEY,
  DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY,
  DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY_PREFIX,
} from '../src/services/document-storage-constants';
import {
  createBrowserStorageAdapter,
  type WorkflowDocumentPersistenceStorage,
} from '../../../packages/client/editor/src/services/workflow-document-persistence';
import {
  createWorkflowDocument,
  ensureWorkflowDocumentStore,
} from '../../../packages/client/editor/src/services/workflow-document-manager';
/* eslint-enable import/no-relative-packages */

class MemoryStorage implements WorkflowDocumentPersistenceStorage {
  private readonly data = new Map<string, unknown>();

  setData<T>(key: string, data: T): void {
    this.data.set(key, data);
  }

  getData<T>(key: string, defaultValue?: T): T {
    return (this.data.has(key) ? this.data.get(key) : defaultValue) as T;
  }
}

class BrowserStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe('demo free layout canvas document data', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('restores a new canvas through the demo browser storage key after reopening', () => {
    const localStorage = createStubbedBrowserStorage();
    const initialData = createDemoInitialCanvasData();
    const initialStorage = createBrowserStorageAdapter();

    ensureWorkflowDocumentStore(createManagerOptions(initialStorage, initialData));

    const blankCanvas = createEmptyCanvasData();
    const runtimeStorage = createBrowserStorageAdapter();
    const createdStore = createWorkflowDocument(createManagerOptions(runtimeStorage, blankCanvas), {
      data: blankCanvas,
    });

    expect(
      localStorage.getItem(`flowgram:${DEMO_FREE_LAYOUT_DOCUMENT_INDEX_STORAGE_KEY}`)
    ).toContain(createdStore.activeRecord.id);
    expect(
      localStorage.getItem(`__gedit:${DEMO_FREE_LAYOUT_DOCUMENT_INDEX_STORAGE_KEY}`)
    ).toBeNull();

    const reopenedStore = ensureWorkflowDocumentStore(
      createManagerOptions(createBrowserStorageAdapter(), initialData)
    );

    expect(reopenedStore.activeRecord.id).toBe(createdStore.activeRecord.id);
    expect(reopenedStore.activeData.nodes).toHaveLength(2);
    expect(reopenedStore.activeData.nodes.map((node) => node.type)).toEqual(['start', 'end']);
  });
});

function createManagerOptions(
  storage: WorkflowDocumentPersistenceStorage,
  fallbackData: FlowDocumentJSON
) {
  return {
    storage,
    indexStorageKey: DEMO_FREE_LAYOUT_DOCUMENT_INDEX_STORAGE_KEY,
    documentStorageKeyPrefix: DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY_PREFIX,
    defaultDocumentId: DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_ID,
    defaultDocumentTitle: DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_TITLE,
    fallbackData,
    legacyStorageKey: DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY,
  };
}

function createDemoInitialCanvasData(): FlowDocumentJSON {
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

function createStubbedBrowserStorage(): BrowserStorage {
  const localStorage = new BrowserStorage();
  vi.stubGlobal('window', { localStorage });
  return localStorage;
}
