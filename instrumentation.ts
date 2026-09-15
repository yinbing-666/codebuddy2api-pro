export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { refreshMissingCredentialModels } =
    await import('@/lib/server/domain/credential-models');
  const { initDomesticAutoCheckinScheduler } =
    await import('@/lib/server/domain/auto-checkin');

  void refreshMissingCredentialModels();
  initDomesticAutoCheckinScheduler();
};
