import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PlugInIcon,
  UserCircleIcon,
  //DocsIcon,
  BoxIcon,
  UserIcon,
  BoxCubeIcon,
  DollarLineIcon,
  PieChartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../icons';
import { useSidebar } from '../context/SidebarContext';
import { ROUTES } from '../routes';
import { Permission } from '../classes/Permission';
import CoreSettings from '../classes/CoreSettings';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavItem[];
  requiredPermissions: string[]
  featureName?: string
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'داشبورد',
    path: ROUTES.home,
    requiredPermissions: ['any']
  },
  {
    icon: <BoxCubeIcon />,
    name: 'خزانه ها',
    path: ROUTES.vaultsIndex,
    requiredPermissions: ['super_admin']
  },
  // user ========================================================================================================
  {
    icon: <DollarLineIcon />,
    name: 'تسهیلات',
    subItems: [
      { name: 'درخواست های من', icon: <UserCircleIcon />, path: ROUTES.userRequestedLoans, requiredPermissions: ['user'] },
      { name: 'وام های من', icon: <UserCircleIcon />, path: ROUTES.userLoans, requiredPermissions: ['user'] },
      { name: 'اقساط', icon: <UserCircleIcon />, path: ROUTES.userInstallments, requiredPermissions: ['user'] }
    ],
    requiredPermissions: ['user']
  },
  // admin ========================================================================================================
  {
    icon: <BoxCubeIcon />,
    name: 'مدیران',
    path: ROUTES.adminIndex,
    requiredPermissions: ['super_admin']
  },
  {
    icon: <UserIcon />,
    name: 'کاربران',
    subItems: [
      { name: 'لیست کاربران', icon: <UserCircleIcon />, path: ROUTES.userIndex, requiredPermissions: ['super_admin',  'accounting'] },
      { name: 'تسویه حساب', icon: <UserCircleIcon />, path: ROUTES.checkoutIndex, requiredPermissions: ['super_admin'] }
    ],
    requiredPermissions: ['super_admin', 'accounting']
  },
  {
    icon: <DollarLineIcon />,
    name: 'تسهیلات',
    subItems: [
      { name: 'رزرو تسهیلات', icon: <UserCircleIcon />, path: ROUTES.reservedLoansIndex, requiredPermissions: ['super_admin'] },
      { name: 'وام های تجمیعی', icon: <UserCircleIcon />, path: ROUTES.paymentLoansIndex, requiredPermissions: ['super_admin'] },
      { name: 'لیست وام ها', icon: <UserCircleIcon />, path: ROUTES.loansIndex, requiredPermissions: ['super_admin'] },
      { name: 'اقساط', icon: <UserCircleIcon />, path: ROUTES.installmentsIndex, requiredPermissions: ['super_admin'] }
    ],
    requiredPermissions: ['super_admin']
  },
  {
    icon: <PieChartIcon />,
    name: 'حسابداری',
    subItems: [
      { name: 'ورودی ها', icon: <UserCircleIcon />, path: ROUTES.accountingActionsIndex, requiredPermissions: ['super_admin', 'accounting'] },
      { name: 'مغایرت‌ها', icon: <UserCircleIcon />, path: ROUTES.contradictionsIndex, requiredPermissions: ['super_admin', 'accounting'] },
    ],
    requiredPermissions: ['super_admin', 'accounting']
  },
  {
    icon: <ArrowDownIcon/>,
    name: 'درآمدها',
    subItems: [
      { name: 'تعریف درآمد', icon: <UserCircleIcon />, path: ROUTES.incomeIndex, requiredPermissions: ['super_admin'] },
      { name: 'درآمد ها', icon: <UserCircleIcon />, path: ROUTES.incomeItemsIndex, requiredPermissions: ['super_admin'] },
    ],
    requiredPermissions: ['super_admin']
  },
  {
    icon: <ArrowUpIcon/>,
    name: 'هزینه ها',
    subItems: [
      { name: 'تعریف هزینه', icon: <UserCircleIcon />, path: ROUTES.expenseIndex, requiredPermissions: ['super_admin'] },
      { name: 'هزینه ها', icon: <UserCircleIcon />, path: ROUTES.expenseItemsIndex, requiredPermissions: ['super_admin'] },
    ],
    requiredPermissions: ['super_admin']
  }
];

