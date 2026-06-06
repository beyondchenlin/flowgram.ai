/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconStart from '../../assets/icon-start.jpg';
import { formMeta } from './form-meta';

export const StartNodeRegistry: FlowNodeRegistry = {
  type: 'start',
  meta: {
    isStart: true, // Mark as start
    deleteDisable: true, // Start node cannot delete
    selectable: false, // Start node cannot select
    copyDisable: true, // Start node cannot copy
    expandable: false, // disable expanded
    addDisable: true, // Start Node cannot be added
  },
  info: {
    icon: iconStart,
    description: t(
      'Workflow start node, used to set the information required to start the workflow.'
    ),
  },
  /**
   * Render node via formMeta
   */
  formMeta,
};
