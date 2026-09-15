import { AdminPage } from '@/app/components/AdminPage';

import ApiTest from './api-test';

export const dynamic = 'force-dynamic';

const ApiTestPage = async () => {
  return (
    <AdminPage initialTab="api-test">
      <ApiTest />
    </AdminPage>
  );
};

export default ApiTestPage;
