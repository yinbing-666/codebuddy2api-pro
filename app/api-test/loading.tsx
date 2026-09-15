'use client';

import {
  Block,
  Flexbox,
  SkeletonButton,
  SkeletonParagraph,
  SkeletonTitle,
} from '@lobehub/ui';

export default function ApiTestLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonParagraph rows={2} />
      <Block variant="outlined">
        <SkeletonParagraph rows={1} />
        <SkeletonButton />
        <SkeletonParagraph rows={4} />
      </Block>
    </Flexbox>
  );
}