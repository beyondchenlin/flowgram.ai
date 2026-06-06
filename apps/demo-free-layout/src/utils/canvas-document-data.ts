/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { type FlowDocumentJSON } from '../typings';

export function createEmptyCanvasData(): FlowDocumentJSON {
  return {
    nodes: [],
    edges: [],
  };
}

export function cloneCanvasData(data: FlowDocumentJSON): FlowDocumentJSON {
  return JSON.parse(JSON.stringify(data)) as FlowDocumentJSON;
}
