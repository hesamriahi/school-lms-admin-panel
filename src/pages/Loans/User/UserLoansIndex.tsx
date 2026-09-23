import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import TableComp, { TableColumnType } from "../../../components/tables/TableComp.tsx";
import { FilterItemType } from "../../../components/tables/TableFilterComp.tsx";
import PageMeta from '../../../components/common/PageMeta';
import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../routes.ts";

export default function UserLoansIndex() {
  if (Permission.check(['user']) === false) return <Navigate to={ROUTES.home} replace />;
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
        { value: "reserved", label: "رزرو شده" },
        { value: "pending", label: "در انتظار" },
        { value: "paid", label: "پرداخت شده" },
        { value: "cancelled", label: "لغو شده" },
        { value: "completed", label: "تکمیل شده" },
      ],
    },
  ];

  return (
    <>
      <PageMeta title="لیست وام ها" />
      <PageBreadcrumb pageTitle="وام‌ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/user/loans"
          columns={columns}
          dataPathInApiRequest="data.loans.data"
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.loans"
          pageTitle="لیست وام‌ها"
        />
      </div>
    </>
  );
}
