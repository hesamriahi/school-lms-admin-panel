import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../components/tables/TableComp.tsx";
import { FilterItemType } from "../../components/tables/TableFilterComp.tsx";
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";
import { TableActionButtonEditIcon, DollarLineIcon } from "../../icons/index.ts";
import { useRef, useState } from "react";
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select.tsx";

interface LoanEditFormData {
  amount: string;
  status: string;
  paid_user_amount: string;
  commission_amount: string;
  insurance_amount: string;
  other_reduces_amount: string;
  total_remainds_amount: string;
  total_paid_installments_amount: string;
  installments_count: string;
  installment_amount: string;
}

const LOAN_STATUS_OPTIONS = [
  { value: "requested", label: "درخواست شده" },
  { value: "reserved", label: "رزرو شده" },
  { value: "pending", label: "در انتظار" },
  { value: "paid", label: "پرداخت شده" },
  { value: "cancelled", label: "لغو شده" },
  { value: "completed", label: "تکمیل شده" },
];

const emptyEditFormData = (): LoanEditFormData => ({
  amount: "",
  status: "",
  paid_user_amount: "",
  commission_amount: "",
  insurance_amount: "",
  other_reduces_amount: "",
  total_remainds_amount: "",
  total_paid_installments_amount: "",
  installments_count: "",
  installment_amount: "",
});

const mapLoanToEditFormData = (item: any): LoanEditFormData => ({
  amount: item.amount?.toString() ?? "",
  status: item.status ?? "",
  paid_user_amount: item.paid_user_amount?.toString() ?? "",
  commission_amount: item.commission_amount?.toString() ?? "",
  insurance_amount: item.insurance_amount?.toString() ?? "",
  other_reduces_amount: item.other_reduces_amount?.toString() ?? "",
  total_remainds_amount: item.total_remainds_amount?.toString() ?? "",
  total_paid_installments_amount: item.total_paid_installments_amount?.toString() ?? "",
  installments_count: item.installments_count?.toString() ?? "",
  installment_amount: item.installment_amount?.toString() ?? "",
});


