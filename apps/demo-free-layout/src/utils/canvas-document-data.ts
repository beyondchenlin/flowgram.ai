/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { type FlowDocumentJSON } from '../typings';
import { t } from '../i18n';

export function createEmptyCanvasData(): FlowDocumentJSON {
  return {
    nodes: [
      {
        id: 'start_0',
        type: 'start',
        meta: {
          position: {
            x: 180,
            y: 0,
          },
        },
        data: {
          title: t('Start'),
        },
      },
      {
        id: 'end_0',
        type: 'end',
        meta: {
          position: {
            x: 640,
            y: 0,
          },
        },
        data: {
          title: t('End'),
        },
      },
    ],
    edges: [
      {
        sourceNodeID: 'start_0',
        targetNodeID: 'end_0',
      },
    ],
    globalVariable: {
      type: 'object',
      properties: {},
    },
  };
}

export function cloneCanvasData(data: FlowDocumentJSON): FlowDocumentJSON {
  return JSON.parse(JSON.stringify(data)) as FlowDocumentJSON;
}
