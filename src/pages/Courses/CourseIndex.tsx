import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../components/tables/TableComp.tsx";
import { TableActionButtonEditIcon, PlusIcon, ListIcon } from "../../icons/index.ts";
import { FilterItemType } from "../../components/tables/TableFilterComp.tsx";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

export default function CourseIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "title", label: "عنوان", type: "text", textLimit: 30 },
    { name: "teacher.name", label: "استاد", type: "text", textLimit: 30, notSortable: true },
    {
      name: "status",
      label: "وضعیت انتشار",
      type: "enum",
      enumValues: [
        { key: "draft", color: "warning", label: "پیش‌نویس" },
        { key: "published", color: "success", label: "منتشر شده" },
        { key: "archived", color: "light", label: "آرشیو" },
      ],
    },
    {
      name: "is_active",
      label: "فعال",
      type: "enum",
      enumValues: [
        { key: 1, color: "success", label: "بله" },
        { key: true, color: "success", label: "بله" },
        { key: 0, color: "error", label: "خیر" },
        { key: false, color: "error", label: "خیر" },
      ],
    },
    { name: "unit_price", label: "قیمت", type: "number" },
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.courseEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
    {
      name: "units",
      label: "دروس",
      icon: <ListIcon />,
      url: ROUTES.courseUnitsIndex,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [
    { name: "title", label: "عنوان", type: "text", columnSize: 1 },
    { name: "teacher_id", label: "شناسه استاد", type: "number", columnSize: 1 },
    { name: "category_id", label: "شناسه دسته‌بندی", type: "number", columnSize: 1 },
  ];

  return (
    <>
      <PageMeta title="لیست دوره‌ها" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.courseCreate)}>
        دوره جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست دوره‌ها" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/courses"
          columns={columns}
          dataPathInApiRequest="data.courses.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.courses"
        />
      </div>
    </>
  );
}
