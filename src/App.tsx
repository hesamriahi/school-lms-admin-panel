import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Login from './pages/AuthPages/Login';
import NotFound from './pages/OtherPage/NotFound';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import Home from './pages/Dashboard/Home';
import { ToastContainer } from 'react-toastify';
import { ROUTES } from './routes';
import UserIndex from './pages/Users/UserIndex';
import UserCreateEdit from './pages/Users/UserCreateEdit';
import UserTransactionIndex from './pages/Users/UserTransactionIndex';
import ReservedLoansIndex from './pages/Loans/ReservedLoans/ReservedLoansIndex';
import PaymentLoansIndex from './pages/Loans/PaymentLoans/PaymentLoansIndex';
import PaymentLoansShow from './pages/Loans/PaymentLoans/PaymentLoansShow';
import LoansIndex from './pages/Loans/LoansIndex';
import InstallmentsIndex from './pages/Loans/InstallmentsIndex';
import AccountingActionsIndex from './pages/AccountingActions/AccountingActionsIndex.tsx';
import AccountingActionsStore from './pages/AccountingActions/AccountingActionsStore';
import AccountingActionsShow from './pages/AccountingActions/AccountingActionsShow.tsx';
import SettingsGroup from './pages/Settings/SettingsGroup';
import VaultIndex from './pages/Vault/VaultIndex.tsx';
import VaultTransactions from './pages/Vault/VaultTransactions.tsx';
import IncomeIndex from './pages/Income/IncomeIndex.tsx';
import IncomeItemsIndex from './pages/Income/IncomeItemsIndex.tsx';
import ExpenseIndex from './pages/Expense/ExpenseIndex.tsx';
import ExpenseItemsIndex from './pages/Expense/ExpenseItemsIndex.tsx';
import AdminProfile from './pages/Users/AdminProfile.tsx';
import AdminsIndex from './pages/Users/AdminsIndex.tsx';
import CheckoutIndex from './pages/Users/Checkouts/CheckoutIndex.tsx';
import ContradictionsIndex from './pages/Contradictions/ContradictionsIndex.tsx';

import UserInstallmentsIndex from './pages/Loans/User/UserInstallmentsIndex';
import UserLoansIndex from './pages/Loans/User/UserLoansIndex';
import UserRequestedLoansIndex from './pages/Loans/User/UserRequestedLoansIndex';
import TeacherIndex from './pages/Teachers/TeacherIndex';
import TeacherCreateEdit from './pages/Teachers/TeacherCreateEdit';
import StudentCommentIndex from './pages/StudentComments/StudentCommentIndex';
import StudentCommentCreateEdit from './pages/StudentComments/StudentCommentCreateEdit';
import CategoryIndex from './pages/Categories/CategoryIndex';
import CategoryCreateEdit from './pages/Categories/CategoryCreateEdit';
import CourseIndex from './pages/Courses/CourseIndex';
import CourseCreateEdit from './pages/Courses/CourseCreateEdit';
import UnitIndex from './pages/Courses/UnitIndex';
import UnitCreateEdit from './pages/Courses/UnitCreateEdit';
import PlanIndex from './pages/Plans/PlanIndex';
import PlanCreateEdit from './pages/Plans/PlanCreateEdit';
import SectionIndex from './pages/Sections/SectionIndex';
import SectionCreateEdit from './pages/Sections/SectionCreateEdit';
import SliderIndex from './pages/Sliders/SliderIndex';
import SliderCreateEdit from './pages/Sliders/SliderCreateEdit';
import GatewayIndex from './pages/Gateways/GatewayIndex';
import GatewayCreateEdit from './pages/Gateways/GatewayCreateEdit';
import ProvinceIndex from './pages/Areas/ProvinceIndex';
import ProvinceCreateEdit from './pages/Areas/ProvinceCreateEdit';
import CityIndex from './pages/Areas/CityIndex';
import CityCreateEdit from './pages/Areas/CityCreateEdit';



