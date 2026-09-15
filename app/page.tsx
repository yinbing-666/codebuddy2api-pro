import { redirect } from 'next/navigation';

export { AdminPage } from '@/app/components/AdminPage';

const RootPage = () => {
  redirect('/dashboard');
};

export default RootPage;