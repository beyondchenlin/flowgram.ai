/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { Field, FormMeta } from '@flowgram.ai/free-layout-editor';
import {
  createInferInputsPlugin,
  DisplayInputsValues,
  DisplayOutputs,
  IFlowValue,
  InputsValues,
} from '@flowgram.ai/form-materials';
import { Divider } from '@douyinfe/semi-ui';

import { defaultFormMeta } from '../default-form-meta';
import { useIsSidebar } from '../../hooks';
import { FormHeader, FormContent } from '../../form-components';

const ObservedValues = () => {
  const isSidebar = useIsSidebar();

  return (
    <Field<Record<string, IFlowValue | undefined> | undefined> name="inputsValues">
      {({ field: { value, onChange } }) =>
        isSidebar ? (
          <InputsValues value={value} onChange={(nextValue) => onChange(nextValue)} />
        ) : (
          <DisplayInputsValues value={value} />
        )
      }
    </Field>
  );
};

export const renderForm = () => (
  <>
    <FormHeader />
    <FormContent>
      <ObservedValues />
      <Divider />
      <DisplayOutputs displayFromScope />
    </FormContent>
  </>
);

export const formMeta: FormMeta = {
  render: renderForm,
  validate: defaultFormMeta.validate,
  validateTrigger: defaultFormMeta.validateTrigger,
  effect: defaultFormMeta.effect,
  plugins: [
    createInferInputsPlugin({
      sourceKey: 'inputsValues',
      targetKey: 'inputs',
    }),
    createInferInputsPlugin({
      sourceKey: 'inputsValues',
      targetKey: 'outputs',
    }),
  ],
};
