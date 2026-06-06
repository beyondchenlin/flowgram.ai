/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export const WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION = 1;

const DEFAULT_STORAGE_PREFIX = 'flowgram:';
const LEGACY_DEFAULT_STORAGE_PREFIXES = ['__gedit:'];

export interface WorkflowDocumentPersistenceStorage {
  setData<T>(key: string, data: T): void;

  getData<T>(key: string, defaultValue?: T): T;
}

export interface WorkflowDocumentSaveSnapshot<T> {
  schemaVersion: typeof WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION;
  updatedAt: string;
  data: T;
}

interface WorkflowDocumentFormLike {
  state?: {
    invalid?: boolean;
  };
  validate?: () => unknown | Promise<unknown>;
}

interface WorkflowDocumentNodeLike {
  form?: WorkflowDocumentFormLike;
}

export interface WorkflowDocumentPersistenceLike<T> {
  getAllNodes(): WorkflowDocumentNodeLike[];

  toJSON(): T;
}

export type WorkflowDocumentSaveResult<T> =
  | {
      saved: true;
      errorCount: number;
      snapshot: WorkflowDocumentSaveSnapshot<T>;
    }
  | {
      saved: false;
      errorCount: number;
    };

export interface WorkflowDocumentSaveOptions {
  /**
   * Validate every node form before persisting. Disable this for draft auto-save flows.
   */
  validate?: boolean;
  /**
   * Keep the previous snapshot when validation errors exist. Defaults to true for committed saves.
   */
  blockOnValidationErrors?: boolean;
}

export interface SaveWorkflowDocumentOptions<T> extends WorkflowDocumentSaveOptions {
  document: WorkflowDocumentPersistenceLike<unknown>;
  storage: WorkflowDocumentPersistenceStorage;
  storageKey: string;
  getData?: () => T;
}

export async function validateWorkflowDocumentForms<T>(
  document: WorkflowDocumentPersistenceLike<T>
): Promise<number> {
  const forms = document
    .getAllNodes()
    .map((node) => node.form)
    .filter((form): form is WorkflowDocumentFormLike => Boolean(form));

  await Promise.all(forms.map(async (form) => form.validate?.()));

  return forms.filter((form) => form.state?.invalid).length;
}

export async function saveWorkflowDocument<T>({
  document,
  storage,
  storageKey,
  getData,
  validate = true,
  blockOnValidationErrors = true,
}: SaveWorkflowDocumentOptions<T>): Promise<WorkflowDocumentSaveResult<T>> {
  const errorCount = validate ? await validateWorkflowDocumentForms(document) : 0;
  if (blockOnValidationErrors && errorCount > 0) {
    return {
      saved: false,
      errorCount,
    };
  }

  const snapshot: WorkflowDocumentSaveSnapshot<T> = {
    schemaVersion: WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    data: getData ? getData() : (document.toJSON() as T),
  };

  storage.setData(storageKey, snapshot);

  return {
    saved: true,
    errorCount,
    snapshot,
  };
}

export function loadWorkflowDocument<T>(
  storage: WorkflowDocumentPersistenceStorage,
  storageKey: string,
  fallbackData: T
): T {
  try {
    const snapshot = storage.getData<unknown>(storageKey);
    if (!isWorkflowDocumentSaveSnapshot<T>(snapshot)) {
      return fallbackData;
    }
    return snapshot.data;
  } catch {
    return fallbackData;
  }
}

export function createBrowserStorageAdapter(
  prefix = DEFAULT_STORAGE_PREFIX
): WorkflowDocumentPersistenceStorage {
  const readPrefixes =
    prefix === DEFAULT_STORAGE_PREFIX
      ? [DEFAULT_STORAGE_PREFIX, ...LEGACY_DEFAULT_STORAGE_PREFIXES]
      : [prefix];

  return {
    setData<T>(key: string, data: T): void {
      window.localStorage.setItem(`${prefix}${key}`, JSON.stringify(data));
    },
    getData<T>(key: string, defaultValue?: T): T {
      const rawData = readPrefixes
        .map((readPrefix) => window.localStorage.getItem(`${readPrefix}${key}`))
        .find((item): item is string => item !== null);
      if (rawData === undefined) {
        return defaultValue as T;
      }
      return JSON.parse(rawData) as T;
    },
  };
}

function isWorkflowDocumentSaveSnapshot<T>(
  snapshot: unknown
): snapshot is WorkflowDocumentSaveSnapshot<T> {
  if (!snapshot || typeof snapshot !== 'object') {
    return false;
  }

  const candidate = snapshot as Partial<WorkflowDocumentSaveSnapshot<T>>;
  return (
    candidate.schemaVersion === WORKFLOW_DOCUMENT_SAVE_SCHEMA_VERSION &&
    typeof candidate.updatedAt === 'string' &&
    candidate.data !== undefined
  );
}
