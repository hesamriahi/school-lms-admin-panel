import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../../components/tables/TableComp.tsx";
import { FilterItemType } from "../../../components/tables/TableFilterComp.tsx";
import PageMeta from '../../../components/common/PageMeta';
import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../routes.ts";
import { useState, useRef, useEffect } from 'react';
import { PlusIcon, TableActionButtonDeleteIcon, TableActionButtonEditIcon } from "../../../icons/index.ts";
import ApiRequest, { ApiResponse } from "../../../classes/ApiRequest.ts";
import Button from "../../../components/ui/button/Button.tsx";
import Input from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label.tsx';
import { Modal } from '../../../components/ui/modal';
import Select from '../../../components/form/Select.tsx';
import Loans from '../../../classes/Loan';
import Authentication from "../../../classes/Authentication.ts";
import TextArea from "../../../components/form/input/TextArea.tsx";

interface RequestedLoanStoreFormData {
  amount: number | null;
  description: string;
  type: string;
}


export default function UserRequestedLoansIndex() {
  if (Permission.check(['user']) === false) return <Navigate to={ROUTES.home} replace />;
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);


  const tableReloader = useRef<(() => void) | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const [formData, setFormData] = useState<RequestedLoanStoreFormData>({
    amount: null,
    description: '',
    type: 'normal'
  });


  const handleInputChange = (field: keyof RequestedLoanStoreFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  useEffect(() => {
    const loanServiceResponse = Loans.calculatorForUser(Authentication.getAdmin(), formData.type);
    setFormData((prev) => ({
      ...prev,
      amount: loanServiceResponse.amount,
    }));
  }, [formData.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ساخت requestData بدون other_reduces_amount
      const requestData = {
        amount: formData.amount,
        description: formData.description,
        type: formData.type
      };

      let response: ApiResponse;
      response = await ApiRequest.call(
        isUpdateMode ? 'api/user/requested-loans/' + selectedItemId : 'api/user/requested-loans',
        isUpdateMode ? 'PUT' : 'POST',
        requestData,
        null,
        true,
        true
      );

      if (response.success) {
        tableReloader.current?.();
      }
    } catch (error) {
      console.log('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
    }
  };

  const modalOnOpen = (item?: any) => {
    if (item) {
      setFormData({
        amount: item.amount,
        description: item.description,
        type: item.type
      });
      setIsUpdateMode(true);
      setSelectedItemId(item.id);
    } else {
      const loanServiceResponse = Loans.calculatorForUser(Authentication.getAdmin(), formData.type);
      setFormData({
        amount: loanServiceResponse.amount,
        description: '',
        type: 'normal'
      });
      setIsUpdateMode(false);
    }
    setIsCreateModalOpen(true);
  }

  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number" },
    {
      name: "type",
      label: "نوع",
      type: "enum",
      enumValues: [
        { key: "normal", color: "noColor", label: "قرض الحسنه" },
        { key: "assistance", color: "noColor", label: "مساعده" },
      ],
    },
    { name: "amount", label: "مبلغ وام", type: "number" },
    { name: "total_remainds_amount", label: "مانده وام", type: "number" },
    { name: "other_reduces_amount", label: "بدهی قبلی", type: "number" },
    { name: "total_paid_installments_amount", label: "اقساط پرداخت شده", type: "number" },
    { name: "installment_amount", label: "مبلغ قسط", type: "number" },
    {
      name: "status",
      label: "وضعیت",
      type: "enum",
      enumValues: [
        { key: "requested", color: "info", label: "درخواست شده" },
        // we don't show that he is in queue of loan or not. 
        // we show requested and reserved both like together
        { key: "reserved", color: "info", label: "درخواست شده" },
        { key: "pending", color: "warning", label: "در انتظار" },
        { key: "paid", color: "success", label: "پرداخت شده" },
        { key: "cancelled", color: "error", label: "لغو شده" },
        { key: "completed", color: "success", label: "تکمیل شده" },
      ],
    },
    //{ name: "description", label: "توضیحات", type: "text", textLimit: 20 },
    { name: "created_at", label: "تاریخ ایجاد", type: "datetime" },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "start_amount",
      label: "مبلغ وام از",
      type: "number",
      columnSize: 1,
    },
    {
      name: "end_amount",
      label: "مبلغ وام تا",
      type: "number",
      columnSize: 1,
    },
    {
      name: "status",
      label: "وضعیت",
      type: "selectBox",
      columnSize: 1,
      options: [
        { value: "requested", label: "درخواست شده" },
        { value: "reserved", label: "رزرو شده" },
        { value: "pending", label: "در انتظار" },
        { value: "paid", label: "پرداخت شده" },
        { value: "cancelled", label: "لغو شده" },
        { value: "completed", label: "تکمیل شده" },
      ],
    },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      //url: ROUTES.home,
      onClick: (item) => modalOnOpen(item),
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
    },
    {
      name: "delete",
      label: "حذف",
      icon: <TableActionButtonDeleteIcon />,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
      onClick: (item) => {
        ApiRequest.call('api/user/requested-loans/' + item.id, 'DELETE',null,null,true,true).then((response) => {
          if (response.success) {
            tableReloader.current?.();
          }
        });
      }
    }
  ];

  return (
    <>
      <PageMeta title="درخواست های من" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => {
        setIsCreateModalOpen(true),
        modalOnOpen()
      }}>
        درخواست جدید
      </Button>
      <PageBreadcrumb pageTitle="درخواست ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/user/requested-loans"
          columns={columns}
          dataPathInApiRequest="data.loans.data"
          filterItems={filterItems}
          actionButtons={actionButtons}
          wantPagination={true}
          paginationPathInApiRequest="data.loans"
          pageTitle="درخواست های من"
          tableReloader={(fn) => (tableReloader.current = fn)}
        />
      </div>
      <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setFormData({
              amount: null,
              description: '',
              type: ''
            });
            setSelectedItemId(null);
          }}
          className="m-4 max-w-[500px]"
          showCloseButton={false}
        >
          <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {'درخواست جدید'}
          </h4>
          <p className="mb-2 text-sm text-gray-500 lg:mb-2 dark:text-gray-400">
            {'اطلاعات وام را وارد کنید.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="space-y-3">
              {/* انتخاب نوع وام قرض الحسنه یا مساعده */}
              <div>
                <Label htmlFor="type">نوع وام</Label>
                {formData.type && 
                  <Select
                    options={[{ value: 'assistance', label: 'مساعده' }, { value: 'normal', label: 'قرض الحسنه' }]}
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
              {/* مبلغ وام */}
              <div>
                <Label htmlFor="title">مبلغ</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="مبلغ را وارد کنید"
                  value={formData.amount?.toString() ?? ''}
                  onChange={handleInputChange('amount')}
                  min="0"
                  numberFormat={true}
                />
              {formData.type && formData.type === 'normal' && 
                <p className='text-xs mr-4 mt-1 text-gray-400'>سرمایه شما: <strong>{Number(Authentication.getAdmin().balance).toLocaleString('fa-IR', { maximumFractionDigits: 2 })}</strong> ریال</p>
              }
              </div>
              <div>
              <Label htmlFor="description">توضیحات</Label>
              <TextArea
                value={formData.description}
                onChange={(value:string) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: value
                  }));
                }}
                placeholder="توضیحات را وارد کنید"
                rows={4}
              />
            </div>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={()=> setIsCreateModalOpen(false)}
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
                :  'ذخیره'}
            </Button>
          </div>
        </form>
      </div>
        </Modal>
    </>
  );
}
