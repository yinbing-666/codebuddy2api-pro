import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import LoginClient from './login-client';
import { getAdminSessionSummary } from '@/lib/server/admin/session';
import { getMessages } from '@/lib/i18n/messages';
import {
  localeCookieName,
  localePreferenceCookieName,
  parseLocalePreference,
  resolveAppLocale,
  systemLocalePreference,
} from '@/lib/i18n/routing';
import { parseThemeMode, themeCookieName } from '@/lib/theme';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

const ALLOWED_PROTOCOLS = ['http', 'https'];

const HOST_PATTERN = /^(localhost|(\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d+)?$/;

const isSameSiteRedirect = (
  value: string | undefined,
): value is string => {
  if (!value) {
    return false;
  }

  return value.startsWith('/') && !value.startsWith('//');
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const localePreference = parseLocalePreference(
    cookieStore.get(localePreferenceCookieName)?.value ??
      cookieStore.get(localeCookieName)?.value,
  );
  const locale = resolveAppLocale(
    localePreference === systemLocalePreference
      ? (headerStore.get('accept-language') ?? undefined)
      : localePreference,
  );
  const headerProtocol = headerStore.get('x-forwarded-proto');
  const rawHost =
    headerStore.get('x-forwarded-host') ??
    headerStore.get('host') ??
    'localhost';
  const protocol = ALLOWED_PROTOCOLS.includes(headerProtocol ?? '')
    ? headerProtocol
    : 'https';
  const host = HOST_PATTERN.test(rawHost) ? rawHost : 'localhost';
  const cookieHeader = headerStore.get('cookie') ?? '';
  const request = new Request(`${protocol}://${host}/login`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  const session = await getAdminSessionSummary(request);
  await getTranslations({
    locale,
    namespace: 'Admin.loginPage',
  });
  const messages = getMessages(locale);
  const { redirect: rawRedirect } = await searchParams;
  const redirectTarget = isSameSiteRedirect(rawRedirect) ? rawRedirect : '/';

  if (session.authenticated) {
    redirect(redirectTarget);
  }

  return (
    <LoginClient
      initialSession={session}
      initialTheme={parseThemeMode(cookieStore.get(themeCookieName)?.value)}
      locale={locale}
      localePreference={localePreference}
      redirect={redirectTarget}
      translations={messages?.Admin?.loginPage ?? {}}
    />
  );
};

export default LoginPage;