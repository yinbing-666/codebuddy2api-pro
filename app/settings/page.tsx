import { AdminPage } from '@/app/page';

import Settings from './settings';

export const dynamic = 'force-dynamic';

const SettingsPage = async () => {
  return (
    <AdminPage initialTab="settings">
      <Settings />
    </AdminPage>
  );
};

export default SettingsPage;
