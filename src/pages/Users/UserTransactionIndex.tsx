import { useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, {ActionButtonType, TableColumnType} from "../../components/tables/TableComp.tsx";
import {FilterItemType} from "../../components/tables/TableFilterComp.tsx";
import { Navigate, useParams } from "react-router-dom";
import Button from "../../components/ui/button/Button.tsx";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Input from "../../components/form/input/InputField.tsx";
import Label from "../../components/form/Label.tsx";
import Switch from "../../components/form/switch/Switch.tsx";
import TextArea from "../../components/form/input/TextArea.tsx";
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import ToastrNotification from "../../classes/ToastrNotification.ts";
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { ROUTES } from "../../routes.ts";

    // todo: IMAGE COLUMN
export default function UserTransactionIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const { isOpen, openModal, closeModal } = useModal();
  const [amount, setAmount] = useState<string>("");
  const [isIncrement, setIsIncrement] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const tableReloader = useRef<(() => void) | null>(null);

  const columns:TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notNumberFormat: true},
    {name: "amount", label: "مقدار", type: "number"},
    {name: "is_increament", label: "نوع", type: "enum",
      enumValues: [
        {key: true, color:'success', label:'افزایش'},
        {key: false, color:'error', label:'کاهش'},
      ]
    },
    {name: "description", label: "توضیحات", type: "text", textLimit: 60},
    {name: "created_at", label: "تاریخ ثبت", type: "datetime"},
  ];


  const actionButtons:ActionButtonType[] = [
    
    // {
    //   name: "delete",
    //   label: "حذف",
    //   icon: <TableActionButtonDeleteIcon />,
    //   url: ROUTES.userIndex,
    //   className: "hover:text-error-500 dark:hover:text-error-500 dark:text-gray-400"
    // }
  ];


  const filterItems:FilterItemType[] = [
    {
      name: "id",
      label: "شناسه",
      columnSize: 1,
      type: "number",
    },
    {
      name:"amount",
      label: "مقدار",
      type: "number",
      columnSize: 2,
    },
    {
      name:"is_increament",
      label: "نوع",
      type: "selectBox",
      options: [
        {value: true, label:'افزایش'},
        {value: false, label:'کاهش'},
      ],
      columnSize: 1,
    },
    {
      name:"description",
      label: "توضیحات",
      type: "text",
      columnSize: 2,
    }
  ];

  const handleSubmit = async () => {
    if (!amount || !description.trim()) {
      ToastrNotification.error("لطفا تمام فیلدها را پر کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const response: ApiResponse = await ApiRequest.call(
        `api/admin/users/${id}/change-balance`,
        'POST',
        {
          amount: parseFloat(amount),
          is_increament: isIncrement,
          description: description.trim(),
        },
        null,
        true
      );

      if (response.success) {
        closeModal();
        setAmount("");
        setIsIncrement(true);
        setDescription("");
        // Reload the table data by refreshing the page or triggering a reload
        tableReloader.current?.();
      } else {
        ToastrNotification.error(response.message || 'خطا در تغییر موجودی');
      }
    } catch (error) {
      ToastrNotification.error('خطا در ارسال درخواست');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    closeModal();
    setAmount("");
    setIsIncrement(true);
    setDescription("");
  };

  return (
    <>
      <PageMeta title="تراکنش های کاربر" />
      <Button className="mb-3" variant="success" size="sm" onClick={openModal}>
        تغییر موجودی
      </Button>
      <PageBreadcrumb pageTitle="لیست تراکنش های کاربر" />
      <div className="space-y-3">      
        <TableComp
          apiRequestUrl={"api/admin/users/" + id + "/transactions"}
          columns={columns}
          dataPathInApiRequest="data.transactions.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.transactions"
          tableReloader={(fn) => (tableReloader.current = fn)}
        />
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[500px] p-6">
        <div className="flex flex-col">
          <div className="mb-6">
            <h5 className="text-theme-xl mb-2 font-semibold text-gray-800 lg:text-2xl dark:text-white/90">
              تغییر موجودی
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تغییر موجودی کاربر را وارد کنید
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">مقدار</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                numberFormat={true}
                placeholder="مقدار را وارد کنید"
              />
            </div>

            <div>
              <Label>نوع</Label>
              <div className="mt-2">
                <Switch
                  key={isIncrement ? 1 : 0}
                  label={isIncrement ? "افزایش" : "کاهش"}
                  defaultChecked={isIncrement}
                  onChange={(checked) => setIsIncrement(checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">توضیحات</Label>
              <TextArea
                value={description}
                onChange={(value) => setDescription(value)}
                placeholder="توضیحات را وارد کنید"
                rows={4}
              />
            </div>
          </div>

          <div className="modal-footer mt-6 flex items-center gap-3 sm:justify-end">
            <button
              onClick={handleCloseModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              بستن
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              disabled={isSubmitting}
              className="btn btn-success bg-brand-500 hover:bg-brand-600 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "در حال ارسال..." : "ثبت"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}