/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from 'react';

import { useClientContext, FlowNodeEntity } from '@flowgram.ai/fixed-layout-editor';
import { Button, Badge, Toast } from '@douyinfe/semi-ui';

import { CustomService } from '../../services';

export function Save(props: { disabled: boolean }) {
  const [errorCount, setErrorCount] = useState(0);
  const clientContext = useClientContext();

  const updateValidateData = useCallback(() => {
    const allForms = clientContext.document.getAllNodes().map((node) => node.form);
    const count = allForms.filter((form) => form?.state.invalid).length;
    setErrorCount(count);
  }, [clientContext]);

  /**
   * Validate all node forms and save a document snapshot.
   */
  const onSave = useCallback(async () => {
    try {
      const result = await clientContext.get(CustomService).save();
      setErrorCount(result.errorCount);
      if (result.saved) {
        Toast.success('Saved');
      } else {
        Toast.error('Please fix validation errors before saving');
      }
    } catch {
      Toast.error('Save failed');
    }
  }, [clientContext]);

  useEffect(() => {
    /**
     * Listen single node validate
     */
    const listenSingleNodeValidate = (node: FlowNodeEntity) => {
      const form = node.form;
      if (form) {
        const formValidateDispose = form.onValidate(() => updateValidateData());
        node.onDispose(() => formValidateDispose.dispose());
      }
    };
    clientContext.document.getAllNodes().forEach((node) => listenSingleNodeValidate(node));
    updateValidateData();
    const dispose = clientContext.document.onNodeCreate(({ node }) =>
      listenSingleNodeValidate(node)
    );
    return () => dispose.dispose();
  }, [clientContext, updateValidateData]);
  if (errorCount === 0) {
    return (
      <Button disabled={props.disabled} onClick={onSave}>
        Save
      </Button>
    );
  }
  return (
    <Badge count={errorCount} position="rightTop" type="danger">
      <Button type="danger" disabled={props.disabled} onClick={onSave}>
        Save
      </Button>
    </Badge>
  );
}