export default function App() {
  return (
    <>
      {/* Toast Container for notifications */}
      <ToastContainer />

      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path={ROUTES.home} element={<Home />} />
            {/* Teachers */}
            <Route path={ROUTES.teacherIndex} element={<TeacherIndex />} />
            <Route path={ROUTES.teacherCreate} element={<TeacherCreateEdit />} />
            <Route path={ROUTES.teacherEdit} element={<TeacherCreateEdit />} />
            {/* Student Comments */}
            <Route path={ROUTES.studentCommentIndex} element={<StudentCommentIndex />} />
            <Route path={ROUTES.studentCommentCreate} element={<StudentCommentCreateEdit />} />
            <Route path={ROUTES.studentCommentEdit} element={<StudentCommentCreateEdit />} />
            {/* Categories */}
            <Route path={ROUTES.categoryIndex} element={<CategoryIndex />} />
            <Route path={ROUTES.categoryCreate} element={<CategoryCreateEdit />} />
            <Route path={ROUTES.categoryEdit} element={<CategoryCreateEdit />} />
            {/* Courses + Units */}
            <Route path={ROUTES.courseCreate} element={<CourseCreateEdit />} />
            <Route path={ROUTES.courseUnitCreate} element={<UnitCreateEdit />} />
            <Route path={ROUTES.courseUnitEdit} element={<UnitCreateEdit />} />
            <Route path={ROUTES.courseUnitsIndex} element={<UnitIndex />} />
            <Route path={ROUTES.courseEdit} element={<CourseCreateEdit />} />
            <Route path={ROUTES.courseIndex} element={<CourseIndex />} />
            {/* Plans */}
            <Route path={ROUTES.planIndex} element={<PlanIndex />} />
            <Route path={ROUTES.planCreate} element={<PlanCreateEdit />} />
            <Route path={ROUTES.planEdit} element={<PlanCreateEdit />} />
            {/* Sections */}
            <Route path={ROUTES.sectionIndex} element={<SectionIndex />} />
            <Route path={ROUTES.sectionCreate} element={<SectionCreateEdit />} />
            <Route path={ROUTES.sectionEdit} element={<SectionCreateEdit />} />
            {/* Sliders */}
            <Route path={ROUTES.sliderIndex} element={<SliderIndex />} />
            <Route path={ROUTES.sliderCreate} element={<SliderCreateEdit />} />
            <Route path={ROUTES.sliderEdit} element={<SliderCreateEdit />} />
            {/* Gateways */}
            <Route path={ROUTES.gatewayIndex} element={<GatewayIndex />} />
            <Route path={ROUTES.gatewayCreate} element={<GatewayCreateEdit />} />
            <Route path={ROUTES.gatewayEdit} element={<GatewayCreateEdit />} />
            {/* Areas */}
            <Route path={ROUTES.provinceIndex} element={<ProvinceIndex />} />
            <Route path={ROUTES.provinceCreate} element={<ProvinceCreateEdit />} />
            <Route path={ROUTES.provinceEdit} element={<ProvinceCreateEdit />} />
            <Route path={ROUTES.cityIndex} element={<CityIndex />} />
            <Route path={ROUTES.cityCreate} element={<CityCreateEdit />} />
            <Route path={ROUTES.cityEdit} element={<CityCreateEdit />} />
            {/* Users */}
            <Route path={ROUTES.userIndex} element={<UserIndex />} />
            <Route path={ROUTES.userCreate} element={<UserCreateEdit />} />
            <Route path={ROUTES.userEdit} element={<UserCreateEdit />} />
            <Route path={ROUTES.userTransactionIndex} element={<UserTransactionIndex />} />
            {/* Reserved Loans */}
            <Route path={ROUTES.reservedLoansIndex} element={<ReservedLoansIndex />} />
            {/* Payment Loans */}
            <Route path={ROUTES.paymentLoansIndex} element={<PaymentLoansIndex />} />
            <Route path={ROUTES.paymentLoansShow} element={<PaymentLoansShow />} />
            {/* Loans */}
            <Route path={ROUTES.loansIndex} element={<LoansIndex />} />
            <Route path={ROUTES.installmentsIndex} element={<InstallmentsIndex />} />
            {/* Accounting Actions */}
            <Route path={ROUTES.accountingActionsIndex} element={<AccountingActionsIndex />} />
            <Route path={ROUTES.accountingActionsStore} element={<AccountingActionsStore />} />
            <Route path={ROUTES.accountingActionsShow} element={<AccountingActionsShow />} />
            <Route path={ROUTES.contradictionsIndex} element={<ContradictionsIndex />} />
            {/* Settings */}
            <Route path={ROUTES.settingsGroup} element={<SettingsGroup />} />
            {/* Vaults */}
            <Route path={ROUTES.vaultsIndex} element={<VaultIndex />} />
            <Route path={ROUTES.vaultTransactions} element={<VaultTransactions />} />
            {/* Incomes */}
            <Route path={ROUTES.incomeIndex} element={<IncomeIndex />} />
            <Route path={ROUTES.incomeItemsIndex} element={<IncomeItemsIndex />} />
            {/* Expenses */}
            <Route path={ROUTES.expenseIndex} element={<ExpenseIndex />} />
            <Route path={ROUTES.expenseItemsIndex} element={<ExpenseItemsIndex />} />
            {/* admin profile */}
            <Route path={ROUTES.adminProfile} element={<AdminProfile />} />
            {/* admins index */}
            <Route path={ROUTES.adminIndex} element={<AdminsIndex />} />
            {/* checkouts */}
            <Route path={ROUTES.checkoutIndex} element={<CheckoutIndex />} />




            {/* User Routes ==================================================================== */}
            <Route path={ROUTES.userLoans} element={<UserLoansIndex />} />
            <Route path={ROUTES.userRequestedLoans} element={<UserRequestedLoansIndex />} />
            <Route path={ROUTES.userInstallments} element={<UserInstallmentsIndex />} />
            
          </Route>

          {/* Auth Layout */}
          <Route path={ROUTES.login} element={<Login />} />

          {/* Fallback Route */}
          <Route path={ROUTES.error404} element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
