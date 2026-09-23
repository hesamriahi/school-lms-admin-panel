import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import TableComp, { TableColumnType, ActionButtonType } from "../../components/tables/TableComp";
import { EyeIcon } from "../../icons";
// import {FilterItemType} from "../../components/tables/TableFilterComp.tsx";
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";

export default function VaultIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const navigate = useNavigate();

  const actionButtons: ActionButtonType[] = [
    {
      name: "show",
      label: "نمایش",
      icon: <EyeIcon />,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
      onClick: (item) => navigate(ROUTES.vaultTransactions.replace(":id", String(item.id))),
    },
  ];

  const columns: TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notSortable: true },
    {name: "name", label: "نام خزانه", type: "text", textLimit: 30, notSortable: true},
    {name: "balance", label: "موجودی", type: "number", notSortable: true},
    {name: "total_increament", label: "مجموع ورودی ها", type: "number", notSortable: true},
    {name: "total_decreament", label: "مجموع خروجی ها", type: "number", notSortable: true}
  ];

  // const filterItems:FilterItemType[] = [
  //   {
  //     name: "vault_start_date",
  //     label: "تاریخ ثبت از",
  //     type: "datetime",
  //     columnSize: 2,
  //   },
  //   {
  //     name: "vault_end_date",
  //     label: "تاریخ ثبت تا",
  //     type: "datetime",
  //     columnSize: 2,
  //   }
  // ];

  return (
    <>
      <PageMeta title="خزانه ها" />
      <PageBreadcrumb pageTitle="لیست خزانه ها" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/vaults"
          dataPathInApiRequest="data.vaults"
          columns={columns}
          actionButtons={actionButtons}
          wantPagination={false}
          // filterItems={filterItems}
          pageTitle="لیست خزانه ها"
        />
      </div>
    </>
  );
}
