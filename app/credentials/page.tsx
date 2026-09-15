import { AdminPage } from '@/app/components/AdminPage';

import Credentials from './credentials';

const CredentialsPage = async () => {
  return (
    <AdminPage initialTab="credentials">
      <Credentials />
    </AdminPage>
  );
};

export default CredentialsPage;
