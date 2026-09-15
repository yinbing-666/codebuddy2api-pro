'use client';

import {
  Block,
  Flexbox,
  SkeletonButton,
  SkeletonParagraph,
  SkeletonTags,
  SkeletonTitle,
} from '@lobehub/ui';

export default function AccountStatusLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonParagraph rows={1} />
      <Block variant="outlined">
        <SkeletonTags />
        <SkeletonParagraph rows={3} />
        <SkeletonButton />
      </Block>
    </Flexbox>
  );
}