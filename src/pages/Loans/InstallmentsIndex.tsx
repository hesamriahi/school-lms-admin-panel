import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, { TableColumnType } from "../../components/tables/TableComp.tsx";
import type { FilterItemType, FilterItemCustomComponentProps } from "../../components/tables/TableFilterComp.tsx";
import SearchableDropDownList from "../../components/common/SearchableDropDownList.tsx";
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

function FullNameCell({
  item,
}: {
  item: { loan?: { user?: { first_name?: string; last_name?: string } } };
}) {
  const first = item.loan?.user?.first_name ?? "";
  const last = item.loan?.user?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return <>{full || "—"}</>;
}

function yearMonth({
  item,
}: {
  item: { year?: number | string; month?: number | string };
}) {
  const year = item.year;
  const month = item.month;
  const value = year != null && month != null ? `${year}-${month}` : "";

  return <>{value || "—"}</>;
}


/** فیلتر جستجوی کاربر برای استفاده در filterItems با type: 'customComponent' */
function UserSearchFilter({ filter, setFilter, filterItem }: FilterItemCustomComponentProps) {
  const value = filter[filterItem.name];
  const defaultValue =
    value != null && value !== ""
      ? { value, label: typeof value === "number" ? `کاربر #${value}` : String(value) }
      : null;

  return (
    <SearchableDropDownList
      key={value != null ? `user-${value}` : "user-none"}
      apiUrl="api/admin/users-search"
      searchParamName="q"
      dataPath="data.users"
      valueKey="id"
      labelKey="full_name"
      placeholder={filterItem.label}
      onChange={(user) => setFilter(filterItem.name, user ? user.id : null)}
      defaultValue={defaultValue}
      minSearchLength={1}
    />
  );
}

export default function InstallmentsIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    {
      name: "full_name",
      label: "نام و نام خانوادگی",
      type: "customComponent",
      customComponent: FullNameCell,
      notSortable: true
    },
    {
      name: "year_month",
      label: "سال و ماه",
      type: "customComponent",
      customComponent: yearMonth,
      notSortable: true
    },
    { name: "loan_id", label: "شناسه وام", type: "number", notNumberFormat: true, notSortable: true },
    { name: "loan.user.employment_code", label: "کد پرسنلی", type: "number", notNumberFormat: true, notSortable: true },
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
      name: "user_id",
      label: "جستجوی کاربر",
      type: "customComponent",
      columnSize: 2,
      customComponent: UserSearchFilter,
    },
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
    {
      name: "loan_id",
      label: "شناسه وام",
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
          apiRequestUrl="api/admin/installments"
          dataPathInApiRequest="data.installments.data"
          paginationPathInApiRequest="data.installments"
          columns={columns}
          filterItems={filterItems}
          wantPagination={true}
          pageTitle="لیست اقساط"
          needExcelExport={true}
        />
      </div>
    </>
  );
}
