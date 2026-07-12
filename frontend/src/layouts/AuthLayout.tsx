import { Outlet, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const AuthLayout = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const maxWidthClass = isRegister ? 'sm:max-w-3xl' : 'sm:max-w-md';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className={`sm:mx-auto sm:w-full ${maxWidthClass}`}>
        <div className="flex justify-center mb-2">
           <Logo size="lg" />
        </div>
        <p className="text-center text-sm text-gray-600">
          The ultimate monetization platform for creators
        </p>
      </div>

      <div className={`mt-8 sm:mx-auto sm:w-full ${maxWidthClass}`}>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
