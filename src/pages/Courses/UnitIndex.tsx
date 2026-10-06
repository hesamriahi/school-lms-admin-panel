import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../components/tables/TableComp.tsx";
import { TableActionButtonEditIcon, PlusIcon } from "../../icons/index.ts";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

export default function UnitIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "title", label: "عنوان", type: "text", textLimit: 30 },
    { name: "en_title", label: "عنوان انگلیسی", type: "text", textLimit: 30 },
    { name: "priority", label: "اولویت", type: "number", notNumberFormat: true },
    { name: "duration", label: "مدت", type: "number", notNumberFormat: true },
    {
      name: "is_private",
      label: "خصوصی",
      type: "enum",
      enumValues: [
        { key: 1, color: "warning", label: "بله" },
        { key: true, color: "warning", label: "بله" },
        { key: 0, color: "success", label: "خیر" },
        { key: false, color: "success", label: "خیر" },
      ],
    },
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: `/courses/${courseId}/units/:id/edit`,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  return (
    <>
      <PageMeta title="لیست دروس" />
      <Button
        className="mb-3"
        variant="success"
        size="sm"
        startIcon={<PlusIcon />}
        onClick={() => navigate(ROUTES.courseUnitCreate.replace(":id", String(courseId)))}
      >
        درس جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست دروس دوره" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl={`api/admin/courses/${courseId}/units`}
          columns={columns}
          dataPathInApiRequest="data.units.data"
          actionButtons={actionButtons}
          wantPagination={true}
          paginationPathInApiRequest="data.units"
        />
      </div>
    </>
  );
}
