/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from 'react';

import { useClientContext, FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Badge, Toast } from '@douyinfe/semi-ui';

import { CustomService } from '../../services';
import { t } from '../../i18n';

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
        Toast.success(t('Saved'));
      } else {
        Toast.error(t('Please fix validation errors before saving'));
      }
    } catch {
      Toast.error(t('Save failed'));
    }
  }, [clientContext]);

  /**
   * Listen single node validate
   */
  useEffect(() => {
    const listenSingleNodeValidate = (node: FlowNodeEntity) => {
      const { form } = node;
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
      <Button
        disabled={props.disabled}
        onClick={onSave}
        style={{ backgroundColor: 'rgba(171,181,255,0.3)', borderRadius: '8px' }}
      >
        {t('Save')}
      </Button>
    );
  }
  return (
    <Badge count={errorCount} position="rightTop" type="danger">
      <Button
        type="danger"
        disabled={props.disabled}
        onClick={onSave}
        style={{ backgroundColor: 'rgba(255, 179, 171, 0.3)', borderRadius: '8px' }}
      >
        {t('Save')}
      </Button>
    </Badge>
  );
}
