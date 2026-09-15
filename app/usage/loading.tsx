'use client';

import {
  Block,
  Flexbox,
  SkeletonParagraph,
  SkeletonTitle,
  SkeletonTags,
} from '@lobehub/ui';

export default function UsageLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonTags />
      <Block variant="outlined">
        <SkeletonParagraph rows={3} />
        <SkeletonParagraph rows={2} />
      </Block>
    </Flexbox>
  );
}