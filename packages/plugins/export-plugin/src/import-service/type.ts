/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { PluginContext } from '@flowgram.ai/core';

import type { FlowImportFormat, WorkflowImportData } from './parser';

export interface WorkflowImportSuccessParams {
  file?: File;
  format: FlowImportFormat;
  data: WorkflowImportData;
}

export interface WorkflowImportErrorParams {
  file?: File;
  format?: FlowImportFormat;
  error: Error;
}

export interface WorkflowImportDropState {
  dragging: boolean;
  droppable: boolean;
}

export interface FlowImportServiceOptions {
  enableDrop?: boolean;
  maxFileSize?: number;
  fitViewAfterImport?: boolean;
  dropTarget?: HTMLElement | (() => HTMLElement | undefined);
  onImportSuccess?: (params: WorkflowImportSuccessParams) => void;
  onImportError?: (params: WorkflowImportErrorParams) => void;
  onDropStateChange?: (state: WorkflowImportDropState) => void;
  importData?: (ctx: PluginContext, data: WorkflowImportData) => void | Promise<void>;
}
