'use client';

import {
  Block,
  Flexbox,
  SkeletonButton,
  SkeletonParagraph,
  SkeletonTitle,
} from '@lobehub/ui';

export default function DashboardLoading() {
  return (
    <Flexbox gap={16} padding={24}>
      <SkeletonTitle />
      <SkeletonParagraph rows={3} />
      <SkeletonTitle />
      <SkeletonParagraph rows={4} />
      <Block variant="outlined">
        <Flexbox gap={12}>
          <SkeletonParagraph rows={2} />
          <SkeletonButton />
        </Flexbox>
      </Block>
    </Flexbox>
  );
}