export default function LoansIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;

  const tableReloader = useRef<(() => void) | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayInstallmentModalOpen, setIsPayInstallmentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LoanEditFormData>(emptyEditFormData());

  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    {
      name: "type",
      label: "نوع",
      type: "enum",
      enumValues: [
        { key: "normal", color: "noColor", label: "قرض الحسنه" },
        { key: "assistance", color: "noColor", label: "مساعده" },
      ],
    },
    { name: "user.full_name", label: "نام و نام خانوادگی", type: "text", textLimit: 25, notSortable: true },
    { name: "year", label: "سال", type: "number", notNumberFormat: true },
    { name: "month", label: "ماه", type: "number", notNumberFormat: true },
    { name: "user.national_code", label: "کد ملی", type: "number", notNumberFormat: true, notSortable: true },
    { name: "amount", label: "مبلغ وام", type: "number" },
    { name: "total_remainds_amount", label: "مانده وام", type: "number" },
    { name: "paid_user_amount", label: "پرداختی کاربر", type: "number" },
    { name: "commission_amount", label: "کمیسیون", type: "number" },
    { name: "insurance_amount", label: "بیمه", type: "number" },
    { name: "other_reduces_amount", label: "بدهی قبلی", type: "number" },
    { name: "total_paid_installments_amount", label: "اقساط پرداخت شده", type: "number" },
    { name: "installment_amount", label: "مبلغ قسط", type: "number" },
    {
      name: "status",
      label: "وضعیت",
      type: "enum",
      enumValues: [
        { key: "reserved", color: "info", label: "رزرو شده" },
        { key: "pending", color: "warning", label: "در انتظار" },
        { key: "paid", color: "success", label: "پرداخت شده" },
        { key: "cancelled", color: "error", label: "لغو شده" },
        { key: "completed", color: "success", label: "تکمیل شده" },
      ],
    },
    { name: "created_at", label: "تاریخ ایجاد", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      onClick: (item) => openEditModal(item),
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
    {
      name: "pay-installment",
      label: "پرداخت قسط",
      icon: <DollarLineIcon />,
      onClick: (item) => openPayInstallmentModal(item),
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "id",
      label: "شناسه وام",
      type: "number",
      columnSize: 1,
    },
    {
      name: "first_name",
      label: "نام",
      type: "text",
      columnSize: 1,
    },
    {
      name: "last_name",
      label: "نام خانوادگی",
      type: "text",
      columnSize: 1,
    },
    {
      name: "mobile",
      label: "شماره همراه",
      type: "text",
      columnSize: 1,
    },
    {
      name: "employment_code",
      label: "کدپرسنلی",
      type: "text",
      columnSize: 1,
    },
    {
      name: "national_code",
      label: "کد ملی",
      type: "text",
      columnSize: 1,
    },
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
        { value: "reserved", label: "رزرو شده" },
        { value: "pending", label: "در انتظار" },
        { value: "paid", label: "پرداخت شده" },
        { value: "cancelled", label: "لغو شده" },
        { value: "completed", label: "تکمیل شده" },
      ],
    },
    {
      name: "type",
      label: "نوع وام",
      type: "selectBox",
      columnSize: 1,
      options: [
        { value: "normal", label: "قرض الحسنه" },
        { value: "assistance", label: "مساعده" },
      ],
    },
  ];

  const handleInputChange = (field: keyof LoanEditFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const openEditModal = (item: any) => {
    setFormData(mapLoanToEditFormData(item));
    setSelectedLoanId(item.id);
    setIsEditModalOpen(true);
  };

  const openPayInstallmentModal = (item: any) => {
    setFormData({
      ...emptyEditFormData(),
      installment_amount: item.installment_amount?.toString() ?? "",
    });
    setSelectedLoanId(item.id);
    setIsPayInstallmentModalOpen(true);
  };

  const modalOnClose = () => {
    setIsEditModalOpen(false);
    setIsPayInstallmentModalOpen(false);
    setSelectedLoanId(null);
    setFormData(emptyEditFormData());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;

    setIsSubmitting(true);

    try {
      const response: ApiResponse = await ApiRequest.call(
        `api/admin/loans/${selectedLoanId}`,
        "PUT",
        {
          installment_amount: formData.installment_amount,
        },
        null,
        true,
        true
      );

      if (response.success) {
        tableReloader.current?.();
        modalOnClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;

    setIsSubmitting(true);

    try {
      const response: ApiResponse = await ApiRequest.call(
        `api/admin/loans/${selectedLoanId}/pay-installment`,
        "POST",
        {
          installment_amount: formData.installment_amount,
        },
        null,
        true,
        true
      );

      if (response.success) {
        tableReloader.current?.();
        modalOnClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="لیست وام ها" />
      <PageBreadcrumb pageTitle="وام‌ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/loans"
          columns={columns}
          dataPathInApiRequest="data.loans.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.loans"
          pageTitle="لیست وام‌ها"
          tableReloader={(fn) => (tableReloader.current = fn)}
          needExcelExport={true}
        />
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={modalOnClose}
        className="m-4 max-w-[700px]"
        showCloseButton={false}
      >
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
          <div className="px-2 mb-5">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              ویرایش وام
            </h4>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[70vh] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="amount">مبلغ کل وام</Label>
                  <Input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="مبلغ کل وام را وارد کنید"
                    value={formData.amount}
                    onChange={handleInputChange("amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="status">وضعیت</Label>
                  <Select
                    key={`loan-status-${selectedLoanId}`}
                    options={LOAN_STATUS_OPTIONS}
                    placeholder="وضعیت را انتخاب کنید"
                    defaultValue={formData.status}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        status: value,
                      }));
                    }}
                    className="dark:bg-dark-900"
                  />
                </div>

                <div>
                  <Label htmlFor="paid_user_amount">مبلغ پرداخت شده</Label>
                  <Input
                    type="number"
                    id="paid_user_amount"
                    name="paid_user_amount"
                    placeholder="مبلغ پرداخت شده را وارد کنید"
                    value={formData.paid_user_amount}
                    onChange={handleInputChange("paid_user_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="commission_amount">کمیسیون</Label>
                  <Input
                    type="number"
                    id="commission_amount"
                    name="commission_amount"
                    placeholder="مبلغ کمیسیون را وارد کنید"
                    value={formData.commission_amount}
                    onChange={handleInputChange("commission_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="insurance_amount">مبلغ بیمه</Label>
                  <Input
                    type="number"
                    id="insurance_amount"
                    name="insurance_amount"
                    placeholder="مبلغ بیمه را وارد کنید"
                    value={formData.insurance_amount}
                    onChange={handleInputChange("insurance_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="other_reduces_amount">مانده وام‌های قبلی</Label>
                  <Input
                    type="number"
                    id="other_reduces_amount"
                    name="other_reduces_amount"
                    placeholder="مانده وام‌های قبلی را وارد کنید"
                    value={formData.other_reduces_amount}
                    onChange={handleInputChange("other_reduces_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="total_remainds_amount">مانده کل</Label>
                  <Input
                    type="number"
                    id="total_remainds_amount"
                    name="total_remainds_amount"
                    placeholder="مانده کل را وارد کنید"
                    value={formData.total_remainds_amount}
                    onChange={handleInputChange("total_remainds_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="total_paid_installments_amount">مجموع اقساط پرداخت شده</Label>
                  <Input
                    type="number"
                    id="total_paid_installments_amount"
                    name="total_paid_installments_amount"
                    placeholder="مجموع اقساط پرداخت شده را وارد کنید"
                    value={formData.total_paid_installments_amount}
                    onChange={handleInputChange("total_paid_installments_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>

                <div>
                  <Label htmlFor="installments_count">تعداد اقساط</Label>
                  <Input
                    type="number"
                    id="installments_count"
                    name="installments_count"
                    placeholder="تعداد اقساط را وارد کنید"
                    value={formData.installments_count}
                    onChange={handleInputChange("installments_count")}
                    min="0"
                    step={1}
                  />
                </div>

                <div>
                  <Label htmlFor="installment_amount">مبلغ قسط</Label>
                  <Input
                    type="number"
                    id="installment_amount"
                    name="installment_amount"
                    placeholder="مبلغ قسط را وارد کنید"
                    value={formData.installment_amount}
                    onChange={handleInputChange("installment_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={modalOnClose}
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
                {isSubmitting ? "در حال ذخیره..." : "ویرایش"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isPayInstallmentModalOpen}
        onClose={modalOnClose}
        className="m-4 max-w-[500px]"
        showCloseButton={false}
      >
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
          <div className="px-2 mb-5">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              پرداخت یک قسط
            </h4>
          </div>

          <form onSubmit={handlePayInstallment} className="flex flex-col">
            <div className="custom-scrollbar overflow-y-auto px-2">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pay_installment_amount">مبلغ قسط</Label>
                  <Input
                    type="number"
                    id="pay_installment_amount"
                    name="pay_installment_amount"
                    placeholder="مبلغ قسط را وارد کنید"
                    value={formData.installment_amount}
                    onChange={handleInputChange("installment_amount")}
                    min="0"
                    step={1000}
                    numberFormat={true}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={modalOnClose}
                disabled={isSubmitting}
                type="button"
              >
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={handlePayInstallment}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "در حال پردازش..." : "پرداخت قسط"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
