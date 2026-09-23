import { Fragment, useState } from 'react';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Button from '../../components/ui/button/Button';
import DropZone from '../../components/form/form-elements/DropZone';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import ToastrNotification from '../../classes/ToastrNotification';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";

dayjs.extend(jalaliday);

// انواع پاسخ ویترین (showcase)
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

type ValidatorRow = RowInstallments | RowMembershipFee;

interface ValidatorResultItem {
  row: ValidatorRow;
  errors: string[];
  contradictions: string[];
}

interface ShowcaseData {
  totalRowsAmount: number;
  countErrors: number;
  countContradictions: number;
  validatorResults: ValidatorResultItem[];
}

// نام‌های ماه‌های شمسی
const persianMonths = [
  { value: '1', label: 'فروردین' },
  { value: '2', label: 'اردیبهشت' },
  { value: '3', label: 'خرداد' },
  { value: '4', label: 'تیر' },
  { value: '5', label: 'مرداد' },
  { value: '6', label: 'شهریور' },
  { value: '7', label: 'مهر' },
  { value: '8', label: 'آبان' },
  { value: '9', label: 'آذر' },
  { value: '10', label: 'دی' },
  { value: '11', label: 'بهمن' },
  { value: '12', label: 'اسفند' },
];

// نوع عملیات حسابداری
const accountingActionTypes = [
  { value: 'installments', label: 'اقساط پرداخت شده' },
  { value: 'membership_fee', label: 'حق عضویت ها' },
  { value: 'assistance_installments', label: 'اقساط وام های مساعده' },
];

