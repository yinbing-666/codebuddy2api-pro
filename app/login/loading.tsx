'use client';

import { Flexbox, SkeletonButton, SkeletonParagraph, SkeletonTitle } from '@lobehub/ui';

export default function LoginLoading() {
  return (
    <Flexbox align="center" gap={16} justify="center" style={{ minHeight: '60vh' }}>
      <SkeletonTitle />
      <SkeletonParagraph rows={1} />
      <SkeletonButton />
    </Flexbox>
  );
}