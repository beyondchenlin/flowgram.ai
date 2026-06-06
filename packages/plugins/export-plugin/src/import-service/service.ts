/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { injectable } from 'inversify';
import { Disposable, DisposableCollection, Emitter } from '@flowgram.ai/utils';
import type { PluginContext } from '@flowgram.ai/core';

import type {
  FlowImportServiceOptions,
  WorkflowImportDropState,
  WorkflowImportErrorParams,
  WorkflowImportSuccessParams,
} from './type';
import {
  FlowImportFormat,
  WorkflowImportData,
  detectFlowImportFormat,
  parseWorkflowData,
} from './parser';

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

@injectable()
export class FlowImportService {
  private ctx?: PluginContext;

  private options: FlowImportServiceOptions = {};

  private toDispose = new DisposableCollection();

  private importingChangeEmitter = new Emitter<boolean>();

  private importSuccessEmitter = new Emitter<WorkflowImportSuccessParams>();

  private importErrorEmitter = new Emitter<WorkflowImportErrorParams>();

  private dropStateChangeEmitter = new Emitter<WorkflowImportDropState>();

  public importing = false;

  public readonly onImportingChange = this.importingChangeEmitter.event;

  public readonly onImportSuccess = this.importSuccessEmitter.event;

  public readonly onImportError = this.importErrorEmitter.event;

  public readonly onDropStateChange = this.dropStateChangeEmitter.event;

  public init(ctx: PluginContext, options: FlowImportServiceOptions = {}): void {
    this.ctx = ctx;
    this.options = {
      enableDrop: true,
      fitViewAfterImport: true,
      maxFileSize: DEFAULT_MAX_FILE_SIZE,
      ...options,
    };
    this.toDispose.pushAll([
      this.importingChangeEmitter,
      this.importSuccessEmitter,
      this.importErrorEmitter,
      this.dropStateChangeEmitter,
    ]);
  }

  public bindDropTarget(): void {
    const target = this.getDropTarget();

    if (!target) {
      return;
    }

    const dragOverListener = (event: DragEvent) => {
      if (!this.hasFiles(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer!.dropEffect = this.canImportByReadonly() ? 'copy' : 'none';
      this.setDropState({ dragging: true, droppable: this.canImportByReadonly() });
    };

    const dragLeaveListener = (event: DragEvent) => {
      if (!this.hasFiles(event.dataTransfer)) {
        return;
      }
      this.setDropState({ dragging: false, droppable: false });
    };

    const dropListener = (event: DragEvent) => {
      if (!this.hasFiles(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.setDropState({ dragging: false, droppable: false });
      void this.importFiles(Array.from(event.dataTransfer?.files ?? [])).catch(() => undefined);
    };

    target.addEventListener('dragover', dragOverListener);
    target.addEventListener('dragleave', dragLeaveListener);
    target.addEventListener('drop', dropListener);
    this.toDispose.pushAll([
      Disposable.create(() => target.removeEventListener('dragover', dragOverListener)),
      Disposable.create(() => target.removeEventListener('dragleave', dragLeaveListener)),
      Disposable.create(() => target.removeEventListener('drop', dropListener)),
    ]);
  }

  public async importFiles(files: File[] | FileList): Promise<WorkflowImportData> {
    const fileList = Array.from(files);

    if (fileList.length !== 1) {
      const error = new Error('Please import one workflow file at a time.');
      this.handleImportError({ error });
      throw error;
    }

    return this.importFile(fileList[0]);
  }

  public async importFile(file: File): Promise<WorkflowImportData> {
    const format = detectFlowImportFormat(file.name);

    if (!format) {
      const error = new Error('Only .json, .yaml, and .yml workflow files are supported.');
      this.handleImportError({ file, error });
      throw error;
    }

    if (file.size > (this.options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE)) {
      const error = new Error('Workflow file is too large.');
      this.handleImportError({ file, format, error });
      throw error;
    }

    if (!this.canImportByReadonly()) {
      const error = new Error('Cannot import workflow while the playground is readonly.');
      this.handleImportError({ file, format, error });
      throw error;
    }

    this.setImporting(true);
    try {
      const content = await this.readFileContent(file);
      const data = parseWorkflowData(content, { format, fileName: file.name });
      await this.applyWorkflowData(data);
      this.handleImportSuccess({ file, format, data });
      return data;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      this.handleImportError({ file, format, error: normalizedError });
      throw normalizedError;
    } finally {
      this.setImporting(false);
    }
  }

  public async importText(content: string, format: FlowImportFormat): Promise<WorkflowImportData> {
    if (!this.canImportByReadonly()) {
      const error = new Error('Cannot import workflow while the playground is readonly.');
      this.handleImportError({ format, error });
      throw error;
    }

    this.setImporting(true);
    try {
      const data = parseWorkflowData(content, { format });
      await this.applyWorkflowData(data);
      this.handleImportSuccess({ format, data });
      return data;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      this.handleImportError({ format, error: normalizedError });
      throw normalizedError;
    } finally {
      this.setImporting(false);
    }
  }

  public dispose(): void {
    this.toDispose.dispose();
  }

  private async applyWorkflowData(data: WorkflowImportData): Promise<void> {
    const ctx = this.assertContext();

    if (this.options.importData) {
      await this.options.importData(ctx, data);
    } else {
      const contextWithOperation = ctx as PluginContext & {
        operation?: { fromJSON?: (json: WorkflowImportData) => void };
      };
      if (typeof contextWithOperation.operation?.fromJSON === 'function') {
        contextWithOperation.operation.fromJSON(data);
      } else {
        const contextWithDocument = ctx as PluginContext & {
          document: { fromJSON: (json: WorkflowImportData) => void };
        };
        contextWithDocument.document.fromJSON(data);
      }
    }

    if (this.options.fitViewAfterImport) {
      const contextWithTools = ctx as PluginContext & {
        tools?: { fitView?: (easing?: boolean) => Promise<void> | void };
      };
      await contextWithTools.tools?.fitView?.(false);
    }
  }

  private getDropTarget(): HTMLElement | undefined {
    if (typeof this.options.dropTarget === 'function') {
      return this.options.dropTarget();
    }

    return this.options.dropTarget ?? this.ctx?.playground.node;
  }

  private readFileContent(file: File): Promise<string> {
    if (typeof file.text === 'function') {
      return file.text();
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error ?? new Error('Failed to read workflow file.'));
      reader.readAsText(file);
    });
  }

  private hasFiles(dataTransfer: DataTransfer | null): boolean {
    if (!dataTransfer) {
      return false;
    }

    return Array.from(dataTransfer.types).includes('Files');
  }

  private canImportByReadonly(): boolean {
    return !this.ctx?.playground.config.readonly;
  }

  private assertContext(): PluginContext {
    if (!this.ctx) {
      throw new Error('FlowImportService has not been initialized.');
    }

    return this.ctx;
  }

  private setImporting(value: boolean): void {
    this.importing = value;
    this.importingChangeEmitter.fire(value);
  }

  private setDropState(state: WorkflowImportDropState): void {
    this.options.onDropStateChange?.(state);
    this.dropStateChangeEmitter.fire(state);
  }

  private handleImportSuccess(params: WorkflowImportSuccessParams): void {
    this.options.onImportSuccess?.(params);
    this.importSuccessEmitter.fire(params);
  }

  private handleImportError(params: WorkflowImportErrorParams): void {
    this.options.onImportError?.(params);
    this.importErrorEmitter.fire(params);
  }
}
