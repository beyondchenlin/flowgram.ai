/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from 'react';

import { useClientContext, FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Badge, Toast } from '@douyinfe/semi-ui';
import { IconPlay } from '@douyinfe/semi-icons';

import { CustomService } from '../../../services';
import { useTestRunFormPanel } from '../../../plugins/panel-manager-plugin/hooks';
import { t } from '../../../i18n';

import styles from './index.module.less';

export function TestRunButton(props: { disabled: boolean }) {
  const [errorCount, setErrorCount] = useState(0);
  const clientContext = useClientContext();
  const updateValidateData = useCallback(() => {
    const allForms = clientContext.document.getAllNodes().map((node) => node.form);
    const count = allForms.filter((form) => form?.state.invalid).length;
    setErrorCount(count);
  }, [clientContext]);
  const { open: openPanel } = useTestRunFormPanel();
  /**
   * Save a valid document snapshot before opening the test run panel.
   */
  const onTestRun = useCallback(async () => {
    try {
      const result = await clientContext.get(CustomService).save({ blockOnValidationErrors: true });
      setErrorCount(result.errorCount);
      if (result.saved) {
        openPanel();
      } else {
        Toast.error(t('Please fix validation errors before saving'));
      }
    } catch {
      Toast.error(t('Save failed'));
    }
  }, [clientContext, openPanel]);

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

  const button =
    errorCount === 0 ? (
      <Button
        disabled={props.disabled}
        onClick={onTestRun}
        icon={<IconPlay size="small" />}
        className={styles.testrunSuccessButton}
      >
        {t('Test Run')}
      </Button>
    ) : (
      <Badge count={errorCount} position="rightTop" type="danger">
        <Button
          type="danger"
          disabled={props.disabled}
          onClick={onTestRun}
          icon={<IconPlay size="small" />}
          className={styles.testrunErrorButton}
        >
          {t('Test Run')}
        </Button>
      </Badge>
    );

  return button;
}
