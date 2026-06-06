/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useMemo } from 'react';

import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';
import { FreeLayoutProps } from '@flowgram.ai/free-layout-editor';

import { NodeRender } from './node-render';
import { nodeRegistries } from './node-registries';
import { initialData } from './initial-data';

export const useEditorProps = () =>
  useMemo<FreeLayoutProps>(
    () => ({
      plugins: () => [createMinimapPlugin({}), createFreeSnapPlugin({})],
      onAllLayersRendered: (ctx) => {
        ctx.tools.fitView(false);
      },
      materials: {
        renderDefaultNode: NodeRender,
      },
      nodeRegistries,
      canDeleteNode: () => true,
      canDeleteLine: () => true,
      initialData,
    }),
    []
  );
