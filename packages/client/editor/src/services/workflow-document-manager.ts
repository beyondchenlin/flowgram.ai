/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import {
  WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
  type WorkflowDocumentPersistenceStorage,
  type WorkflowDocumentSaveSnapshot,
} from './workflow-document-persistence';

export const WORKFLOW_DOCUMENT_INDEX_SCHEMA_VERSION = 1;

export interface WorkflowDocumentRecord {
  id: string;
  title: string;
  storageKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDocumentIndex {
  schemaVersion: typeof WORKFLOW_DOCUMENT_INDEX_SCHEMA_VERSION;
  activeDocumentId: string;
  records: WorkflowDocumentRecord[];
}

export interface WorkflowDocumentStore<T> {
  index: WorkflowDocumentIndex;
  activeRecord: WorkflowDocumentRecord;
  activeData: T;
}

export interface WorkflowDocumentManagerOptions<T> {
  storage: WorkflowDocumentPersistenceStorage;
  indexStorageKey: string;
  documentStorageKeyPrefix: string;
  defaultDocumentId: string;
  defaultDocumentTitle: string;
  fallbackData: T;
  legacyStorageKey?: string;
  now?: () => Date;
  createId?: () => string;
}

export interface CreateWorkflowDocumentOptions<T> {
  title?: string;
  data?: T;
}

export function ensureWorkflowDocumentStore<T>(
  options: WorkflowDocumentManagerOptions<T>
): WorkflowDocumentStore<T> {
  const existingIndex = readWorkflowDocumentIndex(options.storage, options.indexStorageKey);
  if (existingIndex) {
    const activeRecord =
      existingIndex.records.find((record) => record.id === existingIndex.activeDocumentId) ??
      existingIndex.records[0];
    const normalizedIndex =
      activeRecord.id === existingIndex.activeDocumentId
        ? existingIndex
        : { ...existingIndex, activeDocumentId: activeRecord.id };
    if (normalizedIndex !== existingIndex) {
      writeWorkflowDocumentIndex(options.storage, options.indexStorageKey, normalizedIndex);
    }

    return {
      index: normalizedIndex,
      activeRecord,
      activeData: loadRecordData(options, activeRecord),
    };
  }

  return createInitialWorkflowDocumentStore(options);
}

export function createWorkflowDocument<T>(
  options: WorkflowDocumentManagerOptions<T>,
  createOptions: CreateWorkflowDocumentOptions<T> = {}
): WorkflowDocumentStore<T> {
  const currentStore = ensureWorkflowDocumentStore(options);
  const createdAt = getNowISOString(options);
  const id = createUniqueDocumentId(options, currentStore.index.records);
  const record: WorkflowDocumentRecord = {
    id,
    title: createOptions.title?.trim() || createDefaultTitle(currentStore.index.records.length + 1),
    storageKey: createDocumentStorageKey(options, id),
    createdAt,
    updatedAt: createdAt,
  };
  const activeData = createOptions.data ?? options.fallbackData;
  writeWorkflowDocumentSnapshot(options.storage, record.storageKey, activeData, createdAt);

  const index: WorkflowDocumentIndex = {
    ...currentStore.index,
    activeDocumentId: record.id,
    records: [...currentStore.index.records, record],
  };
  writeWorkflowDocumentIndex(options.storage, options.indexStorageKey, index);

  return {
    index,
    activeRecord: record,
    activeData,
  };
}

export function activateWorkflowDocument<T>(
  options: WorkflowDocumentManagerOptions<T>,
  documentId: string
): WorkflowDocumentStore<T> {
  const currentStore = ensureWorkflowDocumentStore(options);
  const activeRecord = currentStore.index.records.find((record) => record.id === documentId);
  if (!activeRecord) {
    throw new Error(`Workflow document "${documentId}" does not exist.`);
  }

  const index: WorkflowDocumentIndex = {
    ...currentStore.index,
    activeDocumentId: activeRecord.id,
  };
  writeWorkflowDocumentIndex(options.storage, options.indexStorageKey, index);

  return {
    index,
    activeRecord,
    activeData: loadRecordData(options, activeRecord),
  };
}

export function saveWorkflowDocumentData<T>(
  options: WorkflowDocumentManagerOptions<T>,
  documentId: string,
  data: T,
  updatedAt = getNowISOString(options)
): WorkflowDocumentRecord {
  const currentStore = ensureWorkflowDocumentStore(options);
  const record = currentStore.index.records.find((item) => item.id === documentId);
  if (!record) {
    throw new Error(`Workflow document "${documentId}" does not exist.`);
  }

  writeWorkflowDocumentSnapshot(options.storage, record.storageKey, data, updatedAt);
  const updatedRecord: WorkflowDocumentRecord = {
    ...record,
    updatedAt,
  };
  const index: WorkflowDocumentIndex = {
    ...currentStore.index,
    records: currentStore.index.records.map((item) =>
      item.id === updatedRecord.id ? updatedRecord : item
    ),
  };
  writeWorkflowDocumentIndex(options.storage, options.indexStorageKey, index);

  return updatedRecord;
}

export function loadWorkflowDocumentData<T>(
  options: WorkflowDocumentManagerOptions<T>,
  documentId: string
): T {
  const index = readWorkflowDocumentIndex(options.storage, options.indexStorageKey);
  const record = index?.records.find((item) => item.id === documentId);
  if (!record) {
    return options.fallbackData;
  }

  return loadRecordData(options, record);
}

export function getWorkflowDocumentRecords<T>(
  options: WorkflowDocumentManagerOptions<T>
): WorkflowDocumentRecord[] {
  const store = ensureWorkflowDocumentStore(options);
  return [...store.index.records].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function createInitialWorkflowDocumentStore<T>(
  options: WorkflowDocumentManagerOptions<T>
): WorkflowDocumentStore<T> {
  const legacySnapshot = options.legacyStorageKey
    ? readWorkflowDocumentSnapshot<T>(options.storage, options.legacyStorageKey)
    : undefined;
  const timestamp = legacySnapshot?.updatedAt ?? getNowISOString(options);
  const activeData = legacySnapshot?.data ?? options.fallbackData;
  const activeRecord: WorkflowDocumentRecord = {
    id: options.defaultDocumentId,
    title: options.defaultDocumentTitle,
    storageKey:
      options.legacyStorageKey && legacySnapshot
        ? options.legacyStorageKey
        : createDocumentStorageKey(options, options.defaultDocumentId),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (!legacySnapshot) {
    writeWorkflowDocumentSnapshot(options.storage, activeRecord.storageKey, activeData, timestamp);
  }

  const index: WorkflowDocumentIndex = {
    schemaVersion: WORKFLOW_DOCUMENT_INDEX_SCHEMA_VERSION,
    activeDocumentId: activeRecord.id,
    records: [activeRecord],
  };
  writeWorkflowDocumentIndex(options.storage, options.indexStorageKey, index);

  return {
    index,
    activeRecord,
    activeData,
  };
}

function loadRecordData<T>(
  options: WorkflowDocumentManagerOptions<T>,
  record: WorkflowDocumentRecord
): T {
  return (
    readWorkflowDocumentSnapshot<T>(options.storage, record.storageKey)?.data ??
    options.fallbackData
  );
}

function readWorkflowDocumentIndex(
  storage: WorkflowDocumentPersistenceStorage,
  storageKey: string
): WorkflowDocumentIndex | undefined {
  try {
    const candidate = storage.getData<unknown>(storageKey);
    if (!isWorkflowDocumentIndex(candidate)) {
      return;
    }

    return candidate;
  } catch {
    return;
  }
}

function writeWorkflowDocumentIndex(
  storage: WorkflowDocumentPersistenceStorage,
  storageKey: string,
  index: WorkflowDocumentIndex
): void {
  storage.setData(storageKey, index);
}

function readWorkflowDocumentSnapshot<T>(
  storage: WorkflowDocumentPersistenceStorage,
  storageKey: string
): WorkflowDocumentSaveSnapshot<T> | undefined {
  try {
    const candidate = storage.getData<unknown>(storageKey);
    if (!isWorkflowDocumentSaveSnapshot<T>(candidate)) {
      return;
    }

    return candidate;
  } catch {
    return;
  }
}

function writeWorkflowDocumentSnapshot<T>(
  storage: WorkflowDocumentPersistenceStorage,
  storageKey: string,
  data: T,
  updatedAt: string
): void {
  storage.setData<WorkflowDocumentSaveSnapshot<T>>(storageKey, {
    schemaVersion: WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
    updatedAt,
    data,
  });
}

function isWorkflowDocumentIndex(candidate: unknown): candidate is WorkflowDocumentIndex {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const index = candidate as Partial<WorkflowDocumentIndex>;
  return (
    index.schemaVersion === WORKFLOW_DOCUMENT_INDEX_SCHEMA_VERSION &&
    typeof index.activeDocumentId === 'string' &&
    Array.isArray(index.records) &&
    index.records.length > 0 &&
    index.records.every(isWorkflowDocumentRecord)
  );
}

function isWorkflowDocumentRecord(candidate: unknown): candidate is WorkflowDocumentRecord {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const record = candidate as Partial<WorkflowDocumentRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.storageKey === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

function isWorkflowDocumentSaveSnapshot<T>(
  candidate: unknown
): candidate is WorkflowDocumentSaveSnapshot<T> {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const snapshot = candidate as Partial<WorkflowDocumentSaveSnapshot<T>>;
  return (
    snapshot.schemaVersion === WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION &&
    typeof snapshot.updatedAt === 'string' &&
    snapshot.data !== undefined
  );
}

function createUniqueDocumentId<T>(
  options: WorkflowDocumentManagerOptions<T>,
  records: WorkflowDocumentRecord[]
): string {
  const usedIds = new Set(records.map((record) => record.id));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const id = options.createId?.() ?? createDefaultDocumentId();
    if (!usedIds.has(id)) {
      return id;
    }
  }

  return `${createDefaultDocumentId()}-${usedIds.size + 1}`;
}

function createDefaultDocumentId(): string {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDocumentStorageKey<T>(
  options: WorkflowDocumentManagerOptions<T>,
  id: string
): string {
  return `${options.documentStorageKeyPrefix}${id}`;
}

function createDefaultTitle(index: number): string {
  return `Untitled Canvas ${index}`;
}

function getNowISOString<T>(options: WorkflowDocumentManagerOptions<T>): string {
  return (options.now?.() ?? new Date()).toISOString();
}
