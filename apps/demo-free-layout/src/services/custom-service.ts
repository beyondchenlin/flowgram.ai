/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { injectable, inject } from '@flowgram.ai/free-layout-editor';
import {
  FreeLayoutPluginContext,
  SelectionService,
  Playground,
  WorkflowDocument,
  StorageService,
  activateWorkflowDocument,
  createWorkflowDocument,
  ensureWorkflowDocumentStore,
  getWorkflowDocumentRecords,
  saveWorkflowDocumentData,
  saveWorkflowDocument,
  type SaveWorkflowDocumentOptions,
  type WorkflowDocumentManagerOptions,
  type WorkflowDocumentPersistenceStorage,
  type WorkflowDocumentRecord,
  type WorkflowDocumentSaveResult,
  type WorkflowDocumentStore,
} from '@flowgram.ai/free-layout-editor';

import { type FlowDocumentJSON } from '../typings';
import { GetGlobalVariableSchema, SetGlobalVariableSchema } from '../plugins/variable-panel-plugin';
import { applyDemoLLMConfig } from '../nodes/llm/defaults';
import { t } from '../i18n';
import { DocumentOperationQueue } from './document-operation-queue';

export const DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY = 'flowgram.demo.free-layout.document';
export const DEMO_FREE_LAYOUT_DOCUMENT_INDEX_STORAGE_KEY =
  'flowgram.demo.free-layout.documents.index';
export const DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY_PREFIX = 'flowgram.demo.free-layout.document.';
export const DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_ID = 'default';
export const DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_TITLE = 'Default Canvas';

export function createDemoWorkflowDocumentManagerOptions(
  storage: WorkflowDocumentPersistenceStorage,
  fallbackData: FlowDocumentJSON
): WorkflowDocumentManagerOptions<FlowDocumentJSON> {
  return {
    storage,
    indexStorageKey: DEMO_FREE_LAYOUT_DOCUMENT_INDEX_STORAGE_KEY,
    documentStorageKeyPrefix: DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY_PREFIX,
    defaultDocumentId: DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_ID,
    defaultDocumentTitle: t(DEMO_FREE_LAYOUT_DEFAULT_DOCUMENT_TITLE),
    fallbackData,
    legacyStorageKey: DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY,
  };
}

/**
 * Docs: https://inversify.io/docs/introduction/getting-started/
 * Warning: Use decorator legacy
 *   // rsbuild.config.ts
 *   {
 *     source: {
 *       decorators: {
 *         version: 'legacy'
 *       }
 *     }
 *   }
 * Usage:
 *  1.
 *    const myService = useService(CustomService)
 *    myService.save()
 *  2.
 *    const myService = useClientContext().get(CustomService)
 *  3.
 *    const myService = node.getService(CustomService)
 */
@injectable()
export class CustomService {
  private readonly documentOperations = new DocumentOperationQueue();

  @inject(FreeLayoutPluginContext) ctx: FreeLayoutPluginContext;

  @inject(SelectionService) selectionService: SelectionService;

  @inject(Playground) playground: Playground;

  @inject(WorkflowDocument) document: WorkflowDocument;

  async save(
    options?: Pick<
      SaveWorkflowDocumentOptions<FlowDocumentJSON>,
      'blockOnValidationErrors' | 'validate'
    >
  ): Promise<WorkflowDocumentSaveResult<FlowDocumentJSON>> {
    return this.documentOperations.run(() => this.saveNow(options));
  }

  private async saveNow(
    options?: Pick<
      SaveWorkflowDocumentOptions<FlowDocumentJSON>,
      'blockOnValidationErrors' | 'validate'
    >
  ): Promise<WorkflowDocumentSaveResult<FlowDocumentJSON>> {
    const store = this.getDocumentStore();
    const result = await saveWorkflowDocument<FlowDocumentJSON>({
      document: this.document,
      storage: this.ctx.get(StorageService),
      storageKey: store.activeRecord.storageKey,
      ...options,
      getData: () => this.getCurrentDocumentData(),
    });

    if (result.saved) {
      saveWorkflowDocumentData(
        this.getManagerOptions(result.snapshot.data),
        store.activeRecord.id,
        result.snapshot.data,
        result.snapshot.updatedAt
      );
    }

    return result;
  }

  getDocumentStore(
    fallbackData = this.getCurrentDocumentData()
  ): WorkflowDocumentStore<FlowDocumentJSON> {
    return ensureWorkflowDocumentStore(this.getManagerOptions(fallbackData));
  }

  getDocumentRecords(fallbackData = this.getCurrentDocumentData()): WorkflowDocumentRecord[] {
    return getWorkflowDocumentRecords(this.getManagerOptions(fallbackData));
  }

  createDocument(
    data: FlowDocumentJSON,
    title?: string
  ): Promise<WorkflowDocumentStore<FlowDocumentJSON>> {
    return this.documentOperations.run(() => this.createDocumentNow(data, title));
  }

  private createDocumentNow(
    data: FlowDocumentJSON,
    title?: string
  ): WorkflowDocumentStore<FlowDocumentJSON> {
    const nextData = applyDemoLLMConfig(data);
    const currentData = this.getCurrentDocumentData();
    const store = createWorkflowDocument(this.getManagerOptions(nextData), {
      title,
      currentData,
      data: nextData,
    });
    this.applyDocumentData(store.activeData);
    return store;
  }

  openDocument(
    documentId: string,
    fallbackData?: FlowDocumentJSON
  ): Promise<WorkflowDocumentStore<FlowDocumentJSON>> {
    return this.documentOperations.run(() => this.openDocumentNow(documentId, fallbackData));
  }

  private openDocumentNow(
    documentId: string,
    fallbackData?: FlowDocumentJSON
  ): WorkflowDocumentStore<FlowDocumentJSON> {
    const currentData = this.getCurrentDocumentData();
    const options = this.getManagerOptions(fallbackData ?? currentData);
    const store = activateWorkflowDocument(options, documentId, {
      currentData,
    });
    const nextData = applyDemoLLMConfig(store.activeData);
    if (nextData !== store.activeData) {
      saveWorkflowDocumentData(options, store.activeRecord.id, nextData);
    }
    this.applyDocumentData(nextData);

    return {
      ...store,
      activeData: nextData,
    };
  }

  private getManagerOptions(
    fallbackData: FlowDocumentJSON
  ): WorkflowDocumentManagerOptions<FlowDocumentJSON> {
    return createDemoWorkflowDocumentManagerOptions(this.ctx.get(StorageService), fallbackData);
  }

  private getCurrentDocumentData(): FlowDocumentJSON {
    return {
      ...(this.document.toJSON() as FlowDocumentJSON),
      globalVariable: this.ctx.get<GetGlobalVariableSchema>(GetGlobalVariableSchema)(),
    };
  }

  private applyDocumentData(data: FlowDocumentJSON): void {
    this.ctx.history.stop();
    try {
      this.document.fromJSON(data);
      this.ctx.history.clear();
      this.ctx.get<SetGlobalVariableSchema>(SetGlobalVariableSchema)(data.globalVariable);
    } finally {
      this.ctx.history.start();
    }

    setTimeout(() => {
      void this.ctx.tools.fitView(false);
    }, 0);
  }
}
