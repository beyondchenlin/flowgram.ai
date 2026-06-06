/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';

import { WorkflowNodeType } from '../constants';
import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconBreak from '../../assets/icon-break.jpg';
import { formMeta } from './form-meta';

let index = 0;
export const BreakNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Break,
  meta: {
    defaultPorts: [{ type: 'input' }],
    sidebarDisabled: true,
    size: {
      width: 360,
      height: 54,
    },
    expandable: false,
    onlyInContainer: WorkflowNodeType.Loop,
  },
  info: {
    icon: iconBreak,
    description: t('Interrupt the current loop.'),
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  onAdd() {
    return {
      id: `break_${nanoid(5)}`,
      type: 'break',
      data: {
        title: t('Break_{{index}}', { index: ++index }),
      },
    };
  },
};
