/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';

import { WorkflowNodeType } from '../constants';
import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconCondition from '../../assets/icon-condition.svg';
import { formMeta } from './form-meta';

export const ConditionNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Condition,
  info: {
    icon: iconCondition,
    description: t('Connect multiple downstream branches and execute only the matched branch.'),
  },
  meta: {
    defaultPorts: [{ type: 'input' }],
    // Condition Outputs use dynamic port
    useDynamicPort: true,
    expandable: false, // disable expanded
    size: {
      width: 360,
      height: 210,
    },
  },
  formMeta,
  onAdd() {
    return {
      id: `condition_${nanoid(5)}`,
      type: 'condition',
      data: {
        title: t('Condition'),
        conditions: [
          {
            key: `if_${nanoid(5)}`,
            value: {},
          },
          {
            key: `if_${nanoid(5)}`,
            value: {},
          },
        ],
      },
    };
  },
};
