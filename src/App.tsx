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
