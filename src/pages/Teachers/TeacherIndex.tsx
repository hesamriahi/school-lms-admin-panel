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

// function TeacherImageCell({ item }: { item: any }) {
//   const src = item?.image?.conversions?.sm || item?.image?.url;
//   if (!src) return <span className="text-gray-400">—</span>;
//   return <img src={src} alt={item?.name || ""} className="mx-auto h-10 w-10 rounded-full object-cover" />;
// }

export default function TeacherIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    // { name: "image", label: "تصویر", type: "customComponent", customComponent: TeacherImageCell, notSortable: true },
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "name", label: "نام", type: "text", textLimit: 30 },
    { name: "short_description", label: "توضیح کوتاه", type: "text", textLimit: 40, notSortable: true },
    {
      name: "is_active",
      label: "وضعیت",
      type: "enum",
      enumValues: [
        { key: 1, color: "success", label: "فعال" },
        { key: 0, color: "error", label: "غیر فعال" },
      ],
    },
    {
      name: "show_in_mentors_list",
      label: "نمایش در صفحه اصلی",
      type: "enum",
      enumValues: [
        { key: 1, color: "success", label: "بله" },
        { key: 0, color: "error", label: "خیر" },
      ],
    },
    { name: "priority", label: "اولویت", type: "number", notNumberFormat: true },
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.teacherEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "name",
      label: "نام",
      type: "text",
      columnSize: 1,
    },
    {
      name: "show_in_mentors_list",
      label: "نمایش در صفحه اصلی",
      type: "selectBox",
      columnSize: 1,
      options: [
        { label: "بله", value: "1" },
        { label: "خیر", value: "0" },
      ],
    },
  ];

  return (
    <>
      <PageMeta title="لیست اساتید" />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.teacherCreate)}>
        استاد جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست اساتید" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/teachers"
          columns={columns}
          dataPathInApiRequest="data.teachers.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.teachers"
        />
      </div>
    </>
  );
}
