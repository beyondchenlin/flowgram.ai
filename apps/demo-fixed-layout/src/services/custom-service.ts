/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { injectable, inject } from '@flowgram.ai/fixed-layout-editor';
import {
  FixedLayoutPluginContext,
  SelectionService,
  Playground,
  FlowDocument,
  StorageService,
  saveWorkflowDocument,
  type SaveWorkflowDocumentOptions,
  type WorkflowDocumentSaveResult,
} from '@flowgram.ai/fixed-layout-editor';

import { type FlowDocumentJSON } from '../typings';

export const DEMO_FIXED_LAYOUT_DOCUMENT_STORAGE_KEY = 'flowgram.demo.fixed-layout.document';

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
  @inject(FixedLayoutPluginContext) ctx: FixedLayoutPluginContext;

  @inject(SelectionService) selectionService: SelectionService;

  @inject(Playground) playground: Playground;

  @inject(FlowDocument) document: FlowDocument;

  save(
    options?: Pick<
      SaveWorkflowDocumentOptions<FlowDocumentJSON>,
      'blockOnValidationErrors' | 'validate'
    >
  ): Promise<WorkflowDocumentSaveResult<FlowDocumentJSON>> {
    return saveWorkflowDocument<FlowDocumentJSON>({
      document: this.document,
      storage: this.ctx.get(StorageService),
      storageKey: DEMO_FIXED_LAYOUT_DOCUMENT_STORAGE_KEY,
      ...options,
    });
  }
}
