import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/domain/account-status', () => ({
  checkinAccount: vi.fn(),
}));

// credentials 模块不整体 mock，只替换 listEligibleCredentialRecords（用 spy 保留真实导出）
import * as credentials from '@/lib/server/domain/credentials';

vi.spyOn(credentials, 'listEligibleCredentialRecords').mockResolvedValue([]);

const { listEligibleCredentialRecords } = credentials;
const { checkinAccount } = await import('@/lib/server/domain/account-status');
const { isDomesticCredential } = await import(
  '@/lib/server/domain/credentials'
);
const { runDomesticAutoCheckin } = await import(
  '@/lib/server/domain/auto-checkin'
);

const domesticCred = {
  filename: 'domestic.json',
  data: { domain: 'copilot.tencent.com' },
};
const intlCred = {
  filename: 'intl.json',
  data: { domain: 'www.workbuddy.ai' },
};
const unknownDomainCred = {
  filename: 'unknown.json',
  data: {},
};

describe('auto-checkin domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listEligibleCredentialRecords).mockResolvedValue([]);
  });

  it('identifies domestic and international credentials correctly', () => {
    expect(isDomesticCredential(domesticCred as never)).toBe(true);
    expect(isDomesticCredential(intlCred as never)).toBe(false);
    // 空 domain 视为未知，不算国内版（不自动签到）
    expect(isDomesticCredential(unknownDomainCred as never)).toBe(false);
    expect(
      isDomesticCredential({ filename: 'none.json', data: { domain: '' } } as never),
    ).toBe(false);
  });

  it('runs checkin only for domestic credentials and skips international/unknown', async () => {
    vi.mocked(listEligibleCredentialRecords).mockResolvedValue([
      domesticCred,
      intlCred,
      unknownDomainCred,
    ] as never);
    vi.mocked(checkinAccount).mockResolvedValue({} as never);

    const res = await runDomesticAutoCheckin();

    expect(res.checked).toEqual(['domestic.json']);
    expect(res.skipped).toEqual(['intl.json', 'unknown.json']);
    expect(checkinAccount).toHaveBeenCalledTimes(1);
    expect(checkinAccount).toHaveBeenCalledWith('domestic.json');
  });
});
