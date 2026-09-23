import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, { TableColumnType } from "../../components/tables/TableComp.tsx";
import { FilterItemType } from "../../components/tables/TableFilterComp.tsx";
import PageMeta from "../../components/common/PageMeta";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

const persianMonths = [
  { value: "1", label: "فروردین" },
  { value: "2", label: "اردیبهشت" },
  { value: "3", label: "خرداد" },
  { value: "4", label: "تیر" },
  { value: "5", label: "مرداد" },
  { value: "6", label: "شهریور" },
  { value: "7", label: "مهر" },
  { value: "8", label: "آبان" },
  { value: "9", label: "آذر" },
  { value: "10", label: "دی" },
  { value: "11", label: "بهمن" },
  { value: "12", label: "اسفند" },
];

const accountingActionTypes = [
  { value: "installments", label: "اقساط پرداخت شده" },
  { value: "membership_fee", label: "حق عضویت ها" },
  { value: "assistance_installments", label: "اقساط وام های مساعده" },
];

function FullNameCell({
  item,
}: {
  item: { user?: { first_name?: string; last_name?: string } };
}) {
  const first = item.user?.first_name ?? "";
  const last = item.user?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return <>{full || "—"}</>;
}


function affectDate({
  item,
}: {
  item: {
    accounting_action_item?: {
      accounting_action?: {
        year?: number | string;
        month?: number | string;
      };
    };
  };
}) {
  const year = item?.accounting_action_item?.accounting_action?.year;
  const month = item?.accounting_action_item?.accounting_action?.month;

  const date =
    year != null && month != null ? `${year}-${month}` : "—";

  return <>{date}</>;
}


export default function ContradictionsIndex() {
  if (Permission.check(["super_admin", "accounting"]) === false)
    return <Navigate to={ROUTES.home} replace />;
  
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    {
      name: "full_name",
      label: "نام و نام خانوادگی",
      type: "customComponent",
      customComponent: FullNameCell,
      notSortable: true,
    },
    {
      name: "affectDate",
      label: "سالوماه",
      type: "customComponent",
      customComponent: affectDate,
    },
    { name: "amount", label: "مقدار", type: "number" },
    { name: "description", label: "توضیحات", type: "text" },
    { name: "loan_id", label: "شناسه وام", type: "number", notNumberFormat: true },
    { name: "user.employment_code", label: "کد پرسنلی", type: "number", notNumberFormat: true, notSortable: true },
    { name: "user.national_code", label: "کد ملی", type: "number", notNumberFormat: true, notSortable: true },
    {
      name: "loan.type",
      label: "نوع وام",
      type: "enum",
      enumValues: [
        { key: "normal", color: "noColor", label: "قرض الحسنه" },
        { key: "assistance", color: "noColor", label: "مساعده" },
      ],
      notSortable: true,
    },
    { name: "created_at", label: "تاریخ ایجاد", type: "datetime" },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "id",
      label: "شناسه",
      columnSize: 1,
      type: "number",
    },
    {
      name: "year",
      label: "سال",
      type: "number",
      columnSize: 1,
    },
    {
      name: "month",
      label: "ماه",
      type: "selectBox",
      columnSize: 1,
      options: persianMonths.map((m) => ({ label: m.label, value: m.value })),
    },
    {
      name: "type",
      label: "نوع عملیات",
      type: "selectBox",
      columnSize: 1,
      options: accountingActionTypes.map((t) => ({ label: t.label, value: t.value })),
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
      name: "national_code",
      label: "کد ملی",
      type: "text",
      columnSize: 1,
    },
    {
      name: "employment_code",
      label: "کد پرسنلی",
      type: "text",
      columnSize: 1,
    },
    {
      name: "loan_id",
      label: "شناسه وام",
      type: "number",
      columnSize: 1,
    },
    {
      name: "created_at",
      label: "تاریخ ثبت",
      type: "datetimeRange",
      columnSize: 2,
    },
    {
      name: "description",
      label: "توضیحات",
      type: "text",
      columnSize: 2,
    },
  ];

  return (
    <>
      <PageMeta title="لیست مغایرت‌ها" />
      <PageBreadcrumb pageTitle="لیست مغایرت‌ها" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/contradictions"
          columns={columns}
          dataPathInApiRequest="data.contradictions.data"
          paginationPathInApiRequest="data.contradictions"
          filterItems={filterItems}
          wantPagination={true}
          needExcelExport={true}
        />
      </div>
    </>
  );
}
