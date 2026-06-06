/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import '@flowgram.ai/free-layout-editor/index.css';
import { FreeLayoutEditorProvider, EditorRenderer } from '@flowgram.ai/free-layout-editor';

const FlowGramApp = () => (
  <FreeLayoutEditorProvider>
    <EditorRenderer />
  </FreeLayoutEditorProvider>
);

export default FlowGramApp;
