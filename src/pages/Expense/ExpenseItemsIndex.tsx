import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableComp, { TableColumnType, ActionButtonType } from "../../components/tables/TableComp";
import { PlusIcon, TableActionButtonDeleteIcon } from "../../icons/index.ts";
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import { Modal } from '../../components/ui/modal';
import { useState, useEffect, useRef } from 'react';
import Button from "../../components/ui/button/Button.tsx";
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label.tsx';
import ToastrNotification from "../../classes/ToastrNotification.ts";
import Select from '../../components/form/Select.tsx';
import TextArea from "../../components/form/input/TextArea.tsx";
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

interface ExpenseItemStoreFormData {
  expense_id: number | null;
  vault_id: number | null;
  amount: string;
  description: string;
}


export default function ExpenseItemsIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  
  const tableReloader = useRef<(() => void) | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExpenseItemStoreFormData>({
    expense_id: null,
    vault_id: null,
    amount: '',
    description: '',
  });

  useEffect(() => {
    ApiRequest.call('api/admin/expense-items/create', 'get',null,null,false,true).then((response) => {
      setExpenses(response.data.expenses);
      setVaults(response.data.vaults);
    })
  }, []);



  const handleInputChange = (field: keyof ExpenseItemStoreFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const actionButtons: ActionButtonType[] = [
    {
      name: "delete",
      label: "حذف",
      icon: <TableActionButtonDeleteIcon />,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
      onClick: (item) => {
        ApiRequest.call('api/admin/expense-items/' + item.id, 'DELETE',null,null,true,true).then((response) => {
          if (response.success) {
            tableReloader.current?.();
          }
        });
      }
    }
  ];

  const columns: TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    {name: "expense.title", label: "عنوان", type: "text", textLimit: 30, notSortable: true},
    {name: "amount", label: "مبلغ", type: "number" },
    {name: "description", label: "توضیحات", type: "text", textLimit: 60, notSortable: true},
  ];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ساخت requestData بدون other_reduces_amount
      const requestData = {
        expense_id: formData.expense_id,
        vault_id: formData.vault_id,
        amount: formData.amount,
        description: formData.description,
      };

      let response: ApiResponse;
      response = await ApiRequest.call(
        'api/admin/expense-items',
        'POST',
        requestData,
        null,
        true,
        true
      );

      if (response.success) {
        tableReloader.current?.();
      }
    } catch (error) {
      ToastrNotification.error('خطا در هنگام ثبت');
    } finally {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
    }
  };


  return (
    <>
      <PageMeta title="لیست هزینه ها" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => setIsCreateModalOpen(true)}>
        ثبت هزینه
      </Button>
      <PageBreadcrumb pageTitle="هزینه ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/expense-items"
          dataPathInApiRequest="data.items.data"
          columns={columns}
          actionButtons={actionButtons}
          wantPagination={true}
          paginationPathInApiRequest="data.items"
          pageTitle="هزینه ها"
          tableReloader={(fn) => (tableReloader.current = fn)}
        />
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
          className="m-4 max-w-[500px]"
          showCloseButton={false}
        >
          <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {'ایجاد هزینه جدید'}
          </h4>
          <p className="mb-2 text-sm text-gray-500 lg:mb-2 dark:text-gray-400">
            {'اطلاعات هزینه جدید را وارد کنید.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="space-y-3">
              {/* مبلغ وام */}
              <div>
                <Label htmlFor="amount">مبلغ</Label>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="مبلغ هزینه ورودی را وارد کنید"
                  value={formData.amount}
                  onChange={handleInputChange('amount')}
                  min="0"
                  step={1000}
                  numberFormat={true}
                />
              </div>
              <div>
                <Label htmlFor="title">عنوان هزینه</Label>
                <Select
                  options={expenses?.map((expense:any) => ({
                    value: expense.id.toString() || '',
                    label: expense.title
                  })) || []}
                  placeholder="یک هزینه را انتخاب کنید"
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      expense_id: parseInt(value)
                    }));
                  }}
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label htmlFor="title">خزانه</Label>
                <Select
                  options={vaults?.map((vault:any) => ({
                    value: vault.id.toString() || '',
                    label: vault.name
                  })) || []}
                  placeholder="یک خزانه را انتخاب کنید"
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      vault_id: parseInt(value)
                    }));
                  }}
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
              <Label htmlFor="description">توضیحات</Label>
              <TextArea
                value={formData.description}
                onChange={(value) => {
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
      </div>

    
    </>
  );
}
