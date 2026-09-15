import {
  deleteAdminPasskey,
  getAdminSessionErrorResponse,
} from '@/lib/server/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const DELETE = async (
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  return deleteAdminPasskey(request, id);
};
