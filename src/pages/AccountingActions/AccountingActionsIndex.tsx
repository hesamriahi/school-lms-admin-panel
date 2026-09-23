import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import TableComp, { TableColumnType, ActionButtonType } from "../../components/tables/TableComp";
import { EyeIcon } from "../../icons";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";

const PERSIAN_MONTHS: Record<number, string> = {
  1: "فروردین",
  2: "اردیبهشت",
  3: "خرداد",
  4: "تیر",
  5: "مرداد",
  6: "شهریور",
  7: "مهر",
  8: "آبان",
  9: "آذر",
  10: "دی",
  11: "بهمن",
  12: "اسفند",
};

function MonthCell({ item }: { item: { month?: number; year?: number } }) {
  if (!Permission.check(['super_admin', 'accounting'])) return <Navigate to={ROUTES.home} replace />;
  const label = item.month != null && PERSIAN_MONTHS[item.month] ? `${PERSIAN_MONTHS[item.month]}${item.year ? ` ${item.year.toLocaleString('fa-IR', { useGrouping: false })}` : ''}` : "—";
  return <>{label}</>;
}

export default function AccountingActionsIndex() {
  const navigate = useNavigate();

  const actionButtons: ActionButtonType[] = [
    {
      name: "show",
      label: "نمایش",
      icon: <EyeIcon />,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
      onClick: (item) => navigate(ROUTES.accountingActionsShow.replace(":id", String(item.id))),
    },
  ];

  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number" },
    {
      name: "type",
      label: "نوع",
      type: "enum",
      enumValues: [
        { key: "membership_fee", color: "info", label: "حق عضویت" },
        { key: "installments", color: "primary", label: "اقساط" },
        { key: "assistance_installments", color: "warning", label: "اقساط مساعده" },
      ],
    },
    {
      name: "month",
      label: "ماه",
      type: "customComponent",
      customComponent: MonthCell,
    },
    { name: "total_amount", label: "مجموع کل", type: "number" },
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  return (
    <>
      <Button
        className="mb-3"
        variant="success"
        size="sm"
        startIcon={<PlusIcon />}
        onClick={() => navigate(ROUTES.accountingActionsStore)}
      >
        ورودی جدید
      </Button>
      <Button
        className="mb-3 mr-3"
        variant="outline"
        size="sm"
        // startIcon={<PlusIcon />}
        onClick={() => {
          const link = document.createElement("a");
          link.href = "/downloads/sample-excel-files.zip";
          link.download = "sample-excel-files.zip";
          link.click();
        }}
      >
        دانلود نمونه اکسل
      </Button>
      <PageBreadcrumb pageTitle="لیست عملیات حسابداری" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/accounting-actions"
          dataPathInApiRequest="data.accountingActions.data"
          paginationPathInApiRequest="data.accountingActions"
          columns={columns}
          actionButtons={actionButtons}
          wantPagination={true}
          pageTitle="لیست عملیات حسابداری"
        />
      </div>
    </>
  );
}
