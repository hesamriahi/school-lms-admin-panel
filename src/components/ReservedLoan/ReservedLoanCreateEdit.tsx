import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import SearchableDropDownList from '../common/SearchableDropDownList';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import ToastrNotification from '../../classes/ToastrNotification';
import Loans from '../../classes/Loan';
import Select from '../../components/form/Select.tsx';

interface ReservedLoanCreateEditProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // آیتم برای حالت ویرایش
  onSuccess?: () => void; // callback بعد از موفقیت
}

interface FormData {
  user_id: number | null;
  amount: string;
  commission_amount: string;
  insurance_amount: string;
  installments_count: string;
  installment_amount: string;
  other_reduces_amount: string;
  paid_user_amount: string;
  type: string;
}

const ReservedLoanCreateEdit: React.FC<ReservedLoanCreateEditProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const isUpdateMode = !!item;
  
  const [formData, setFormData] = useState<FormData>({
    user_id: null,
    amount: '',
    commission_amount: '',
    insurance_amount: '',
    installments_count: '',
    installment_amount: '',
    other_reduces_amount: '',
    paid_user_amount: '',
    type: 'normal'
  });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // بارگذاری داده‌ها در حالت ویرایش
  useEffect(() => {
    if (isOpen) {
      if (isUpdateMode && item) {
        setFormData({
          user_id: item.user?.id || null,
          amount: item.amount?.toString() || '',
          commission_amount: item.commission_amount?.toString() || '',
          insurance_amount: item.insurance_amount?.toString() || '',
          installments_count: item.installments_count?.toString() || '',
          installment_amount: item.installment_amount?.toString() || '',
          other_reduces_amount: '',
          paid_user_amount: '',
          type: item.type
        });
        // تنظیم کاربر انتخاب شده برای نمایش
        if (item.user) {
          setSelectedUser({
            value: item.user.id,
            label: item.user.full_name,
            ...item.user,
          });
        }
      } else {
        // حالت ایجاد - ریست کردن فرم
        setFormData({
          user_id: null,
          amount: '',
          commission_amount: '',
          insurance_amount: '',
          installments_count: '',
          installment_amount: '',
          other_reduces_amount: '',
          paid_user_amount: '',
          type: 'normal'
        });
        setSelectedUser(null);
      }
    }
  }, [isOpen, isUpdateMode, item]);

  // با بستن مودال، کاربر انتخاب‌شده و فرم خالی می‌شوند تا دفعهٔ بعد مودال باز شود خالی باشد
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setFormData({
        user_id: null,
        amount: '',
        commission_amount: '',
        insurance_amount: '',
        installments_count: '',
        installment_amount: '',
        other_reduces_amount: '',
        paid_user_amount: '',
        type: ''
      });
    }
  }, [isOpen]);

  const recalculateReservedLoan = () => {
    const calculatorResult = Loans.calculatorForUser(selectedUser, formData.type, formData.amount);
    
    setFormData((prev) => ({
      ...prev,
      // amount: calculatorResult.amount.toString(),
      commission_amount: calculatorResult.commission_amount.toString(),
      insurance_amount: calculatorResult.insurance_amount.toString(),
      installments_count: calculatorResult.installments_count.toString(),
      installment_amount: calculatorResult.installment_amount.toString(),
      other_reduces_amount: calculatorResult.other_reduces_amount.toString(),
      paid_user_amount: calculatorResult.paid_user_amount.toString(),
    }));
  }

  // مدیریت تغییر کاربر
  const handleUserChange = async (user: any) => {
    if (user) {
      setSelectedUser(user);
      setFormData((prev) => ({
        ...prev,
        user_id: user.value as number,
      }));

      // در حالت ایجاد، محاسبه را انجام بده
      if (!isUpdateMode) {
        try {
          // تبدیل user object به User type برای ارسال به calculatorForUser
          const userObject = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            national_code: user.national_code,
            employment_code: user.employment_code,
            mobile: user.mobile,
            is_active: user.is_active,
            balance: user.balance,
            debt: user.debt,
            created_at: user.created_at,
            updated_at: user.updated_at,
            full_name: user.full_name,
            last_loan: user.last_loan,
          };


          // محاسبه مقادیر
          const calculatorResult = Loans.calculatorForUser(userObject, formData.type);

          // پر کردن فیلدهای فرم با نتایج محاسبه
          setFormData((prev) => ({
            ...prev,
            amount: calculatorResult.amount.toString(),
            commission_amount: calculatorResult.commission_amount.toString(),
            insurance_amount: calculatorResult.insurance_amount.toString(),
            installments_count: calculatorResult.installments_count.toString(),
            installment_amount: calculatorResult.installment_amount.toString(),
            other_reduces_amount: calculatorResult.other_reduces_amount.toString(),
            paid_user_amount: calculatorResult.paid_user_amount.toString(),
          }));
        } catch (error) {
          console.error('خطا در محاسبه:', error);
          ToastrNotification.error('خطا در محاسبه اطلاعات وام');
        }
      }
    } else {
      setSelectedUser(null);
      setFormData((prev) => ({
        ...prev,
        user_id: null,
      }));
    }
  };

  // مدیریت تغییر فیلدها
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // مدیریت ارسال فرم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // اعتبارسنجی
    if (!formData.user_id) {
      ToastrNotification.error('لطفا کاربر را انتخاب کنید');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      ToastrNotification.error('لطفا مبلغ وام را وارد کنید');
      return;
    }

    if (!formData.commission_amount || parseFloat(formData.commission_amount) < 0) {
      ToastrNotification.error('لطفا کمیسیون را وارد کنید');
      return;
    }

    if (!formData.insurance_amount || parseFloat(formData.insurance_amount) < 0) {
      ToastrNotification.error('لطفا مبلغ بیمه را وارد کنید');
      return;
    }

    if (!formData.installment_amount || parseFloat(formData.installment_amount) <= 0) {
      ToastrNotification.error('لطفا مبلغ قسط را وارد کنید');
      return;
    }

    if (parseInt(formData.paid_user_amount) <= 0) {
      ToastrNotification.error('مبلغ پرداختی به این کاربر کوچکتر مساوی صفر است');
      return;
    }

    setIsSubmitting(true);

    try {
      // ساخت requestData بدون other_reduces_amount
      const requestData = {
        user_id: formData.user_id,
        amount: parseFloat(formData.amount),
        commission_amount: parseFloat(formData.commission_amount),
        insurance_amount: parseFloat(formData.insurance_amount),
        installment_amount: parseFloat(formData.installment_amount),
        installments_count: parseInt(formData.installments_count),
        type: formData.type
      };

      let response: ApiResponse;

      if (isUpdateMode) {
        // حالت ویرایش - PUT
        response = await ApiRequest.call(
          `api/admin/reserved-loans/${item.id}`,
          'PUT',
          requestData,
          null,
          true,
          true
        );
      } else {
        // حالت ایجاد - POST
        response = await ApiRequest.call(
          'api/admin/reserved-loans',
          'POST',
          requestData,
          null,
          true,
          true
        );
      }

      if (response.success) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.log('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="m-4 max-w-[600px]"
      showCloseButton={false}
    >
      <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {isUpdateMode ? 'ویرایش وام' : 'ایجاد وام جدید'}
          </h4>
          <p className="mb-2 text-sm text-gray-500 lg:mb-2 dark:text-gray-400">
            {isUpdateMode
              ? 'اطلاعات وام را ویرایش کنید.'
              : 'اطلاعات وام جدید را وارد کنید.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="space-y-3">
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* انتخاب کاربر */}
                <div>
                  <Label>کاربر</Label>
                  <SearchableDropDownList
                    key={isOpen ? 'open' : 'closed'}
                    apiUrl="api/admin/users-search"
                    searchParamName="q"
                    dataPath="data.users"
                    valueKey="id"
                    labelKey="full_name"
                    placeholder="جستجوی کاربر..."
                    onChange={handleUserChange}
                    defaultValue={selectedUser}
                    disabled={isUpdateMode}
                    minSearchLength={1}
                  />
                </div>
                <div className='flex flex-col justify-center h-full'>
                  {/* دیگر کسورات */}
                  {selectedUser && (
                    <p className="text-sm font-medium ">
                      بدهی قرض الحسنه: {Number(selectedUser.debt).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                    </p>
                  )}

                  {/* مبلغ پرداختی */}
                  {selectedUser && (
                    <p className="text-sm font-medium ">
                      سرمایه: {Number(selectedUser.balance).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                    </p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* مبلغ وام */}
                <div>
                  <Label htmlFor="amount">مبلغ وام</Label>
                  {formData.amount}
                  <Input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="مبلغ وام را وارد کنید"
                    value={formData.amount}
                    onChange={handleInputChange('amount')}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                  {/* انتخاب نوع وام قرض الحسنه یا مساعده */}
                </div>
                <div>
                  <Label htmlFor="type">نوع وام</Label>
                  {formData.type && 
                    <Select
                      options={[{value: 'normal', label: 'قرض الحسنه'}, {value:'assistance', label:'مساعده'}]}
                      placeholder="نوع وام را مشخص کنید"
                      defaultValue={formData.type}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          type: value
                        }));
                      }}
                      className="dark:bg-dark-900"
                      disabled={isUpdateMode}
                    />
                  }
                </div>
              </div>
              <Button 
                variant="primary" 
                size="xs" 
                className="bg-gray-400 hover:bg-gray-600 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={recalculateReservedLoan}
              >محاسبه مجدد</Button>

              {/* مبلغ کمیسیون */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* کمیسیون */}
                <div>
                  <Label htmlFor="commission_amount">کمیسیون</Label>
                  <Input
                    type="number"
                    id="commission_amount"
                    name="commission_amount"
                    placeholder="کمیسیون را وارد کنید"
                    value={formData.commission_amount}
                    onChange={handleInputChange('commission_amount')}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                {/* مبلغ بیمه */}
                <div>
                  <Label htmlFor="insurance_amount">مبلغ بیمه</Label>
                  <Input
                    type="number"
                    id="insurance_amount"
                    name="commissioninsuranceamount"
                    placeholder="مبلغ بیمه را وارد کنید"
                    value={formData.insurance_amount}
                    onChange={handleInputChange('insurance_amount')}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* مبلغ قسط */}
                <div>
                  <Label htmlFor="installment_amount">مبلغ قسط</Label>
                  <Input
                    type="number"
                    id="installment_amount"
                    name="installment_amount"
                    placeholder="مبلغ قسط را وارد کنید"
                    value={formData.installment_amount}
                    onChange={handleInputChange('installment_amount')}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div className='flex flex-col justify-center h-full'>
                  {/* دیگر کسورات */}
                  {formData.other_reduces_amount && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      دیگر کسورات: {Number(formData.other_reduces_amount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                    </p>
                  )}

                  {/* مبلغ پرداختی */}
                  {formData.paid_user_amount && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      مبلغ پرداختی: {Number(formData.paid_user_amount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? 'در حال ذخیره...'
                : isUpdateMode
                ? 'ویرایش'
                : 'ذخیره'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReservedLoanCreateEdit;
