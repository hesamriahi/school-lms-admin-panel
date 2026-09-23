import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../../components/tables/TableComp.tsx";
import { EyeIcon } from "../../../icons/index.ts";
import { ROUTES } from "../../../routes.ts";
import { FilterItemType } from "../../../components/tables/TableFilterComp.tsx";
import { useNavigate } from "react-router";
import PageMeta from '../../../components/common/PageMeta';
import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";

export default function PaymentLoansIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const navigate = useNavigate();

  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "year", label: "سال", type: "number", notNumberFormat: true },
    { name: "month", label: "ماه", type: "number", notNumberFormat: true },
    { name: "total_amount", label: "مبلغ کل", type: "number" },
    { name: "total_paid_user_amount", label: "پرداختی کاربر", type: "number" },
    { name: "total_commission_amount", label: "مجموع کمیسیون ها", type: "number" },
    { name: "total_insurance_amount", label: "مجموع بیمه ها", type: "number" },
    { name: "total_other_reduces_amount", label: "بدهی قبلی", type: "number" },
    //{ name: "total_installments_amount", label: "مبلغ اقساط", type: "number" },
    { name: "used_commission_vault_balance", label: "خزانه کمیسیون", type: "number" },
    { name: "used_income_vault_balance", label: "خزانه درآمد", type: "number" },
    { name: "used_future_commission_amount", label: "کمیسیون های آینده", type: "number" },
    { name: "loans_count", label: "تعداد وام‌ها", type: "number" },
    { name: "created_at", label: "تاریخ ایجاد", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "show",
      label: "نمایش",
      icon: <EyeIcon />,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
      onClick: (item) => navigate(ROUTES.paymentLoansShow.replace(":id", String(item.id))),
    },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "id",
      label: "شناسه",
      columnSize: 1,
      type: "number",
    },
    {
      name: "start_total_amount",
      label: "مبلغ کل از",
      columnSize: 2,
      type: "number",
    },
    {
      name: "end_total_amount",
      label: "مبلغ کل تا",
      columnSize: 2,
      type: "number",
    },
  ];

  return (
    <>
      <PageMeta title="وام های تجمیعی" />
      <PageBreadcrumb pageTitle="وام‌های پرداختی" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/payment-loans"
          columns={columns}
          dataPathInApiRequest="data.paymentLoans.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.paymentLoans"
          pageTitle="لیست وام‌های پرداختی"
        />
      </div>
    </>
  );
}
