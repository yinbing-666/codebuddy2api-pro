'use client';

import { Button, Flexbox, Text } from '@lobehub/ui';

export default function CredentialsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Flexbox align="center" gap={16} justify="center" padding={24} style={{ minHeight: '60vh' }}>
      <Text type="secondary">加载失败：{error.message || '发生未知错误'}</Text>
      <Button onClick={reset}>重试</Button>
    </Flexbox>
  );
}