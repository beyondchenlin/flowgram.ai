/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import {
  ASTFactory,
  definePluginCreator,
  GlobalScope,
  VariableDeclaration,
} from '@flowgram.ai/free-layout-editor';
import { IJsonSchema, JsonSchemaUtils } from '@flowgram.ai/form-materials';

import { t } from '../../i18n';
import iconVariable from '../../assets/icon-variable.png';
import { VariablePanelLayer } from './variable-panel-layer';

const fetchMockVariableFromRemote = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    type: 'object',
    properties: {
      userId: { type: 'string' },
    },
  };
};

export type GetGlobalVariableSchema = () => IJsonSchema;
export const GetGlobalVariableSchema = Symbol('GlobalVariableSchemaGetter');
export type SetGlobalVariableSchema = (schema: IJsonSchema) => void;
export const SetGlobalVariableSchema = Symbol('GlobalVariableSchemaSetter');

export const createVariablePanelPlugin = definePluginCreator<{ initialData?: IJsonSchema }>({
  onBind({ bind }) {
    bind(GetGlobalVariableSchema).toDynamicValue((ctx) => () => {
      const variable = ctx.container.get(GlobalScope).getVar() as VariableDeclaration;
      return JsonSchemaUtils.astToSchema(variable?.type);
    });
    bind(SetGlobalVariableSchema).toDynamicValue((ctx) => (schema: IJsonSchema) => {
      setGlobalVariableSchema(ctx.container.get(GlobalScope), schema);
    });
  },
  onInit(ctx, opts) {
    ctx.playground.registerLayer(VariablePanelLayer);

    const globalScope = ctx.get(GlobalScope);

    if (opts.initialData) {
      setGlobalVariableSchema(globalScope, opts.initialData);
    } else {
      // You can also fetch global variable from remote
      fetchMockVariableFromRemote().then((v) => {
        setGlobalVariableSchema(globalScope, v);
      });
    }
  },
});

function setGlobalVariableSchema(globalScope: GlobalScope, schema: IJsonSchema): void {
  globalScope.setVar(
    ASTFactory.createVariableDeclaration({
      key: 'global',
      meta: {
        title: t('Global Variable'),
        icon: iconVariable,
      },
      type: JsonSchemaUtils.schemaToAST(schema),
    })
  );
}
