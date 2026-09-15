import { AdminPage } from '@/app/components/AdminPage';

import Usage from './usage';

const UsagePage = () => {
  return (
    <AdminPage initialTab="usage">
      <Usage />
    </AdminPage>
  );
};

export default UsagePage;
