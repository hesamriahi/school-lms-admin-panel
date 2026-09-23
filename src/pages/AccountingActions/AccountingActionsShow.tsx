import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import { ToJalali } from '../../classes/ToJalali';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

// دادهٔ هر آیتم از API (مطابق response)
interface RowInstallments {
  national_code: number;
  full_name: string;
  loan_amount: number;
  installment_amount: number;
  remaind_amount: number;
}

interface RowMembershipFee {
  national_code: number;
  full_name: string;
  balance: number;
  membership_fee: number;
}

type ItemData = RowInstallments | RowMembershipFee;

interface AccountingActionItem {
  id: number;
  accounting_action_id: number;
  data: ItemData;
  contradictions: string[];
  errors?: string[];
  user_id?: number;
  loan_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AccountingActionShow {
  id: number;
  type: 'installments' | 'membership_fee';
  month: number;
  year: number;
  total_amount: number;
  created_at: string;
  items: AccountingActionItem[];
}

const PERSIAN_MONTHS: Record<number, string> = {
  1: 'فروردین',
  2: 'اردیبهشت',
  3: 'خرداد',
  4: 'تیر',
  5: 'مرداد',
  6: 'شهریور',
  7: 'مهر',
  8: 'آبان',
  9: 'آذر',
  10: 'دی',
  11: 'بهمن',
  12: 'اسفند',
};

const TYPE_LABELS: Record<string, string> = {
  installments: 'اقساط',
  membership_fee: 'حق عضویت',
};

const convertToPersianDigits = (num: number | string): string => {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  return String(num).replace(/\d/g, (digit) => {
    const index = englishDigits.indexOf(digit);
    return index !== -1 ? persianDigits[index] : digit;
  });
};

const formatNumber = (n: number | string) =>
  Number(n).toLocaleString('fa-IR');

export default function AccountingActionsShow() {
  if (Permission.check(['super_admin', 'accounting']) === false) return <Navigate to={ROUTES.home} replace />;
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<AccountingActionShow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    ApiRequest.call(`api/admin/accounting-actions/${id}`, 'GET')
      .then((response: ApiResponse) => {
        const ac = response?.data?.accountingAction;
        if (ac) setAction(ac);
        else setError('عملیات حسابداری یافت نشد.');
      })
      .catch(() => setError('خطا در بارگذاری اطلاعات.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return null;
  if (loading) return <PageBreadcrumb pageTitle="نمایش عملیات حسابداری" />;
  if (error || !action) {
    return (
      <>
        <PageBreadcrumb pageTitle="نمایش عملیات حسابداری" />
        <p className="text-red-500 dark:text-red-400">{error || 'یافت نشد'}</p>
      </>
    );
  }

  const monthLabel = PERSIAN_MONTHS[action.month] ?? action.month;
  const typeLabel = TYPE_LABELS[action.type] ?? action.type;

  return (
    <>
      <PageBreadcrumb pageTitle={`نمایش عملیات حسابداری #${id}`} />
      <div className="space-y-6">
        <ComponentCard title="اطلاعات عملیات">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">نوع</span>
              <p className="font-medium text-gray-800 dark:text-gray-200">{typeLabel}</p>
            </div>
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">ماه</span>
              <p className="font-medium text-gray-800 dark:text-gray-200">{monthLabel}</p>
            </div>
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">سال</span>
              <p className="font-medium text-gray-800 dark:text-gray-200">{action.year}</p>
            </div>
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">مجموع کل</span>
              <p className="font-medium text-gray-800 dark:text-gray-200">{formatNumber(action.total_amount)}</p>
            </div>
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">تاریخ ثبت</span>
              <p className="font-medium text-gray-800 dark:text-gray-200">{ToJalali(action.created_at)}</p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="جدول آیتم‌ها">
          <div className="overflow-x-auto rounded-xl border-2 border-gray-400 dark:border-gray-500">
            {action.type === 'installments' ? (
              <table className="w-full min-w-[600px] border-collapse border-2 border-gray-400 dark:border-gray-500">
                <thead>
                  <tr className="border-b-2 border-gray-400 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
                    <th className="border-l border-gray-400 px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">نام کامل</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">کد ملی</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">مبلغ وام</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">مبلغ قسط</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">مبلغ مانده</th>
                  </tr>
                </thead>
                <tbody>
                  {(action.items ?? []).map((item) => {
                    const row = item.data as RowInstallments;
                    const itemErrors = item.errors ?? [];
                    const itemContradictions = item.contradictions ?? [];
                    return (
                      <Fragment key={item.id}>
                        <tr className="border-b border-t border-gray-400 hover:bg-gray-50 dark:border-gray-500 dark:hover:bg-gray-800/50">
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{row.full_name ?? '—'}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{convertToPersianDigits(row.national_code)}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{formatNumber(row.loan_amount)}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{formatNumber(Math.abs(row.installment_amount))}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{formatNumber(row.remaind_amount)}</td>
                        </tr>
                        {(itemErrors?.length > 0 || itemContradictions?.length > 0) && (
                          <tr>
                            <td colSpan={5} className="border-l border-gray-400 bg-red-50 px-4 py-2 dark:border-gray-500 dark:bg-gray-900/50">
                              <div className="flex flex-col gap-0.5 text-xs">
                                {Array.isArray(itemErrors) && itemErrors.length > 0 && itemErrors?.map((err, i) => (
                                  <span key={i} className="text-red-400 dark:text-red-500">خطا: {err}</span>
                                ))}
                                {Array.isArray(itemContradictions) && itemContradictions.length > 0 && itemContradictions?.map((c, i) => (
                                  <span key={i} className="text-blue-400 dark:text-blue-500">مغایرت: {c}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[500px] border-collapse border-2 border-gray-400 dark:border-gray-500">
                <thead>
                  <tr className="border-b-2 border-gray-400 bg-gray-200 dark:border-gray-500 dark:bg-gray-800">
                    <th className="border-l border-gray-400 px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">نام و نام خانوادگی</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">کد ملی</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">موجودی</th>
                    <th className="border-l border-gray-400 px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">حق عضویت</th>
                  </tr>
                </thead>
                <tbody>
                  {(action.items ?? []).map((item) => {
                    const row = item.data as RowMembershipFee;
                    const itemErrors = item.errors ?? [];
                    const itemContradictions = item.contradictions ?? [];
                    return (
                      <Fragment key={item.id}>
                        <tr className="border-b border-t border-gray-400 hover:bg-gray-50 dark:border-gray-500 dark:hover:bg-gray-800/50">
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{row.full_name ?? '—'}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{convertToPersianDigits(row.national_code)}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{formatNumber(row.balance)}</td>
                          <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">{formatNumber(Math.abs(row.membership_fee))}</td>
                        </tr>
                        {(itemErrors.length > 0 || itemContradictions.length > 0) && (
                          <tr>
                            <td colSpan={4} className="border-l border-gray-400 bg-red-50 px-4 py-2 dark:border-gray-500 dark:bg-gray-900/50">
                              <div className="flex flex-col gap-0.5 text-xs">
                                {itemErrors.map((err, i) => (
                                  <span key={i} className="text-red-400 dark:text-red-500">خطا: {err}</span>
                                ))}
                                {itemContradictions.map((c, i) => (
                                  <span key={i} className="text-blue-400 dark:text-blue-500">مغایرت: {c}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
