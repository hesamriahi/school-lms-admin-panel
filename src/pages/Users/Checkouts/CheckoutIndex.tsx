import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import TableComp, {TableColumnType} from "../../../components/tables/TableComp.tsx";
import SearchableDropDownList from '../../../components/common/SearchableDropDownList.tsx';
import { ROUTES } from "../../../routes.ts";
import { PlusIcon } from "../../../icons/index.ts";
import {FilterItemType} from "../../../components/tables/TableFilterComp.tsx";
import { useState, useRef } from 'react';
import ApiRequest, { ApiResponse } from "../../../classes/ApiRequest.ts";
import PageMeta from '../../../components/common/PageMeta';

import { Modal } from '../../../components/ui/modal';
import Button from '../../../components/ui/button/Button';
import Label from '../../../components/form/Label';

import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";



    // todo: IMAGE COLUMN
export default function CheckoutIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const columns:TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notNumberFormat: true, textLimit: 10},
    {name: "user.full_name", label: "نام و نام خانوادگی", type: "text", textLimit: 25, notSortable: true },
    {name: "paid_user_amount", label: "پرداختی به حساب کاربر", type: "number"},
    {name: "paid_installment_amount", label: "اقساط تسویه شده", type: "number"},
    {name: "paid_assistance_installment_amount", label: "اقساط مساعده تسویه شده", type: "number"},
    {name: "created_at", label: "تاریخ ثبت", type: "datetime"},
  ];

  


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const tableReloader = useRef<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [checkoutShowcaseResponse, setCheckoutShowcaseResponse] = useState<any|null>(null);

  

  const filterItems:FilterItemType[] = [
    {
      name: "id",
      label: "شناسه",
      columnSize: 1,
      type: "number",
    },
    {
      name:"first_name",
      label: "نام",
      type: "text",
      columnSize: 1,
    },
    {
      name:"last_name",
      label: "نام خانوادگی",
      type: "text",
      columnSize: 1,
    }
  ];

  const handleUserChange = async (user: any) => {
    if (user) {
      setSelectedUser(user);
      ApiRequest.call('api/admin/checkouts/' + user.id + '/showcase', 'GET', null, null, false, true)
        .then((response: ApiResponse) => {
          setCheckoutShowcaseResponse(response.data);
        })

    } else {
      setSelectedUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      let response: ApiResponse;
      response = await ApiRequest.call(
        'api/admin/checkouts/' + selectedUser.id ,
        'POST',
        {user_id: selectedUser.id},
        null,
        true,
        true
      );

      if (response.success) {
        tableReloader.current?.();
        modalOnClose();
      }
    } catch (error) {
      console.log('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      modalOnClose();
    }
  };

  const modalOnOpen = () => {
    setIsCreateModalOpen(true);
  }

  const modalOnClose = () => {
    setIsCreateModalOpen(false);
    setSelectedUser(null);
    setCheckoutShowcaseResponse(null);
  }


  return (
    <>
      <PageMeta title="تسویه حساب" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => modalOnOpen()}>
        تسویه حساب جدید
      </Button>
      <PageBreadcrumb pageTitle="تسویه حساب ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/checkouts"
          columns={columns}
          dataPathInApiRequest="data.checkouts.data"
          // actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.checkouts"
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
            {'تسویه حساب جدید'}
          </h4>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="space-y-3">

              {/* انتخاب کاربر */}
              <div>
                <Label>کاربر</Label>
                <SearchableDropDownList
                  key={'open'}
                  apiUrl="api/admin/users-search"
                  searchParamName="q"
                  dataPath="data.users"
                  valueKey="id"
                  labelKey="full_name"
                  placeholder="جستجوی کاربر..."
                  onChange={handleUserChange}
                  defaultValue={selectedUser}
                  disabled={selectedUser ? true : false}
                  minSearchLength={2}
                />
              </div>

              <div className="mt-5">
                <Label className="text-bold font-bold mr-4">وام</Label>
                {checkoutShowcaseResponse?.normalLoansDebt > 0 && (
                  <>
                    {checkoutShowcaseResponse?.lastLoan && (
                      <>
                        <p className="text-sm font-light ">
                           شناسه وام: {checkoutShowcaseResponse?.lastLoan.id}
                        </p>
                        <p className="text-sm font-light ">
                           مبلغ وام: {Number(checkoutShowcaseResponse.lastLoan.amount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال 
                        </p>
                        <p className="text-sm font-light ">
                           مبلغ پرداخت شده: {Number(checkoutShowcaseResponse.lastLoan.total_paid_installments_amount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                        </p>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          مانده: {Number(checkoutShowcaseResponse.normalLoansDebt).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                        </p>
                      </>
                    )}
                  </>
                )}
                {checkoutShowcaseResponse?.normalLoansDebt === 0 && (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    وام پرداخت نشده ندارد
                  </p>
                )}
              </div>

              <hr/>

              <div>
                <Label className="text-bold font-bold mr-4">مساعده</Label>
                {checkoutShowcaseResponse?.assistanceLoansDebt > 0 && (
                  <>
                    {checkoutShowcaseResponse?.assistanceLoan && (
                      <>
                        <p className="text-sm font-light ">
                           شناسه وام: {checkoutShowcaseResponse?.assistanceLoan.id}
                        </p>
                        <p className="text-sm font-light ">
                           مبلغ وام: {Number(checkoutShowcaseResponse.assistanceLoan.amount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال 
                        </p>
                        <p className="text-sm font-light ">
                           مبلغ پرداخت شده: {Number(checkoutShowcaseResponse.assistanceLoan.total_paid_installments_amount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                        </p>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          مانده: {Number(checkoutShowcaseResponse.assistanceLoansDebt).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                        </p>
                      </>
                    )}
                  </>
                )}
                

                {checkoutShowcaseResponse?.assistanceLoansDebt === 0 && (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    وام مساعده پرداخت نشده ندارد
                  </p>
                )}
              </div>

              <hr/>

              {selectedUser?.balance && (
                <p className="text-sm font-medium">
                  سرمایه: {Number(selectedUser.balance).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                </p>
              )}
              {selectedUser && checkoutShowcaseResponse && (
                <>
                  <p className={`
                    text-sm 
                    font-medium
                    ${selectedUser.balance - checkoutShowcaseResponse.normalLoansDebt - checkoutShowcaseResponse.assistanceLoansDebt > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                  `}>
                    پرداختی به کاربر: {Number(selectedUser.balance - checkoutShowcaseResponse.normalLoansDebt - checkoutShowcaseResponse.assistanceLoansDebt).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
                  </p>
                  {(selectedUser.balance - checkoutShowcaseResponse.normalLoansDebt - checkoutShowcaseResponse.assistanceLoansDebt < 0) && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      امکان تسویه حساب وجود ندارد. مقدار بدهی بیشتر از سرمایه است.
                    </p>
                  )}
                </>
              )}




            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={()=> modalOnClose()}
              disabled={isSubmitting}
              type="button"
            >
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || (selectedUser && checkoutShowcaseResponse && (selectedUser.balance - checkoutShowcaseResponse.normalLoansDebt - checkoutShowcaseResponse.assistanceLoansDebt < 0))}
              type="submit"
            >
             {isSubmitting ? 'در حال ثبت...' : 'ذخیره'}
            </Button>
          </div>
        </form>
      </div>
        </Modal>
    </>
  );
}