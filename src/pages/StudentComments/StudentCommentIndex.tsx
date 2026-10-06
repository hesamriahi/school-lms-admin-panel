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

export default function StudentCommentIndex() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "name", label: "نام هنرجو", type: "text", textLimit: 30 },
    { name: "student_job", label: "شغل", type: "text", textLimit: 30 },
    { name: "comment", label: "نظر", type: "text", textLimit: 40, textNotCenter: true },
    { name: "rate", label: "امتیاز", type: "number" },
    { name: "priority", label: "اولویت", type: "number", notNumberFormat: true },
    { name: "created_at", label: "تاریخ ثبت", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.studentCommentEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [
    {
      name: "name",
      label: "نام هنرجو",
      type: "text",
      columnSize: 1,
    },
    {
      name: "student_job",
      label: "شغل",
      type: "text",
      columnSize: 1,
    },
  ];

  return (
    <>
      <PageMeta title="لیست نظرات هنرجویان" />
      <Button
        className="mb-3"
        variant="success"
        size="sm"
        startIcon={<PlusIcon />}
        onClick={() => navigate(ROUTES.studentCommentCreate)}
      >
        نظر جدید
      </Button>
      <PageBreadcrumb pageTitle="لیست نظرات هنرجویان" />
      <div className="space-y-3">
        <TableComp
          apiRequestUrl="api/admin/student-comments"
          columns={columns}
          dataPathInApiRequest="data.studentComments.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.studentComments"
        />
      </div>
    </>
  );
}
