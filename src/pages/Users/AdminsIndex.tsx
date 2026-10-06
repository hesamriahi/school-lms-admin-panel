import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, {ActionButtonType, TableColumnType} from "../../components/tables/TableComp.tsx";
import { TableActionButtonEditIcon } from "../../icons/index.ts";
import { ROUTES } from "../../routes.ts";
import { PlusIcon } from "../../icons/index.ts";
import {FilterItemType} from "../../components/tables/TableFilterComp.tsx";
import { useState, useRef } from 'react';
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import PageMeta from '../../components/common/PageMeta';

import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';

import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";

interface AdminStoreFormData {
  name: string;
  username: string;
  mobile: string;
  password: string;
}

    // todo: IMAGE COLUMN
export default function AdminsIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const columns:TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notNumberFormat: true},
    {name: "name", label: "نام و نام خانوادگی", type: "text", textLimit: 30},
    {name: "username", label: "نام کاربری", type: "text", textLimit: 30},
    {name: "mobile", label: "شماره همراه", type: "mobile", textLimit: 30, notSortable: true},
    {name: "created_at", label: "تاریخ ثبت", type: "datetime"},
  ];


  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const tableReloader = useRef<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AdminStoreFormData>({
    name: '',
    username: '',
    mobile: '',
    password: '',
  });

  const actionButtons:ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      //url: ROUTES.home,
      onClick: (item) => modalOnOpen(item),
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
    }
  ];


  const filterItems:FilterItemType[] = [
    {
      name: "id",
      label: "شناسه",
      columnSize: 1,
      type: "number",
    },
    {
      name:"name",
      label: "نام",
      type: "text",
      columnSize: 1,
    },
    {
      name:"username",
      label: "نام کاربری",
      type: "text",
      columnSize: 1,
    },
  ];


  const handleInputChange = (field: keyof AdminStoreFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ساخت requestData بدون other_reduces_amount
      const requestData = {
        name: formData.name,
        username: formData.username,
        mobile: formData.mobile,
        ...(formData.password && { password: formData.password })
      };

      let response: ApiResponse;
      response = await ApiRequest.call(
        isUpdateMode ? 'api/admin/admins/' + selectedAdminId : 'api/admin/admins',
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
        name: item.name,
        username: item.username,
        mobile: item.mobile,
        password: '',
      });
      setIsUpdateMode(true);
      setSelectedAdminId(item.id);
    } else {
      setFormData({
        name: '',
        username: '',
        mobile: '',
        password: '',
      });
      setIsUpdateMode(false);
    }
    setIsCreateModalOpen(true);
  }

  const modalOnClose = () => {
    setIsCreateModalOpen(false);
    setIsUpdateMode(false);
    setFormData({
      name: '',
      username: '',
      mobile: '',
      password: '',
    });
    setSelectedAdminId(null);
  }


  return (
    <>
      <PageMeta title="مدیران" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => modalOnOpen()}>
        مدیر جدید
      </Button>
      <PageBreadcrumb pageTitle="مدیران" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/admins"
          columns={columns}
          dataPathInApiRequest="data.admins.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.admins"
          tableReloader={(fn) => (tableReloader.current = fn)}
        />
      </div>

      <Modal
          isOpen={isCreateModalOpen}
          onClose={modalOnClose}
          className="m-4 max-w-[500px]"
          showCloseButton={false}
        >
          <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
        <div className="px-2 mb-5">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {isUpdateMode ? 'ویرایش کاربر' : 'کاربر جدید'}
          </h4>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="space-y-3">
              
              <div>
                <Label htmlFor="name">نام و نام خانوادگی</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="عنوان درآمد را وارد کنید"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="name">نام کاربری</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="نام کاربری را وارد کنید"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="رمز عبور را وارد کنید"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="mobile">شماره همراه</Label>
                <Input
                  type="text"
                  id="mobile"
                  name="mobile"
                  placeholder="شماره همراه را وارد کنید"
                  value={formData.mobile}
                  onChange={handleInputChange('mobile')}
                  min="0"
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
                : isUpdateMode
                ? 'ویرایش'
                : 'ذخیره'}
            </Button>
          </div>
        </form>
      </div>
        </Modal>
    </>
  );
}