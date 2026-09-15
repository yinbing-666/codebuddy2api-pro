import { getJsonBody } from '@/lib/server/shared/http';
import {
  beginAdminPasskeyRegistration,
  getAdminSessionErrorResponse,
} from '@/lib/server/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  const body = await getJsonBody<{ name?: unknown }>(request);

  return beginAdminPasskeyRegistration(
    request,
    typeof body.name === 'string' ? body.name : '',
  );
};
