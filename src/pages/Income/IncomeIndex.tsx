import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableComp, { TableColumnType, ActionButtonType } from "../../components/tables/TableComp";
import { PlusIcon, TableActionButtonDeleteIcon } from "../../icons/index.ts";
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import { Modal } from '../../components/ui/modal';
import { useState, useRef } from 'react';
import Button from "../../components/ui/button/Button.tsx";
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label.tsx';
import Switch from '../../components/form/switch/Switch';
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

interface IncomeStoreFormData {
  title: string;
  is_active: boolean;
}

export default function IncomeIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const tableReloader = useRef<(() => void) | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IncomeStoreFormData>({
    title: '',
    is_active: true,
  });

  const handleInputChange = (field: keyof IncomeStoreFormData) => (
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
        ApiRequest.call('api/admin/incomes/' + item.id, 'DELETE',null,null,true,true).then((response) => {
          if (response.success) {
            tableReloader.current?.();
          }
        });
      }
    }
  ];

  const columns: TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number" },
    {name: "title", label: "عنوان", type: "text", textLimit: 30, notSortable: true},
    {
      name: "is_active",
      label: "وضعیت",
      type: "enum",
      enumValues: [
        { key: 1, color: "success", label: "فعال" },
        { key: 0, color: "error", label: "غیر فعال" },
      ],
    },
  ];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ساخت requestData بدون other_reduces_amount
      const requestData = {
        title: formData.title,
        is_active: formData.is_active,
      };

      let response: ApiResponse;
      response = await ApiRequest.call(
        'api/admin/incomes',
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
      console.log('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
    }
  };


  return (
    <>
      <PageMeta title="تعریف درآمد ها" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => setIsCreateModalOpen(true)}>
        درآمد جدید
      </Button>
      <PageBreadcrumb pageTitle="تعریف درآمد ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/incomes"
          dataPathInApiRequest="data.incomes.data"
          columns={columns}
          actionButtons={actionButtons}
          wantPagination={true}
          pageTitle="درآمد ها"
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
            {'ایجاد درآمد جدید'}
          </h4>
          <p className="mb-2 text-sm text-gray-500 lg:mb-2 dark:text-gray-400">
            {'اطلاعات درآمد جدید را وارد کنید.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="space-y-3">
              {/* مبلغ وام */}
              <div>
                <Label htmlFor="title">عنوان درآمد</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="عنوان درآمد را وارد کنید"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  min="0"
                />
              </div>

              <div>
                <Switch
                  key={`is_active`}
                  label="فعال/غیرفعال"
                  defaultChecked={true}
                  onChange={(checked) => setFormData((prev) => ({
                    ...prev,
                    is_active: checked,
                  }))}
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
