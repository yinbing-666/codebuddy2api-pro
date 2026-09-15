import {
  createAccessKey,
  listAccessKeys,
  validateCredentialFilenames,
} from '@/lib/server/domain/access-keys';
import { getAdminSessionErrorResponse } from '@/lib/server/admin/session';
import { listCredentialFilenames } from '@/lib/server/domain/credentials';
import { getJsonBody } from '@/lib/server/shared/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  return Response.json(await listAccessKeys());
};

export const POST = async (request: Request): Promise<Response> => {
  const authError = await getAdminSessionErrorResponse(request);

  if (authError) {
    return authError;
  }

  const body = await getJsonBody<{
    credential_filenames?: unknown;
    name?: unknown;
  }>(request);
  const availableCredentialFilenames = await listCredentialFilenames();

  try {
    const created = await createAccessKey({
      credentialFilenames: validateCredentialFilenames(
        body.credential_filenames,
        availableCredentialFilenames,
      ),
      name: typeof body.name === 'string' ? body.name : '',
    });

    return Response.json(created);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create access key',
      },
      { status: 400 },
    );
  }
};
