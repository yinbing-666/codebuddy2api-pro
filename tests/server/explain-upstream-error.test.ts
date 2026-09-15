import { describe, expect, it } from 'vitest';

import { explainUpstreamError } from '@/lib/server/proxy/codebuddy';

describe('explainUpstreamError', () => {
  it('recognizes 14017 trial-not-activated with Chinese hint', () => {
    const detail =
      '{"code":14017,"msg":"The trial version is not yet activated. Please log out of your current account and log in again to activate it immediately and start your free trial."}';
    const hint = explainUpstreamError(detail);
    expect(hint).toContain('免费试用尚未激活');
  });

  it('recognizes bare 14017 text form', () => {
    const detail =
      'code 14017: The trial version is not yet activated. Please log out and log in again.';
    const hint = explainUpstreamError(detail);
    expect(hint).toContain('免费试用尚未激活');
  });

  it('recognizes 11128 anti-ban channel rejection', () => {
    const detail = '{"code":11128,"msg":"Illegal API invocation from an unapproved channel"}';
    const hint = explainUpstreamError(detail);
    expect(hint).toContain('风控拦截');
  });

  it('recognizes 11133 parameters rejected', () => {
    const detail = '{"code":11133,"msg":"parameters rejected"}';
    const hint = explainUpstreamError(detail);
    expect(hint).toContain('max_tokens');
  });

  it('returns null for unknown errors and empty input', () => {
    expect(explainUpstreamError('{"code":99999,"msg":"mystery"}')).toBeNull();
    expect(explainUpstreamError('')).toBeNull();
    expect(explainUpstreamError(null)).toBeNull();
    expect(explainUpstreamError({ code: 14017 })).toBeNull();
  });
});