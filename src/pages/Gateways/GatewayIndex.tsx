import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../components/tables/TableComp.tsx";
import { TableActionButtonEditIcon, PlusIcon } from "../../icons/index.ts";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

export default function GatewayIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "name", label: "درایور", type: "text" },
    { name: "label", label: "عنوان", type: "text", textLimit: 30 },
    { name: "priority", label: "اولویت", type: "number", notNumberFormat: true },
    {
      name: "is_active",
      label: "وضعیت",
      type: "enum",
      enumValues: [
        { key: 1, color: "success", label: "فعال" },
        { key: true, color: "success", label: "فعال" },
        { key: 0, color: "error", label: "غیر فعال" },
        { key: false, color: "error", label: "غیر فعال" },
      ],
    },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.gatewayEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  return (
    <>
      <PageMeta title="لیست درگاه‌های پرداخت" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.gatewayCreate)}>
        درگاه جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست درگاه‌های پرداخت" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/gateways"
          columns={columns}
          dataPathInApiRequest="data.gateways"
          actionButtons={actionButtons}
          wantPagination={false}
        />
      </div>
    </>
  );
}
