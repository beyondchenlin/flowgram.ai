/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';
import { FlowNodeSplitType } from '@flowgram.ai/fixed-layout-editor';

import { defaultFormMeta } from '../default-form-meta';
import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconIf from '../../assets/icon-if.png';

export const IFNodeRegistry: FlowNodeRegistry = {
  extend: FlowNodeSplitType.STATIC_SPLIT,
  type: 'if',
  info: {
    icon: iconIf,
    description: t('Execute only the matched branch when the condition is met.'),
  },
  meta: {
    expandable: false, // disable expanded
  },
  formMeta: defaultFormMeta,
  onAdd() {
    return {
      id: `if_${nanoid(5)}`,
      type: 'if',
      data: {
        title: t('If'),
        inputsValues: {
          condition: { type: 'constant', content: true },
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
      blocks: [
        {
          id: nanoid(5),
          type: 'ifBlock',
          data: {
            title: t('True Branch'),
          },
          blocks: [],
        },
        {
          id: nanoid(5),
          type: 'ifBlock',
          data: {
            title: t('False Branch'),
          },
        },
      ],
    };
  },
};
