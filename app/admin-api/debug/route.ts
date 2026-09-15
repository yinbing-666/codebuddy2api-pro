import { getAdminSessionErrorResponse } from '@/lib/server/admin/session';
import {
  clearDebugLogs,
  getDebugSettings,
  hasPendingDebugLogWrites,
  listDebugLogs,
  updateDebugSettings,
} from '@/lib/server/domain/debug';
import { getJsonBody } from '@/lib/server/shared/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  const settings = await getDebugSettings();
  const debugId = new URL(request.url).searchParams.get('id');
  const logs = await listDebugLogs();
  const pending = hasPendingDebugLogWrites();

  if (debugId) {
    const item = logs.find((log) => log.id === debugId);
    return Response.json({ item: item ?? null }, { status: item ? 200 : 404 });
  }

  return Response.json({
    autoRefreshSeconds: settings.autoRefreshSeconds,
    enabled: settings.enabled,
    // Payload bodies are loaded on demand through ?id= to keep list refreshes fast.
    items: logs.map((log) => ({
      credentialFilename: log.credentialFilename,
      createdAt: log.createdAt,
      elapsedMs: log.elapsedMs,
      error: log.error,
      id: log.id,
      model: log.model,
      requestKey: log.requestKey,
      route: log.route,
      usage: log.usage,
      transformedResponse: log.transformedResponse
        ? { status: log.transformedResponse.status }
        : null,
      upstreamRequest: log.upstreamRequest
        ? { method: log.upstreamRequest.method, url: log.upstreamRequest.url }
        : null,
      upstreamResponse: log.upstreamResponse
        ? { status: log.upstreamResponse.status }
        : null,
    })),
    maxEntries: settings.maxEntries,
    pending,
  });
};

export const POST = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  const body = await getJsonBody<{
    autoRefreshSeconds?: unknown;
    enabled?: unknown;
    maxEntries?: unknown;
  }>(request);

  const nextSettings: {
    autoRefreshSeconds?: number;
    enabled?: boolean;
    maxEntries?: number;
  } = {};

  if (body.autoRefreshSeconds !== undefined) {
    if (
      typeof body.autoRefreshSeconds !== 'number' ||
      !Number.isFinite(body.autoRefreshSeconds)
    ) {
      return Response.json(
        { error: 'autoRefreshSeconds must be a number' },
        { status: 400 },
      );
    }
    nextSettings.autoRefreshSeconds = Math.min(
      3600,
      Math.max(5, Math.round(body.autoRefreshSeconds)),
    );
  }

  if (body.maxEntries !== undefined) {
    if (
      typeof body.maxEntries !== 'number' ||
      !Number.isFinite(body.maxEntries)
    ) {
      return Response.json(
        { error: 'maxEntries must be a number' },
        { status: 400 },
      );
    }
    nextSettings.maxEntries = Math.min(
      5000,
      Math.max(10, Math.round(body.maxEntries)),
    );
  }

  if (body.enabled !== undefined) {
    if (typeof body.enabled !== 'boolean') {
      return Response.json(
        { error: 'enabled must be a boolean' },
        { status: 400 },
      );
    }
    nextSettings.enabled = body.enabled;
  }

  const settings = await updateDebugSettings(nextSettings);

  return Response.json({
    autoRefreshSeconds: settings.autoRefreshSeconds,
    enabled: settings.enabled,
    maxEntries: settings.maxEntries,
  });
};

export const DELETE = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  await clearDebugLogs();
  const settings = await getDebugSettings();

  return Response.json({
    autoRefreshSeconds: settings.autoRefreshSeconds,
    enabled: settings.enabled,
    items: [],
    maxEntries: settings.maxEntries,
  });
};
