/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { definePluginCreator, type PluginContext } from '@flowgram.ai/core';

import { FlowImportService, type FlowImportServiceOptions } from './import-service';

export interface CreateImportPluginOptions extends Partial<FlowImportServiceOptions> {}

export const createImportPlugin = definePluginCreator<CreateImportPluginOptions>({
  onBind: ({ bind }) => {
    bind(FlowImportService).toSelf().inSingletonScope();
  },
  onInit: (ctx: PluginContext, opts: CreateImportPluginOptions) => {
    ctx.get(FlowImportService).init(ctx, opts);
  },
  onReady: (ctx: PluginContext, opts: CreateImportPluginOptions) => {
    if (opts.enableDrop !== false) {
      ctx.get(FlowImportService).bindDropTarget();
    }
  },
  onDispose: (ctx: PluginContext) => {
    ctx.get(FlowImportService).dispose();
  },
});
