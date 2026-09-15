import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/domain/credentials', () => ({
  listEligibleCredentialRecords: vi.fn(),
}));
vi.mock('@/lib/server/domain/account-status', () => ({
  checkinAccount: vi.fn(),
}));

const { listEligibleCredentialRecords } = await import(
  '@/lib/server/domain/credentials'
);
const { checkinAccount } = await import(
  '@/lib/server/domain/account-status'
);
const {
  isDomesticCredential,
  runDomesticAutoCheckin,
} = await import('@/lib/server/domain/auto-checkin');

const domesticCred = {
  filename: 'domestic.json',
  data: { domain: 'copilot.tencent.com' },
};
const intlCred = {
  filename: 'intl.json',
  data: { domain: 'www.workbuddy.ai' },
};

describe('auto-checkin domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies domestic and international credentials correctly', () => {
    expect(isDomesticCredential(domesticCred as never)).toBe(true);
    expect(isDomesticCredential(intlCred as never)).toBe(false);
    expect(
      isDomesticCredential({ filename: 'empty.json', data: {} } as never),
    ).toBe(false);
    expect(
      isDomesticCredential({ filename: 'none.json', data: { domain: '' } } as never),
    ).toBe(false);
  });

  it('runs checkin only for domestic credentials and skips international', async () => {
    vi.mocked(listEligibleCredentialRecords).mockResolvedValue([
      domesticCred,
      intlCred,
    ] as never);
    vi.mocked(checkinAccount).mockResolvedValue({} as never);

    const res = await runDomesticAutoCheckin();

    expect(res.checked).toEqual(['domestic.json']);
    expect(res.skipped).toEqual(['intl.json']);
    expect(checkinAccount).toHaveBeenCalledTimes(1);
    expect(checkinAccount).toHaveBeenCalledWith('domestic.json');
  });
});
