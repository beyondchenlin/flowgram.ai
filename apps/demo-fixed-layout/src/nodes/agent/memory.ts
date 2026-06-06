/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';

import { defaultFormMeta } from '../default-form-meta';
import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconMemory from '../../assets/icon-memory.svg';

let index = 0;
export const MemoryNodeRegistry: FlowNodeRegistry = {
  type: 'memory',
  info: {
    icon: iconMemory,
    description: t('Memory.'),
  },
  meta: {
    addDisable: true,
    // deleteDisable: true, // memory 不能单独删除，只能通过 agent
    copyDisable: true,
    draggable: false,
    selectable: false,
  },
  formMeta: defaultFormMeta,
  onAdd() {
    return {
      id: `memory_${nanoid(5)}`,
      type: 'memory',
      data: {
        title: t('Memory_{{index}}', { index: ++index }),
      },
    };
  },
};
