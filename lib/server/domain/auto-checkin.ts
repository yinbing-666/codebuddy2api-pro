import {
  isDomesticCredential,
  listEligibleCredentialRecords,
} from './credentials';
import { checkinAccount } from './account-status';

const globalAutoCheckinState = globalThis as typeof globalThis & {
  __codebuddy2apiAutoCheckinInitialized__?: boolean;
};

export const runDomesticAutoCheckin = async (): Promise<{
  checked: string[];
  skipped: string[];
  failed: { filename: string; error: string }[];
}> => {
  const result = {
    checked: [] as string[],
    skipped: [] as string[],
    failed: [] as { filename: string; error: string }[],
  };

  try {
    const credentials = await listEligibleCredentialRecords();
    for (const credential of credentials) {
      if (!isDomesticCredential(credential)) {
        result.skipped.push(credential.filename);
        continue;
      }

      try {
        await checkinAccount(credential.filename);
        result.checked.push(credential.filename);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.failed.push({ filename: credential.filename, error: message });
      }
    }
  } catch (error) {
    console.warn('[CodeBuddy2API] Auto checkin batch execution error', error);
  }

  return result;
};

export const initDomesticAutoCheckinScheduler = (): void => {
  if (globalAutoCheckinState.__codebuddy2apiAutoCheckinInitialized__) {
    return;
  }
  globalAutoCheckinState.__codebuddy2apiAutoCheckinInitialized__ = true;

  // 启动后延迟 15 秒执行一次首轮自动签到
  setTimeout(() => {
    void runDomesticAutoCheckin();
  }, 15_000);

  // 之后每小时巡检一次（国内版腾讯签到为幂等接口，重复签到无副作用）
  const CHECKIN_INTERVAL_MS = 60 * 60 * 1000;
  setInterval(() => {
    void runDomesticAutoCheckin();
  }, CHECKIN_INTERVAL_MS);
};
