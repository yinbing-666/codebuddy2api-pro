'use client';

import {
  Block,
  Flexbox,
  SkeletonParagraph,
  SkeletonTitle,
} from '@lobehub/ui';

export default function DebugLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonParagraph rows={3} />
      <Block variant="outlined">
        <SkeletonParagraph rows={2} />
        <SkeletonParagraph rows={2} />
      </Block>
    </Flexbox>
  );
}