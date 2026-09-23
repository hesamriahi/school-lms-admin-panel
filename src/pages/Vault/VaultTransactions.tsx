import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, {TableColumnType} from "../../components/tables/TableComp.tsx";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import Badge from "../../components/ui/badge/Badge.tsx";
import PageMeta from '../../components/common/PageMeta';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";

function amountCell({item}: {item: {amount:number, is_increament:boolean}}) {
  let amount = Number(item.amount).toLocaleString('fa-IR', { maximumFractionDigits: 2 });
  const backgroundColor = item.is_increament ? 'success' : 'error';
  return <Badge size="md" color={backgroundColor}>{amount}</Badge>;
}


    // todo: IMAGE COLUMN
export default function VaultTransactions() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const [vaultName, setVaultName] = useState('');

  useEffect(() => {
    // this is so stupid, I know. but it was so fast without using AI.
    ApiRequest.call('api/admin/vaults/' + id, 'GET', null, null, false, true).then((response) => {
      const apiResponse = response as ApiResponse;
      setVaultName(apiResponse.data.vault.name);
    });
  }, []);

  const columns:TableColumnType[] = [
    {name: "id", label: "شناسه", type: "number", notNumberFormat: true},
    {name: "user.full_name", label: "نام و نام خانوادگی", type: "text", textLimit: 20},
    {name: "amount", label: "مبلغ", type: "customComponent", customComponent:amountCell},
    {name: "description", label: "توضیحات", type: "text", textLimit: 150 },
    {name: "created_at", label: "تاریخ ثبت", type: "datetime"},
  ];


  return (
    <>
      <PageMeta title={"تراکنش های " + vaultName} />
      <PageBreadcrumb pageTitle={"لیست تراکنش های " + vaultName} />
      <div className="space-y-3">
      
        <TableComp
          apiRequestUrl={"api/admin/vaults/" + id + "/transactions"}
          columns={columns}
          dataPathInApiRequest="data.transactions.data"
          wantPagination={true}
          paginationPathInApiRequest="data.transactions"
        />
      </div>
    </>
  );
}