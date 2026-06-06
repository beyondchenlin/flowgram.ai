/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

import { WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION } from './workflow-document-persistence';
import {
  activateWorkflowDocument,
  createWorkflowDocument,
  ensureWorkflowDocumentStore,
  getWorkflowDocumentRecords,
  loadWorkflowDocumentData,
  saveWorkflowDocumentData,
} from './workflow-document-manager';

class MemoryStorage {
  data = new Map<string, unknown>();

  setData<T>(key: string, data: T): void {
    this.data.set(key, data);
  }

  getData<T>(key: string, defaultValue?: T): T {
    return (this.data.has(key) ? this.data.get(key) : defaultValue) as T;
  }
}

const fallbackData = {
  nodes: [{ id: 'start_0', type: 'start' }],
  edges: [],
};

function createOptions(storage = new MemoryStorage()) {
  return {
    storage,
    indexStorageKey: 'demo.documents.index',
    documentStorageKeyPrefix: 'demo.documents.',
    defaultDocumentId: 'demo-default',
    defaultDocumentTitle: 'Demo Canvas',
    fallbackData,
    now: () => new Date('2026-06-06T06:00:00.000Z'),
    createId: () => 'doc-created',
  };
}

describe('workflow document manager', () => {
  it('creates an initial document index and persists the fallback document', () => {
    const options = createOptions();

    const store = ensureWorkflowDocumentStore(options);

    expect(store.index).toEqual({
      schemaVersion: 1,
      activeDocumentId: 'demo-default',
      records: [
        {
          id: 'demo-default',
          title: 'Demo Canvas',
          storageKey: 'demo.documents.demo-default',
          createdAt: '2026-06-06T06:00:00.000Z',
          updatedAt: '2026-06-06T06:00:00.000Z',
        },
      ],
    });
    expect(store.activeRecord.id).toBe('demo-default');
    expect(store.activeData).toEqual(fallbackData);
    expect(loadWorkflowDocumentData(options, 'demo-default')).toEqual(fallbackData);
  });

  it('migrates a legacy single-document snapshot into the document index', () => {
    const storage = new MemoryStorage();
    storage.setData('legacy.document', {
      schemaVersion: WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
      updatedAt: '2026-06-01T06:00:00.000Z',
      data: {
        nodes: [{ id: 'legacy_start', type: 'start' }],
        edges: [],
      },
    });

    const store = ensureWorkflowDocumentStore({
      ...createOptions(storage),
      legacyStorageKey: 'legacy.document',
    });

    expect(store.activeData).toEqual({
      nodes: [{ id: 'legacy_start', type: 'start' }],
      edges: [],
    });
    expect(store.activeRecord).toEqual({
      id: 'demo-default',
      title: 'Demo Canvas',
      storageKey: 'legacy.document',
      createdAt: '2026-06-01T06:00:00.000Z',
      updatedAt: '2026-06-01T06:00:00.000Z',
    });
  });

  it('creates a new active document with an independent storage key', () => {
    const options = createOptions();
    ensureWorkflowDocumentStore(options);

    const store = createWorkflowDocument(options, {
      title: 'Experiment',
      data: {
        nodes: [],
        edges: [],
      },
    });

    expect(store.index.activeDocumentId).toBe('doc-created');
    expect(store.index.records).toHaveLength(2);
    expect(store.activeRecord).toEqual({
      id: 'doc-created',
      title: 'Experiment',
      storageKey: 'demo.documents.doc-created',
      createdAt: '2026-06-06T06:00:00.000Z',
      updatedAt: '2026-06-06T06:00:00.000Z',
    });
    expect(loadWorkflowDocumentData(options, 'doc-created')).toEqual({
      nodes: [],
      edges: [],
    });
  });

  it('saves the current active document before creating a new active document', () => {
    const options = createOptions();
    ensureWorkflowDocumentStore(options);

    createWorkflowDocument(options, {
      title: 'Experiment',
      currentData: {
        nodes: [{ id: 'edited_default', type: 'start' }],
        edges: [],
      },
      data: {
        nodes: [{ id: 'experiment', type: 'start' }],
        edges: [],
      },
    });

    expect(loadWorkflowDocumentData(options, 'demo-default')).toEqual({
      nodes: [{ id: 'edited_default', type: 'start' }],
      edges: [],
    });
    expect(loadWorkflowDocumentData(options, 'doc-created')).toEqual({
      nodes: [{ id: 'experiment', type: 'start' }],
      edges: [],
    });
  });

  it('saves document data and returns records sorted by updated time', () => {
    const options = createOptions();
    ensureWorkflowDocumentStore(options);
    createWorkflowDocument(options, {
      title: 'Experiment',
      data: {
        nodes: [],
        edges: [],
      },
    });

    const savedRecord = saveWorkflowDocumentData(options, 'demo-default', {
      nodes: [{ id: 'saved', type: 'start' }],
      edges: [],
    });

    expect(savedRecord.updatedAt).toBe('2026-06-06T06:00:00.000Z');
    expect(loadWorkflowDocumentData(options, 'demo-default')).toEqual({
      nodes: [{ id: 'saved', type: 'start' }],
      edges: [],
    });
    expect(getWorkflowDocumentRecords(options).map((record) => record.id)).toEqual([
      'demo-default',
      'doc-created',
    ]);
  });

  it('activates an existing document and returns its stored data', () => {
    const options = createOptions();
    ensureWorkflowDocumentStore(options);
    createWorkflowDocument(options, {
      title: 'Experiment',
      data: {
        nodes: [{ id: 'experiment', type: 'start' }],
        edges: [],
      },
    });

    const store = activateWorkflowDocument(options, 'demo-default');

    expect(store.index.activeDocumentId).toBe('demo-default');
    expect(store.activeRecord.id).toBe('demo-default');
    expect(store.activeData).toEqual(fallbackData);
  });

  it('saves the current active document before activating another document', () => {
    const options = createOptions();
    ensureWorkflowDocumentStore(options);
    createWorkflowDocument(options, {
      title: 'Experiment',
      data: {
        nodes: [{ id: 'experiment', type: 'start' }],
        edges: [],
      },
    });

    const store = activateWorkflowDocument(options, 'demo-default', {
      currentData: {
        nodes: [{ id: 'edited_experiment', type: 'start' }],
        edges: [],
      },
    });

    expect(store.index.activeDocumentId).toBe('demo-default');
    expect(loadWorkflowDocumentData(options, 'doc-created')).toEqual({
      nodes: [{ id: 'edited_experiment', type: 'start' }],
      edges: [],
    });
  });
});
