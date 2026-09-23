import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import TableComp, {ActionButtonType, TableColumnType} from "../../components/tables/TableComp.tsx";
import { TableActionButtonEditIcon, ListIcon } from "../../icons/index.ts";
import {FilterItemType} from "../../components/tables/TableFilterComp.tsx";
import { PlusIcon } from "../../icons/index.ts";
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';

import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

    // todo: IMAGE COLUMN
export default function UserIndex() {
  if (Permission.check(['super_admin', 'accounting']) === false) return <Navigate to={ROUTES.home} replace />;

  const navigate = useNavigate();
  const columns:TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notNumberFormat: true},
    {name: "national_code", label: "کد ملی", type: "number", textLimit: 30, notNumberFormat: true, notSortable: true},
    {name: "full_name", label: "نام و نام خانوادگی", type: "text", textLimit: 30, notSortable: true},
    {name: "employment_code", label: "کد پرسنلی", type: "number", textLimit: 30, notNumberFormat: true, notSortable: true},
    {name: "mobile", label: "شماره همراه", type: "mobile", textLimit: 30, notSortable: true},
    {name: "balance", label: "سرمایه", type: "number"},
    {name: "debt", label: "بدهی", type: "number"},
    {name: "created_at", label: "تاریخ ثبت", type: "datetime"},
  ];


  const actionButtons:ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.userEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
    },
    {
      name: "transaction",
      label: "تراکنش ها و موجودی",
      icon: <ListIcon />,
      url: ROUTES.userTransactionIndex,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
    }
    // {
    //   name: "delete",
    //   label: "حذف",
    //   icon: <TableActionButtonDeleteIcon />,
    //   url: ROUTES.userIndex,
    //   className: "hover:text-error-500 dark:hover:text-error-500 dark:text-gray-400"
    // }
  ];


  const filterItems:FilterItemType[] = [
    {
      name: "id",
      label: "شناسه",
      columnSize: 1,
      type: "number",
    },
    {
      name:"national_code",
      label: "کد ملی",
      type: "text",
      columnSize: 1,
    },
    {
      name:"first_name",
      label: "نام",
      type: "text",
      columnSize: 1,
    },    
    {
      name:"last_name",
      label: "نام خانوادگی",
      type: "text",
      columnSize: 1,
    },
    {
      name:"employment_code",
      label: "کد پرسنلی",
      type: "text",
      columnSize: 1,
    },
    {
      name:"mobile",
      label: "شماره همراه",
      type: "text",
      columnSize: 1,
    },    
    {
      name:"created_at",
      label: "تاریخ ثبت",
      type: "datetimeRange",
      columnSize: 2,
    }
  ];


  return (
    <>
        <PageMeta title="لیست کاربران" />
        <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.userCreate)}>
        کاربر جدید
        </Button>
      <PageBreadcrumb pageTitle="لیست کاربران" />
      <div className="space-y-3">
      
        <TableComp
          apiRequestUrl="api/admin/users"
          columns={columns}
          dataPathInApiRequest="data.users.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.users"
          needExcelExport={true}
        />
      </div>
    </>
  );
}