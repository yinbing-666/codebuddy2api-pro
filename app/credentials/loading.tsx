'use client';

import {
  Block,
  Flexbox,
  SkeletonButton,
  SkeletonParagraph,
  SkeletonTitle,
} from '@lobehub/ui';

export default function CredentialsLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonParagraph rows={3} />
      <Block variant="outlined">
        <Flexbox gap={8}>
          <SkeletonParagraph rows={1} />
          <SkeletonParagraph rows={1} />
          <SkeletonButton />
        </Flexbox>
      </Block>
    </Flexbox>
  );
}