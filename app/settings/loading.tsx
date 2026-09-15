'use client';

import {
  Block,
  Flexbox,
  SkeletonParagraph,
  SkeletonTitle,
} from '@lobehub/ui';

export default function SettingsLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonParagraph rows={3} />
      <Block variant="outlined">
        <SkeletonParagraph rows={1} />
        <SkeletonParagraph rows={1} />
      </Block>
    </Flexbox>
  );
}