export default function AccountingActionsStore() {
  if (Permission.check(['super_admin', 'accounting']) === false) return <Navigate to={ROUTES.home} replace />;
  const navigate = useNavigate();
  
  // دریافت سال و ماه فعلی شمسی
  const getCurrentPersianYear = () => {
    return dayjs().calendar('jalali').year();
  };

  const getCurrentPersianMonth = () => {
    return dayjs().calendar('jalali').month() + 1; // month() returns 0-11, so add 1
  };

  const [formData, setFormData] = useState({
    year: getCurrentPersianYear().toString(),
    month: getCurrentPersianMonth().toString(),
    type: 'installments', // پیش‌فرض: اقساط پرداخت شده
  });

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingShowcase, setIsLoadingShowcase] = useState(false);
  const [showcaseData, setShowcaseData] = useState<ShowcaseData | null>(null);
  const [showcaseFilter, setShowcaseFilter] = useState<'errors' | 'contradictions' | null>(null);

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // بررسی اینکه فایل اکسل است
      const file = acceptedFiles[0];
      const isValidExcel = 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls');
      
      if (isValidExcel) {
        setExcelFile(file);
        setShowcaseData(null);
        setShowcaseFilter(null);
      } else {
        ToastrNotification.error('لطفاً یک فایل اکسل معتبر انتخاب کنید');
      }
    }
  };

  // همان داده‌ای که برای ثبت نهایی فرستاده می‌شود: فایل اکسل + سال، ماه، نوع
  const getRequestData = () => ({
    year: formData.year,
    month: formData.month,
    type: formData.type,
    excel_file: excelFile,
  });

  const handleShowcase = async () => {
    if (!excelFile) {
      ToastrNotification.error('لطفاً فایل اکسل را انتخاب کنید');
      return;
    }
    setIsLoadingShowcase(true);
    setShowcaseData(null);
    setShowcaseFilter(null);
    try {
      // درخواست showcase با همان ساختار قبلی: فایل اکسل + year, month, type (FormData)
      const response: ApiResponse = await ApiRequest.call(
        'api/admin/accounting-actions/showcase',
        'POST',
        getRequestData(),
        null,
        false,
        true,
        true // hasFile = true
      );
      if (response.success && response.data) {
        setShowcaseData(response.data as ShowcaseData);
      } else {
        ToastrNotification.error(response.message || 'خطا در بررسی فایل');
      }
    } catch {
      ToastrNotification.error('خطا در ارسال درخواست');
    } finally {
      setIsLoadingShowcase(false);
    }
  };

  const handleSubmit = async () => {
    if (!excelFile) {
      ToastrNotification.error('لطفاً فایل اکسل را انتخاب کنید');
      return;
    }
    if (showcaseData && showcaseData.countErrors > 0) {
      ToastrNotification.error('ابتدا خطاها را برطرف کنید');
      return;
    }

    setIsSubmitting(true);
    try {
      const response: ApiResponse = await ApiRequest.call(
        'api/admin/accounting-actions',
        'POST',
        getRequestData(),
        null,
        true,
        true,
        true
      );

      if (response.success) {
        navigate(ROUTES.accountingActionsIndex);
      } else {
        ToastrNotification.error(response.message || 'خطا در ثبت عملیات حسابداری');
      }
    } catch {
      ToastrNotification.error('خطا در ارسال درخواست');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (n: number) => n.toLocaleString('fa-IR');

  const filteredValidatorResults = showcaseData
    ? showcaseData.validatorResults.filter((item) => {
        if (showcaseFilter === 'errors') return item.errors.length > 0;
        if (showcaseFilter === 'contradictions') return item.contradictions.length > 0;
        return true;
      })
    : [];

  return (
    <div>
      <PageMeta title="ثبت ورودی حسابداری" />
      <PageBreadcrumb pageTitle="ثبت ورودی حسابداری" />
      <ComponentCard title="اطلاعات ورودی حسابداری">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ستون اول: فیلدهای فرم */}
          <div className="flex flex-col gap-6">
            {/* سال */}
            <div>
              <Label htmlFor="year">سال</Label>
              <Input
                type="number"
                id="year"
                name="year"
                placeholder="سال را وارد کنید"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            {/* ماه */}
            <div>
              <Label htmlFor="month">ماه</Label>
              <Select
                options={persianMonths}
                placeholder="ماه را انتخاب کنید"
                defaultValue={formData.month}
                onChange={(value) => setFormData({ ...formData, month: value })}
              />
            </div>

            {/* نوع عملیات */}
            <div>
              <Label htmlFor="type">نوع عملیات</Label>
              <Select
                options={accountingActionTypes}
                placeholder="نوع عملیات را انتخاب کنید"
                defaultValue={formData.type}
                onChange={(value) => {
                  setFormData({ ...formData, type: value });
                  setShowcaseData(null);
                  setShowcaseFilter(null);
                }}
              />
            </div>
          </div>

          {/* ستون دوم: آپلود فایل اکسل */}
          <div>
            <Label>فایل اکسل</Label>
            <div className="mt-2">
              <DropZone
                onDrop={handleFileDrop}
                accept={{
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.ms-excel': ['.xls'],
                }}
                selectedFile={excelFile}
                multiple={false}
              />
            </div>
          </div>
        </div>

        {/* دکمه بررسی (ویترین) */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleShowcase}
            disabled={isLoadingShowcase || !excelFile}
            type="button"
          >
            {isLoadingShowcase ? 'در حال بررسی...' : 'بررسی فایل'}
          </Button>
        </div>
      </ComponentCard>

      {/* نتایج ویترین */}
      {showcaseData && (
        <ComponentCard title="نتایج بررسی" className="mt-6">
          {/* باکس‌های جمع کل، تعداد خطا و مغایرت */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="rounded-xl border-2 border-green-500  px-4 py-2 dark:border-green-500">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                جمع کل: {formatNumber(Math.abs(showcaseData.totalRowsAmount))}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowcaseFilter((prev) => (prev === 'errors' ? null : 'errors'))}
              className={`cursor-pointer rounded-xl border-2 border-red-500 px-4 py-2 transition-colors ${
                showcaseFilter === 'errors'
                  ? 'bg-red-500 text-white'
                  : 'bg-transparent text-red-700 dark:text-red-300'
              }`}
            >
              <span className="text-sm font-medium">
                خطاها: {formatNumber(showcaseData.countErrors)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowcaseFilter((prev) => (prev === 'contradictions' ? null : 'contradictions'))}
              className={`cursor-pointer rounded-xl border-2 border-blue-500 px-4 py-2 transition-colors ${
                showcaseFilter === 'contradictions'
                  ? 'bg-blue-500 text-white'
                  : 'bg-transparent text-blue-700 dark:text-blue-300'
              }`}
            >
              <span className="text-sm font-medium">
                مغایرت ها: {formatNumber(showcaseData.countContradictions)}
              </span>
            </button>
            {showcaseData.countErrors === 0 && (
              <div className="flex items-center">
                <Button
                  variant="success"
                  size="md"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  type="button"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'ثبت نهایی'}
                </Button>
              </div>
            )}
          </div>

          {/* جدول — بر اساس type اقساط یا حق عضویت */}
          <div className="overflow-x-auto rounded-xl border-2 border-gray-400 dark:border-gray-500">
            {formData.type === 'installments' || formData.type === 'assistance_installments' ? (
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
                  {filteredValidatorResults.map((item, index) => (
                    <Fragment key={index}>
                      <tr className="border-b border-t border-gray-400 hover:bg-gray-50 dark:border-gray-500 dark:hover:bg-gray-800/50">
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {(item.row as RowInstallments).full_name ?? '—'}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {item.row.national_code}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {formatNumber((item.row as RowInstallments).loan_amount)}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {formatNumber(Math.abs((item.row as RowInstallments).installment_amount))}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {formatNumber((item.row as RowInstallments).remaind_amount)}
                        </td>
                      </tr>
                      {(item.errors.length > 0 || item.contradictions.length > 0) && (
                        <tr>
                          <td colSpan={5} className="border-l border-gray-400 bg-red-50 px-4 py-2 dark:border-gray-500 dark:bg-gray-900/50">
                            <div className="flex flex-col gap-0.5 text-xs">
                              {item.errors.map((err, i) => (
                                <span key={i} className="text-red-400 dark:text-red-500">خطا: {err}</span>
                              ))}
                              {item.contradictions.map((c, i) => (
                                <span key={i} className="text-blue-400 dark:text-blue-500">مغایرت: {c}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
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
                  {filteredValidatorResults.map((item, index) => (
                    <Fragment key={index}>
                      <tr className="border-b border-t border-gray-400 hover:bg-gray-50 dark:border-gray-500 dark:hover:bg-gray-800/50">
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {(item.row as RowMembershipFee).full_name ?? '—'}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {item.row.national_code}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {formatNumber((item.row as RowMembershipFee).balance)}
                        </td>
                        <td className="border-l border-gray-400 px-4 py-3 text-sm text-gray-800 dark:border-gray-500 dark:text-gray-200">
                          {formatNumber(Math.abs((item.row as RowMembershipFee).membership_fee))}
                        </td>
                      </tr>
                      {(item.errors.length > 0 || item.contradictions.length > 0) && (
                        <tr>
                          <td colSpan={4} className="border-l border-gray-400 bg-red-50 px-4 py-2 dark:border-gray-500 dark:bg-gray-900/50">
                            <div className="flex flex-col gap-0.5 text-xs">
                              {item.errors.map((err, i) => (
                                <span key={i} className="text-red-400 dark:text-red-500">خطا: {err}</span>
                              ))}
                              {item.contradictions.map((c, i) => (
                                <span key={i} className="text-blue-400 dark:text-blue-500">مغایرت: {c}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
