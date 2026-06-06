/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';
import { FlowNodeSplitType } from '@flowgram.ai/fixed-layout-editor';

import { defaultFormMeta } from '../default-form-meta';
import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconCondition from '../../assets/icon-condition.svg';

export const SwitchNodeRegistry: FlowNodeRegistry = {
  extend: FlowNodeSplitType.DYNAMIC_SPLIT,
  type: 'switch',
  info: {
    icon: iconCondition,
    description: t('Connect multiple downstream branches and execute only the matched branch.'),
  },
  meta: {
    expandable: false, // disable expanded
  },
  formMeta: defaultFormMeta,
  onAdd() {
    return {
      id: `switch_${nanoid(5)}`,
      type: 'switch',
      data: {
        title: t('Switch'),
      },
      blocks: [
        {
          id: nanoid(5),
          type: 'case',
          data: {
            title: t('Case_{{index}}', { index: 0 }),
            inputsValues: {
              condition: { type: 'constant', content: '' },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
          blocks: [],
        },
        {
          id: nanoid(5),
          type: 'case',
          data: {
            title: t('Case_{{index}}', { index: 1 }),
            inputsValues: {
              condition: { type: 'constant', content: '' },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
        },
        {
          id: nanoid(5),
          type: 'caseDefault',
          data: {
            title: t('Default Branch'),
          },
          blocks: [],
        },
      ],
    };
  },
};
