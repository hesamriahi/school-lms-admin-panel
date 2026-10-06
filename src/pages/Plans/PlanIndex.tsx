import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../components/tables/TableComp.tsx";
import { TableActionButtonEditIcon, PlusIcon } from "../../icons/index.ts";
import { FilterItemType } from "../../components/tables/TableFilterComp.tsx";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

export default function PlanIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "title", label: "عنوان", type: "text", textLimit: 30 },
    { name: "en_title", label: "عنوان انگلیسی", type: "text", textLimit: 30 },
    { name: "unit_price", label: "قیمت", type: "number" },
    { name: "courses_count", label: "تعداد دوره", type: "number", notNumberFormat: true, notSortable: true },
    { name: "units_count", label: "تعداد درس", type: "number", notNumberFormat: true, notSortable: true },
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
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.planEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [
    { name: "title", label: "عنوان", type: "text", columnSize: 1 },
    { name: "en_title", label: "عنوان انگلیسی", type: "text", columnSize: 1 },
    {
      name: "is_active",
      label: "وضعیت",
      type: "selectBox",
      columnSize: 1,
      options: [
        { label: "فعال", value: "1" },
        { label: "غیر فعال", value: "0" },
      ],
    },
  ];

  return (
    <>
      <PageMeta title="لیست پلن‌ها" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.planCreate)}>
        پلن جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست پلن‌ها" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/plans"
          columns={columns}
          dataPathInApiRequest="data.plans.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.plans"
        />
      </div>
    </>
  );
}
