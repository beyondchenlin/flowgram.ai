/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
  createBrowserStorageAdapter,
  loadWorkflowDocument,
  saveWorkflowDocument,
} from './workflow-document-persistence';

class MemoryStorage {
  data = new Map<string, unknown>();

  setData<T>(key: string, data: T): void {
    this.data.set(key, data);
  }

  getData<T>(key: string, defaultValue?: T): T {
    return (this.data.has(key) ? this.data.get(key) : defaultValue) as T;
  }
}

function createDocument<T>(data: T, invalid = false) {
  const form = {
    state: { invalid },
    validate: vi.fn(),
  };

  return {
    form,
    document: {
      getAllNodes: () => [{ form }],
      toJSON: () => data,
    },
  };
}

describe('workflow document persistence', () => {
  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('saves a versioned document snapshot after validating all node forms', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T06:00:00.000Z'));
    const storage = new MemoryStorage();
    const { document, form } = createDocument({
      nodes: [{ id: 'start_0', type: 'start' }],
    });

    const result = await saveWorkflowDocument({
      document,
      storage,
      storageKey: 'demo.document',
    });

    expect(form.validate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      saved: true,
      errorCount: 0,
      snapshot: {
        schemaVersion: WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
        updatedAt: '2026-06-06T06:00:00.000Z',
        data: {
          nodes: [{ id: 'start_0', type: 'start' }],
        },
      },
    });
    expect(loadWorkflowDocument(storage, 'demo.document', { nodes: [] })).toEqual({
      nodes: [{ id: 'start_0', type: 'start' }],
    });
  });

  it('saves a custom data payload when provided', async () => {
    const storage = new MemoryStorage();
    const { document } = createDocument({
      nodes: [{ id: 'start_0', type: 'start' }],
    });

    const result = await saveWorkflowDocument({
      document,
      storage,
      storageKey: 'demo.document',
      getData: () => ({
        nodes: [{ id: 'start_0', type: 'start' }],
        globalVariable: {
          variables: [{ key: 'city', type: 'string' }],
        },
      }),
    });

    expect(result.saved).toBe(true);
    expect(loadWorkflowDocument(storage, 'demo.document', { nodes: [] })).toEqual({
      nodes: [{ id: 'start_0', type: 'start' }],
      globalVariable: {
        variables: [{ key: 'city', type: 'string' }],
      },
    });
  });

  it('can save a draft without validating node forms', async () => {
    const storage = new MemoryStorage();
    const { document, form } = createDocument({
      nodes: [{ id: 'draft' }],
    });

    const result = await saveWorkflowDocument({
      document,
      storage,
      storageKey: 'demo.document',
      validate: false,
    });

    expect(form.validate).not.toHaveBeenCalled();
    expect(result).toEqual({
      saved: true,
      errorCount: 0,
      snapshot: expect.objectContaining({
        data: {
          nodes: [{ id: 'draft' }],
        },
      }),
    });
    expect(loadWorkflowDocument(storage, 'demo.document', { nodes: [] })).toEqual({
      nodes: [{ id: 'draft' }],
    });
  });

  it('blocks persistence by default when validation errors exist', async () => {
    const storage = new MemoryStorage();
    storage.setData('demo.document', {
      schemaVersion: WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
      updatedAt: '2026-06-06T06:00:00.000Z',
      data: { nodes: [{ id: 'previous' }] },
    });
    const { document } = createDocument({ nodes: [{ id: 'invalid' }] }, true);

    const result = await saveWorkflowDocument({
      document,
      storage,
      storageKey: 'demo.document',
    });

    expect(result).toEqual({ saved: false, errorCount: 1 });
    expect(loadWorkflowDocument(storage, 'demo.document', { nodes: [] })).toEqual({
      nodes: [{ id: 'previous' }],
    });
  });

  it('can persist a draft with validation errors when explicitly allowed', async () => {
    const storage = new MemoryStorage();
    storage.setData('demo.document', {
      schemaVersion: WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
      updatedAt: '2026-06-06T06:00:00.000Z',
      data: { nodes: [{ id: 'previous' }] },
    });
    const { document } = createDocument({ nodes: [{ id: 'invalid' }] }, true);

    const result = await saveWorkflowDocument({
      document,
      storage,
      storageKey: 'demo.document',
      blockOnValidationErrors: false,
    });

    expect(result.saved).toBe(true);
    expect(result.errorCount).toBe(1);
    expect(loadWorkflowDocument(storage, 'demo.document', { nodes: [] })).toEqual({
      nodes: [{ id: 'invalid' }],
    });
  });

  it('falls back to initial data when no compatible snapshot exists', () => {
    const storage = new MemoryStorage();
    const initialData = { nodes: [{ id: 'initial' }] };

    expect(loadWorkflowDocument(storage, 'demo.document', initialData)).toBe(initialData);

    storage.setData('demo.document', {
      schemaVersion: 0,
      updatedAt: '2026-06-06T06:00:00.000Z',
      data: { nodes: [{ id: 'old-version' }] },
    });
    expect(loadWorkflowDocument(storage, 'demo.document', initialData)).toBe(initialData);
  });

  it('uses a FlowGram scoped key for browser storage by default', () => {
    const storage = createBrowserStorageAdapter();

    storage.setData('demo.document', { nodes: [{ id: 'start_0' }] });

    expect(window.localStorage.getItem('flowgram:demo.document')).toBe(
      JSON.stringify({ nodes: [{ id: 'start_0' }] })
    );
  });

  it('reads legacy browser storage keys during prefix migration', () => {
    window.localStorage.setItem(
      '__gedit:demo.document',
      JSON.stringify({ nodes: [{ id: 'legacy' }] })
    );

    const storage = createBrowserStorageAdapter();

    expect(storage.getData('demo.document')).toEqual({ nodes: [{ id: 'legacy' }] });
  });
});
