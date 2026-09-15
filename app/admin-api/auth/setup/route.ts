import { getJsonBody } from '@/lib/server/shared/http';
import {
  hasAdminAccountAsync,
  setupAdminPassword,
} from '@/lib/server/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: Request): Promise<Response> => {
  if (await hasAdminAccountAsync()) {
    return Response.json(
      {
        error: {
          code: 'admin_account_configured',
          message: 'Admin account is already configured',
        },
      },
      { status: 409 },
    );
  }

  const body = await getJsonBody<{ password?: unknown; username?: unknown }>(
    request,
  );

  return await setupAdminPassword(
    request,
    typeof body.username === 'string' ? body.username : '',
    typeof body.password === 'string' ? body.password : '',
  );
};