// برچسب فارسی برای کلیدهای تنظیمات
const SETTINGS_GROUP_LABELS: Record<string, string> = {
  loans: 'وام',
  general: 'تنظیمات اصلی',
  insurance: 'بیمه',
  userLoan: 'درخواست وام توسط کاربر'
};
function getSettingsGroupLabel(key: string): string {
  return SETTINGS_GROUP_LABELS[key] ?? key;
}


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const permissions = useSelector((state: any) => state.homeSlice.permissions);
  const globalSettings = useSelector((state: any) => state.homeSlice.settings);

  const settingsNavItem: NavItem | null = useMemo(() => {
    const settings =
      globalSettings && typeof globalSettings === 'object' && !Array.isArray(globalSettings)
        ? globalSettings
        : {};
    const keys = Object.keys(settings);
    if (keys.length === 0) return null;
    return {
      icon: <PlugInIcon />,
      name: 'تنظیمات',
      subItems: keys.map((key) => ({
        name: getSettingsGroupLabel(key),
        icon: <BoxIcon />,
        path: ROUTES.settingsGroup.replace(':group', key),
        requiredPermissions: ['super_admin'],
      })),
      requiredPermissions: ['super_admin'],
    };
  }, [globalSettings]);

  const mainNavItems = useMemo(
    () => (settingsNavItem ? [...navItems, settingsNavItem] : navItems),
    [settingsNavItem]
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ['main', 'others'].forEach((menuType) => {
      const items = menuType === 'main' ? mainNavItems : [];
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (subItem.path && isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, permissions, mainNavItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => 
        // Check if the user hasn't the required permissions, then don't render the menu item
        Permission.check(nav.requiredPermissions) && (!nav.featureName || CoreSettings.featureChecker(nav.featureName)) && (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-active'
                    : 'menu-item-inactive'
                } cursor-pointer ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? 'text-brand-500 rotate-180'
                        : ''
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : '0px',
                }}
              >
                <ul className="mt-2 ml-9 space-y-1">
                  {nav.subItems.map((subItem) => (
                    Permission.check(subItem.requiredPermissions) && (!subItem.featureName || CoreSettings.featureChecker(subItem.featureName)) && (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path || '/'}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path || '')
                              ? 'menu-dropdown-item-active'
                              : 'menu-dropdown-item-inactive'
                          }`}
                        >
                          {subItem.name}
                          <span className="ml-auto flex items-center gap-1">
                            {/* {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path || '')
                                    ? 'menu-dropdown-badge-active'
                                    : 'menu-dropdown-badge-inactive'
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )} */}
                            {/* {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path || '')
                                    ? 'menu-dropdown-badge-active'
                                    : 'menu-dropdown-badge-inactive'
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )} */}
                          </span>
                        </Link>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      )}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 right-0 z-50 mt-16 flex h-screen flex-col border-l border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'
      } ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isMobileOpen && (
        <>
          <div
            className={`flex py-8 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}
          >
            <Link to={ROUTES.home}>
              
              {isExpanded || isHovered || isMobileOpen ? (
                <>
                  <img
                    className="dark:hidden"
                    src="/images/logo/se-logo.png"
                    alt="Logo"
                    width={2000}
                    height={40}
                  />
                  <img
                    className="hidden dark:block"
                    src="/images/logo/se-logo.png"
                    alt="Logo"
                    width={2000}
                    height={40}
                  />
                </>
              ) : (
                <img src="/images/logo/se-icon.png" alt="Logo" width={50} height={32} />
              )}
            </Link>
          </div>
        </>
      )}
      
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Menu'
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(mainNavItems, 'main')}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
