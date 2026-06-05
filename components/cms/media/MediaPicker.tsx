'use client';

import React, { useState } from 'react';
import { Button, Modal, Typography } from 'antd';
import { CloudUploadOutlined, PictureOutlined } from '@ant-design/icons';
import { MediaLibrary } from './MediaLibrary';
import type { MediaAsset } from '@/lib/types';
import type { MediaRef } from '@/lib/blocks';

const { Text } = Typography;

/**
 * Compact picker used inside block editors. Renders the currently-bound
 * image (or a placeholder) plus a button that pops the MediaLibrary in
 * picker mode. Selecting an asset hands a `MediaRef` back to the parent
 * (only the fields blocks care about, not the full DB row).
 */
export function MediaPicker({
  value,
  onChange,
  label = 'Image',
  allowRemove = true,
}: {
  value: MediaRef | undefined;
  onChange: (next: MediaRef | undefined) => void;
  label?: string;
  allowRemove?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const pick = (asset: MediaAsset) => {
    onChange({
      id: asset.id,
      url: asset.url,
      alt: asset.alt || asset.originalName,
      focalX: asset.focalX,
      focalY: asset.focalY,
    });
    setOpen(false);
  };

  const hasImage = !!value?.url;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 10,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 6,
            background: '#0f172a',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value!.url}
              alt={value!.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${(value!.focalX ?? 0.5) * 100}% ${(value!.focalY ?? 0.5) * 100}%`,
              }}
            />
          ) : (
            <PictureOutlined style={{ color: '#94a3b8', fontSize: 24 }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {hasImage ? (
            <>
              <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value!.alt || '(no alt text)'}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Click "Replace" to swap it.
              </Text>
            </>
          ) : (
            <Text type="secondary" style={{ fontSize: 13 }}>
              No image selected.
            </Text>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Button size="small" icon={<CloudUploadOutlined />} onClick={() => setOpen(true)}>
            {hasImage ? 'Replace' : 'Pick'}
          </Button>
          {hasImage && allowRemove && (
            <Button size="small" danger onClick={() => onChange(undefined)}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 1100, top: 30 }}
        title="Select an image"
        destroyOnHidden
      >
        <MediaLibrary mode="picker" onSelect={pick} />
      </Modal>
    </div>
  );
}
