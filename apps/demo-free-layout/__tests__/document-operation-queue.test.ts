/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

import { DocumentOperationQueue } from '../src/services/document-operation-queue';

describe('demo free layout document operation queue', () => {
  it('runs document operations sequentially', async () => {
    const queue = new DocumentOperationQueue();
    const events: string[] = [];
    let releaseFirst: () => void;
    const firstDone = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const first = queue.run(async () => {
      events.push('first:start');
      await firstDone;
      events.push('first:end');
    });
    const second = queue.run(async () => {
      events.push('second:start');
    });

    await Promise.resolve();
    expect(events).toEqual(['first:start']);

    releaseFirst!();
    await Promise.all([first, second]);

    expect(events).toEqual(['first:start', 'first:end', 'second:start']);
  });

  it('continues running queued operations after a rejection', async () => {
    const queue = new DocumentOperationQueue();

    await expect(
      queue.run(async () => {
        throw new Error('save failed');
      })
    ).rejects.toThrow('save failed');

    await expect(queue.run(() => 'next')).resolves.toBe('next');
  });
});
