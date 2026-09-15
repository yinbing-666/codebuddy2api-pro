import { AdminPage } from '@/app/page';

import Debug from './debug';

export const dynamic = 'force-dynamic';

const DebugPage = async () => {
  return (
    <AdminPage initialTab="debug">
      <Debug />
    </AdminPage>
  );
};

export default DebugPage;
