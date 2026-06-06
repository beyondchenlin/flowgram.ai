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
  saveWorkflowDocument,
  type SaveWorkflowDocumentOptions,
  type WorkflowDocumentSaveResult,
} from '@flowgram.ai/free-layout-editor';

import { type FlowDocumentJSON } from '../typings';
import { GetGlobalVariableSchema } from '../plugins/variable-panel-plugin';

export const DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY = 'flowgram.demo.free-layout.document';

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
  @inject(FreeLayoutPluginContext) ctx: FreeLayoutPluginContext;

  @inject(SelectionService) selectionService: SelectionService;

  @inject(Playground) playground: Playground;

  @inject(WorkflowDocument) document: WorkflowDocument;

  save(
    options?: Pick<
      SaveWorkflowDocumentOptions<FlowDocumentJSON>,
      'blockOnValidationErrors' | 'validate'
    >
  ): Promise<WorkflowDocumentSaveResult<FlowDocumentJSON>> {
    return saveWorkflowDocument<FlowDocumentJSON>({
      document: this.document,
      storage: this.ctx.get(StorageService),
      storageKey: DEMO_FREE_LAYOUT_DOCUMENT_STORAGE_KEY,
      ...options,
      getData: () => ({
        ...(this.document.toJSON() as FlowDocumentJSON),
        globalVariable: this.ctx.get<GetGlobalVariableSchema>(GetGlobalVariableSchema)(),
      }),
    });
  }
}
