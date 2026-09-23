import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { Navigate, Outlet } from 'react-router';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import AppSidebar from './AppSidebar';
import Authentication from '../classes/Authentication';
import ToastrNotification from '../classes/ToastrNotification';
import {useDispatch} from "react-redux";
import { useEffect } from 'react';
import PageMeta from "../components/common/PageMeta.tsx";
import Settings from '../classes/Settings.ts';
import { Permission } from '../classes/Permission.ts';



const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const dispatch = useDispatch();

  if (!Authentication.isAuthenticated()) {
    ToastrNotification.error('لطفا وارد شوید');
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (Permission.check(['user']))
      Settings.callUserHomeApi(dispatch);
    else Settings.callHomeApi(dispatch);
  }, [dispatch]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const globalSettings = useSelector((state: any) => state.homeSlice.settings)

  return (  
    <>
      <PageMeta
        title={`صندوق تعاون`}
      />
      <div className="min-h-screen xl:flex">
        <div>
          <AppSidebar />
          <Backdrop />
        </div>
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
            isExpanded || isHovered ? 'lg:mr-[290px]' : 'lg:mr-[90px]'
          } ${isMobileOpen ? 'mr-0' : ''}`}
        >
          <AppHeader />
          <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:px-6 md:py-3">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
