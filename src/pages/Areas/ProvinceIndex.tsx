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

export default function ProvinceIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "name", label: "نام استان", type: "text", textLimit: 30 },
    { name: "cities_count", label: "تعداد شهر", type: "number", notNumberFormat: true, notSortable: true },
    {
      name: "status",
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
      url: ROUTES.provinceEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [{ name: "name", label: "نام استان", type: "text", columnSize: 1 }];

  return (
    <>
      <PageMeta title="لیست استان‌ها" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.provinceCreate)}>
        استان جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست استان‌ها" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/provinces"
          columns={columns}
          dataPathInApiRequest="data.provinces.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.provinces"
        />
      </div>
    </>
  );
}
