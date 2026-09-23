import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import { useParams } from "react-router";
import TableComp, { TableColumnType } from "../../../components/tables/TableComp.tsx";
import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../routes.ts";
import Button from "../../../components/ui/button/Button.tsx";
import { FileIcon } from "../../../icons/index.ts";
import ApiRequest, { ApiResponse } from "../../../classes/ApiRequest.ts";

export default function PaymentLoansShow() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const { id } = useParams<{ id: string }>();

  const getExcelExport = () => {
    ApiRequest.call(`api/admin/payment-loans/${id}`, 'GET', null, null, false, true, false, 'xlsx').then((response:ApiResponse) => {

      const a = document.createElement('a');
      a.href = response.data.url;
      a.download = response.data.filename;
      a.click();
      window.URL.revokeObjectURL(response.data.url);
    });
  }
  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number" },
    { name: "user.full_name", label: "کاربر", type: "text" },
    { name: "amount", label: "مبلغ کل", type: "number" },
    { name: "paid_user_amount", label: "پرداختی کاربر", type: "number" },
    { name: "commission_amount", label: "کمیسیون", type: "number" },
    { name: "insurance_amount", label: "بیمه", type: "number" },
    { name: "other_reduces_amount", label: "بدهی قبلی", type: "number" },
    { name: "installments_count", label: "تعداد اقساط", type: "number" },
    { name: "installment_amount", label: "مبلغ قسط", type: "number" },
    { name: "description", label: "توضیحات", type: "text" },
    { name: "paid_at", label: "تاریخ پرداخت", type: "datetime" },
    { name: "created_at", label: "تاریخ ایجاد", type: "datetime" },
  ];

  if (!id) return null;

  return (
    <>
      <Button className="mb-3 bg-yellow-200" variant="outline" size="sm" startIcon={<FileIcon />} onClick={getExcelExport}>
      خروجی اکسل
      </Button>
      <PageBreadcrumb pageTitle={`نمایش وام پرداختی #${id}`} />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl={`api/admin/payment-loans/${id}`}
          columns={columns}
          dataPathInApiRequest="data.paymentLoan.loans"
          wantPagination={false}
          pageTitle="وام‌های این پرداخت"
        />
      </div>
    </>
  );
}
