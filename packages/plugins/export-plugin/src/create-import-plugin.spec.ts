/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest';
import { Playground, createPlaygroundContainer, loadPlugins } from '@flowgram.ai/core';

import { FlowImportService } from './import-service';
import { createImportPlugin } from './create-import-plugin';

describe('createImportPlugin', () => {
  it('binds and initializes the import service', async () => {
    const container = createPlaygroundContainer();
    const onImportError = vi.fn();
    const plugin = createImportPlugin({ enableDrop: false, onImportError });

    loadPlugins([plugin], container);

    const playground = container.get<Playground>(Playground);
    playground.init();

    const service = container.get<FlowImportService>(FlowImportService);

    expect(service).toBeInstanceOf(FlowImportService);
    await expect(service.importFiles([])).rejects.toThrow('one workflow file');
    expect(onImportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
      })
    );
  });
});
