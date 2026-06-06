/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';

import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconBreak from '../../assets/icon-break.svg';
import { formMeta } from './form-meta';

/**
 * Break 节点用于在 loop 中根据条件终止并跳出
 */
export const BreakLoopNodeRegistry: FlowNodeRegistry = {
  type: 'breakLoop',
  extend: 'end',
  info: {
    icon: iconBreak,
    description: t('Break out of the current loop.'),
  },
  meta: {
    style: {
      width: 240,
    },
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  canAdd(ctx, from) {
    while (from.parent) {
      if (from.parent.flowNodeType === 'loop') return true;
      from = from.parent;
    }
    return false;
  },
  onAdd(ctx, from) {
    return {
      id: `break_${nanoid()}`,
      type: 'breakLoop',
      data: {
        title: t('BreakLoop'),
      },
    };
  },
};
