import { useSelector } from 'react-redux';
import { BoxIconLine, GroupIcon } from '../../icons';
import { Link } from 'react-router';
import {ROUTES} from "../../routes.ts";

export default function UserEcommerceMetrics() {
  const totals = useSelector((state: any) => state.homeSlice.totals);
    return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
    {/* <!-- Metric Item Start --> */}
      <Link to={ROUTES.userLoans}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <GroupIcon className="size-6 text-gray-800 dark:text-white/90" />
          </div>

          <div className="flex min-w-0 flex-1 items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">وام های من</span>
              <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">{totals.myNormalLoans}</h4>
            </div>
          </div>
        </div>
      </Link>
    {/* <!-- Metric Item End --> */}

    {/* <!-- Metric Item Start --> */}
      <Link to={ROUTES.userLoans}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <BoxIconLine className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex min-w-0 flex-1 items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">مساعده های من</span>
              <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">{totals.myAssistanceLoans}</h4>
            </div>
          </div>
        </div>
      </Link>
    {/* <!-- Metric Item End --> */}
    {/* <!-- Metric Item Start --> */}
    <Link to={ROUTES.userInstallments}>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxIconLine className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex min-w-0 flex-1 items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">اقساط من</span>
            <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">{totals.myInstallments}</h4>
          </div>
        </div>
      </div>
    </Link>
    {/* <!-- Metric Item End --> */}

    </div>
  );
}
