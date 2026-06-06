/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useClientContext, type WorkflowDocumentRecord } from '@flowgram.ai/free-layout-editor';
import { Button, Dropdown, IconButton, Toast, Tooltip } from '@douyinfe/semi-ui';
import { IconChevronDown, IconPlus } from '@douyinfe/semi-icons';

import { type FlowDocumentJSON } from '../../typings';
import { CustomService } from '../../services';
import { initialData } from '../../initial-data';
import { t } from '../../i18n';

interface DocumentManagerToolProps {
  disabled: boolean;
}

export function DocumentManagerTool(props: DocumentManagerToolProps) {
  const clientContext = useClientContext();
  const documentService = useMemo(() => clientContext.get(CustomService), [clientContext]);
  const [visible, setVisible] = useState(false);
  const [records, setRecords] = useState<WorkflowDocumentRecord[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState('');

  const refreshDocuments = useCallback(() => {
    const store = documentService.getDocumentStore(createInitialCanvasData());
    setRecords(documentService.getDocumentRecords(createInitialCanvasData()));
    setActiveDocumentId(store.activeRecord.id);
  }, [documentService]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const activeDocument = records.find((record) => record.id === activeDocumentId);
  const documentTitle = activeDocument?.title ?? t('Canvas');

  const handleOpenMenu = useCallback(() => {
    refreshDocuments();
    setVisible(true);
  }, [refreshDocuments]);

  const handleCreateDocument = useCallback(() => {
    try {
      documentService.createDocument(
        createInitialCanvasData(),
        t('Canvas {{index}}', {
          index: records.length + 1,
        })
      );
      refreshDocuments();
      Toast.success(t('Canvas created'));
    } catch {
      Toast.error(t('Create canvas failed'));
    }
  }, [documentService, records.length, refreshDocuments]);

  const handleOpenDocument = useCallback(
    (documentId: string) => {
      if (documentId === activeDocumentId) {
        setVisible(false);
        return;
      }

      try {
        documentService.openDocument(documentId, createInitialCanvasData());
        refreshDocuments();
        Toast.success(t('Canvas opened'));
      } catch {
        Toast.error(t('Open canvas failed'));
      } finally {
        setVisible(false);
      }
    },
    [activeDocumentId, documentService, refreshDocuments]
  );

  return (
    <>
      <Dropdown
        trigger="custom"
        visible={visible}
        position="topLeft"
        onClickOutSide={() => setVisible(false)}
        render={
          <Dropdown.Menu className="min-w-[220px]">
            {records.map((record) => (
              <Dropdown.Item
                key={record.id}
                disabled={props.disabled}
                onClick={() => handleOpenDocument(record.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: record.id === activeDocumentId ? 600 : 400 }}>
                    {record.title}
                  </span>
                  <span style={{ color: 'rgba(6, 7, 9, 0.55)', fontSize: 12 }}>
                    {record.id === activeDocumentId
                      ? t('Current canvas')
                      : t('Updated {{time}}', { time: formatUpdatedAt(record.updatedAt) })}
                  </span>
                </div>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        }
      >
        <Button
          disabled={props.disabled}
          theme="borderless"
          type="tertiary"
          size="small"
          onClick={handleOpenMenu}
          style={{ maxWidth: 180 }}
        >
          <span
            style={{
              display: 'inline-block',
              maxWidth: 124,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'bottom',
              whiteSpace: 'nowrap',
            }}
          >
            {documentTitle}
          </span>
          <IconChevronDown size="small" />
        </Button>
      </Dropdown>
      <Tooltip content={t('New Canvas')}>
        <IconButton
          aria-label={t('New Canvas')}
          disabled={props.disabled}
          type="tertiary"
          theme="borderless"
          icon={<IconPlus />}
          onClick={handleCreateDocument}
        />
      </Tooltip>
    </>
  );
}

function createInitialCanvasData(): FlowDocumentJSON {
  return JSON.parse(JSON.stringify(initialData)) as FlowDocumentJSON;
}

function formatUpdatedAt(updatedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(updatedAt));
}
