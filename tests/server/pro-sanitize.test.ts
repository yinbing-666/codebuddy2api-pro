import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  proxyChatCompletions,
  createProxyContextFromCredential,
} from '../../lib/server/proxy/codebuddy';

// Pro-only feature tests: outbound body sanitization (11128 root-cause fix),
// developer role normalization, tool_choice string normalization, and model
// discovery User-Agent. These behaviors are added on top of upstream.

const makeNextRequest = (url: string) =>
  new Request(url, {
    headers: { 'content-type': 'application/json' },
  }) as never;

const makeJsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const ctx = createProxyContextFromCredential({
  filename: 'acct1',
  data: {
    bearer_token: 'test-token',
    user_id: 'u1',
    domain: 'www.codebuddy.ai',
  },
} as never);

describe('pro: outbound sanitization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rewrites Claude Code fingerprint sentences and strips billing headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      makeJsonResponse({
        choices: [{ message: { content: 'ok', role: 'assistant' } }],
      }),
    );

    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      {
        model: 'gpt-5.5',
        messages: [
          {
            role: 'system',
            content:
              "You are Claude Code, Anthropic's official CLI for Claude. x-anthropic-billing-header: some-value; cc_version=1.2.3;",
          },
          { role: 'user', content: 'hi' },
        ],
      },
      ctx,
    );

    const upstreamBody = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit).body),
    ) as { messages: Array<{ role: string; content: string }> };

    const systemMessage = upstreamBody.messages[0];
    expect(systemMessage.content).toContain(
      "Anthropic's official CLI tool for Claude",
    );
    expect(systemMessage.content).not.toContain('x-anthropic-billing-header');
    expect(systemMessage.content).not.toContain('cc_version=');
  });

  it('rewrites Codex CLI and Main branch fingerprints idempotently', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeJsonResponse({
        choices: [{ message: { content: 'ok', role: 'assistant' } }],
      }),
    );

    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      {
        model: 'gpt-5.5',
        messages: [
          {
            role: 'system',
            content:
              'You are a coding agent running in the Codex CLI. Main branch (you will usually use this for PRs) is checked out.',
          },
          { role: 'user', content: 'go' },
        ],
      },
      ctx,
    );

    const upstreamBody = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit).body),
    ) as { messages: Array<{ role: string; content: string }> };

    const content = upstreamBody.messages[0].content;
    expect(content).toContain('running inside the Codex CLI');
    expect(content).toContain(
      'Default branch (you will usually use this for PRs)',
    );
  });

  it('normalizes developer role to system', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      makeJsonResponse({
        choices: [{ message: { content: 'ok', role: 'assistant' } }],
      }),
    );

    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      {
        model: 'gpt-5.5',
        messages: [
          { role: 'developer', content: 'You are helpful' },
          { role: 'user', content: 'hi' },
        ],
      },
      ctx,
    );

    const upstreamBody = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit).body),
    ) as { messages: Array<{ role: string }> };
    expect(upstreamBody.messages[0].role).toBe('system');
  });

  it('normalizes object tool_choice to a string and strips none+tools', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeJsonResponse({
        choices: [{ message: { content: 'ok', role: 'assistant' } }],
      }),
    );

    // {type:'auto'} -> "auto"
    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      {
        model: 'gpt-5.5',
        messages: [{ role: 'user', content: 'hi' }],
        tool_choice: { type: 'auto' },
        tools: [{ type: 'function', function: { name: 'f' } }],
      },
      ctx,
    );
    let upstreamBody = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit).body),
    ) as { tool_choice: unknown; tools?: unknown[] };
    expect(upstreamBody.tool_choice).toBe('auto');

    // {type:'function',function:{name:'f'}} -> "f"
    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      {
        model: 'gpt-5.5',
        messages: [{ role: 'user', content: 'hi' }],
        tool_choice: { type: 'function', function: { name: 'lookup' } },
      },
      ctx,
    );
    upstreamBody = JSON.parse(
      String((fetchMock.mock.calls[1]?.[1] as RequestInit).body),
    ) as { tool_choice: unknown };
    expect(upstreamBody.tool_choice).toBe('lookup');

    // "none" strips tool_choice AND tools
    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      {
        model: 'gpt-5.5',
        messages: [{ role: 'user', content: 'hi' }],
        tool_choice: 'none',
        tools: [{ type: 'function', function: { name: 'f' } }],
      },
      ctx,
    );
    upstreamBody = JSON.parse(
      String((fetchMock.mock.calls[2]?.[1] as RequestInit).body),
    ) as { tool_choice: unknown; tools?: unknown[] };
    expect(upstreamBody.tool_choice).toBeUndefined();
    expect(upstreamBody.tools).toBeUndefined();
  });

  it('does not mutate the original request body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      makeJsonResponse({
        choices: [{ message: { content: 'ok', role: 'assistant' } }],
      }),
    );

    const body = {
      model: 'gpt-5.5',
      messages: [
        {
          role: 'developer',
          content: "You are Claude Code, Anthropic's official CLI for Claude.",
        },
      ],
    };

    await proxyChatCompletions(
      makeNextRequest('http://localhost/v1/chat/completions'),
      body,
      ctx,
    );

    expect(body.messages[0].role).toBe('developer');
    expect(body.messages[0].content).toContain(
      "Anthropic's official CLI for Claude.",
    );
  });
});

describe('pro: model discovery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends User-Agent and X-IDE headers on model discovery requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 0,
          data: { agents: [{ name: 'cli', models: ['gpt-5.5'] }], models: [] },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const { getModelsByCredential } =
      await import('../../lib/server/proxy/codebuddy');

    await getModelsByCredential([
      {
        filename: 'acct1',
        data: {
          bearer_token: 'test-token',
          domain: 'www.codebuddy.ai',
        },
      } as never,
    ]);

    const headers = new Headers(
      (fetchMock.mock.calls[0]?.[1] as RequestInit).headers,
    );
    expect(headers.get('User-Agent')).toBe('CLI/2.137.1 CodeBuddy/2.137.1');
    expect(headers.get('X-IDE-Name')).toBe('CLI');
    expect(headers.get('X-IDE-Version')).toBe('2.137.1');
    expect(headers.get('X-Product')).toBe('SaaS');
  });
});
