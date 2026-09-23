import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import TableComp, { TableColumnType } from "../../../components/tables/TableComp.tsx";
import type { FilterItemType } from "../../../components/tables/TableFilterComp.tsx";
import PageMeta from '../../../components/common/PageMeta';
import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../routes.ts";


export default function UserInstallmentsIndex() {
  if (Permission.check(['user']) === false) return <Navigate to={ROUTES.home} replace />;
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number" },
    { name: "loan.amount", label: "مبلغ وام", type: "number" },
    { name: "installment_number", label: "شماره قسط", type: "number" },
    { name: "amount", label: "مبلغ قسط", type: "number" },
    {
      name: "status",
      label: "وضعیت",
      type: "enum",
      enumValues: [
        { key: "paid", color: "success", label: "پرداخت شده" },
        { key: "unpaid", color: "warning", label: "پرداخت نشده" },
        { key: "overdue", color: "error", label: "معوق" },
      ],
    },
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "status",
      label: "وضعیت",
      type: "selectBox",
      columnSize: 1,
      options: [
        { value: "paid", label: "پرداخت شده" },
        { value: "unpaid", label: "پرداخت نشده" },
        { value: "overdue", label: "معوق" },
      ],
    },
    {
      name: "amount_start",
      label: "مبلغ قسط از",
      type: "number",
      columnSize: 1,
    },
    {
      name: "amount_end",
      label: "مبلغ قسط تا",
      type: "number",
      columnSize: 1,
    },
  ];

  return (
    <>
      <PageMeta title="اقساط" />
      <PageBreadcrumb pageTitle="اقساط" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/user/installments"
          dataPathInApiRequest="data.installments.data"
          paginationPathInApiRequest="data.installments"
          columns={columns}
          filterItems={filterItems}
          wantPagination={true}
          pageTitle="لیست اقساط"
        />
      </div>
    </>
  );
}
