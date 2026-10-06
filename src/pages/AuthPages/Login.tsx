import PageMeta from '../../components/common/PageMeta';
import ThemeTogglerTwo from '../../components/common/ThemeTogglerTwo';
import GridShape from '../../components/common/GridShape';
import LoginForm from './LoginLayouts/LoginForm';
import { Link, Navigate } from 'react-router';
import Authentication from '../../classes/Authentication';
import { ROUTES } from '../../routes';

export default function Login() {
  if (Authentication.isAuthenticated()) {
    return <Navigate to={ROUTES.home} />;
  }
  
  return (
    <>
      <PageMeta title="ورود" />

      <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
        <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
          <LoginForm />
          <div className="bg-brand-950 hidden h-full w-full items-center lg:grid lg:w-1/2 dark:bg-white/5">
            <div className="relative z-1 flex items-center justify-center">
              <GridShape />
              <div className="flex max-w-xs flex-col items-center">
                <Link to="/" className="mb-4 block">
                  <img width={330} height={48} src="/images/logo/se-logo.png" alt="Logo" />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  پنل ادمین اتاق آبی
                </p>
              </div>
            </div>
          </div>
          <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </div>
    </>
  );
}
