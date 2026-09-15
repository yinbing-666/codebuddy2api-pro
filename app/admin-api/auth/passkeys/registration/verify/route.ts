import { getJsonBody } from '@/lib/server/shared/http';
import {
  finishAdminPasskeyRegistration,
  getAdminSessionErrorResponse,
} from '@/lib/server/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  const body = await getJsonBody<{
    name?: unknown;
    response?: unknown;
  }>(request);

  return finishAdminPasskeyRegistration(
    request,
    typeof body.response === 'object' && body.response
      ? (body.response as Record<string, unknown>)
      : {},
    typeof body.name === 'string' ? body.name : '',
  );
};
