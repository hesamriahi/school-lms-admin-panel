import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Checkbox from "../../../components/form/input/Checkbox";
import LinearProgress from "../../../components/ui/progress/LinearProgress";
import ApiRequest from "../../../classes/ApiRequest";
import { ApiResponse } from "../../../classes/ApiRequest";
import { Table, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { TableActionButtonDeleteIcon, TableActionButtonEditIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from "../../../icons/index";
import { ToJalali } from "../../../classes/ToJalali";
import ToastrNotification from "../../../classes/ToastrNotification";
import ConfirmationDialog from "../../../components/Modals/ConfirmationDialog";
import ReservedLoanCreateEdit from "../../../components/ReservedLoan/ReservedLoanCreateEdit";
import Button from "../../../components/ui/button/Button";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageMeta from '../../../components/common/PageMeta';
import { Permission } from "../../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../routes.ts";
import { FileIcon } from "../../../icons/index.ts";



type AmountsBowlType = {
  name: string;
  balance: number;
  usedAmount: number;
  percentage: number;
  useIt: boolean;
  useItChangerFunction: () => void;
}



export default function ReservedLoansIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const navigate = useNavigate();
  const [reloadDataCounter, setReloadDataCounter] = useState(0);
  const [reloadAmountsBowlsSetterCounter, setReloadAmountsBowlsSetterCounter] = useState(0);
  const [amountsBowls, setAmountsBowls] = useState<AmountsBowlType[]>([]);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [requestedLoans, setRequestedLoans] = useState<object[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [newsortedListIds, setNewsortedListIds] = useState<number[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // what bowls you want to use:
  const [mainVaultUseIt, setMainVaultUseIt] = useState(true);
  const [futureInstallmentsUseIt, setFutureInstallmentsUseIt] = useState(true);
  const [commissionVaultUseIt, setCommissionVaultUseIt] = useState(false);
  const [futureCommissionsUseIt, setFutureCommissionsUseIt] = useState(false);
  const [incomeVaultUseIt, setIncomeVaultUseIt] = useState(false);

  const handleDeleteLoan = (item: any) => {
    ApiRequest.call('api/admin/reserved-loans/' + item.id, 'DELETE')
      .then((response: ApiResponse) => {
        if (response.success) {
          setReloadDataCounter((prev) => prev + 1);
        } else {
          ToastrNotification.error(response.message);
        }
      })
      .catch(() => {
        ToastrNotification.error('خطا در حذف وام');
      });
  };

  useEffect(() => {
    ApiRequest.call('api/admin/reserved-loans', 'GET')
      .then((response) => {
        const apiResponse = response as ApiResponse;
        console.log('const apiResponse', apiResponse)
        setApiResponse(apiResponse);
        setRequestedLoans(apiResponse.data.requestedLoans);
        amountsBowlSetter(apiResponse.data);
      });
  }, [reloadDataCounter]);

  useEffect(() => {
    if (apiResponse) {
      amountsBowlSetter(apiResponse.data);
    }
  }, [mainVaultUseIt, futureInstallmentsUseIt, commissionVaultUseIt, futureCommissionsUseIt, incomeVaultUseIt, reloadAmountsBowlsSetterCounter]);

  const amountsBowlSetter = (data: any) => {
    console.log('amountsBowlSetter', data)
    if (!data || Object.keys(data).length === 0) return;
    console.log('this is defined', data)
    var totalReservedLoansAmount = data.totals.loans - data.totals.other_reduces;
    var amountsBowl: AmountsBowlType[] = [];
    // add main vault first
    const mainVault = data.vaults.find((vault: any) => vault.type === 'main');
    let totalBalanceInBowls = 0;
    let mainVaultUsedAmount =  0;
    if (mainVaultUseIt) {
      mainVaultUsedAmount = Math.min(mainVault.balance, totalReservedLoansAmount);
      totalReservedLoansAmount -= mainVaultUsedAmount;
      totalBalanceInBowls += mainVaultUsedAmount;
    }
    amountsBowl.push({
      name: mainVault.name,
      balance: mainVault.balance,
      usedAmount: mainVaultUsedAmount,
      percentage: mainVault.balance > 0 ? (mainVaultUsedAmount / mainVault.balance) * 100 : 0,
      useIt: mainVaultUseIt,
      useItChangerFunction: () => setMainVaultUseIt(!mainVaultUseIt),
    });
    // future installments
    let futureInstallmentsUsedAmount =  0;
    if (futureInstallmentsUseIt) {
      futureInstallmentsUsedAmount = Math.min(data.predicts.installments, totalReservedLoansAmount);
      totalReservedLoansAmount -= futureInstallmentsUsedAmount;
      totalBalanceInBowls += futureInstallmentsUsedAmount;
    }
    amountsBowl.push({
      name: 'قسط های آتی',
      balance: data.predicts.installments,
      usedAmount: futureInstallmentsUsedAmount,
      percentage: data.predicts.installments > 0 ? (futureInstallmentsUsedAmount / data.predicts.installments) * 100 : 0,
      useIt: futureInstallmentsUseIt,
      useItChangerFunction: () => setFutureInstallmentsUseIt(!futureInstallmentsUseIt),
    });
    // commission vault
    const commissionVault = data.vaults.find((vault: any) => vault.type === 'commission');
    let commissionVaultUsedAmount =  0;
    if (commissionVaultUseIt) {
      commissionVaultUsedAmount = Math.min(commissionVault.balance, totalReservedLoansAmount);
      totalReservedLoansAmount -= commissionVaultUsedAmount;
      totalBalanceInBowls += commissionVaultUsedAmount;
    }
    amountsBowl.push({
      name: commissionVault.name,
      balance: commissionVault.balance,
      usedAmount: commissionVaultUsedAmount,
      percentage: commissionVault.balance > 0 ? (commissionVaultUsedAmount / commissionVault.balance) * 100 : 0,
      useIt: commissionVaultUseIt,
      useItChangerFunction: () => setCommissionVaultUseIt(!commissionVaultUseIt),
    });
    // future commissions
    let futureCommissionsUsedAmount =  0;
    if (futureCommissionsUseIt) {
      futureCommissionsUsedAmount = Math.min(data.predicts.commissions, totalReservedLoansAmount);
      totalReservedLoansAmount -= futureCommissionsUsedAmount;
      totalBalanceInBowls += futureCommissionsUsedAmount;
    }
    amountsBowl.push({
      name: 'کمیسیون های آتی',    
      balance: data.predicts.commissions,
      usedAmount: futureCommissionsUsedAmount,
      percentage: data.predicts.commissions > 0 ? (futureCommissionsUsedAmount / data.predicts.commissions) * 100 : 0,
      useIt: futureCommissionsUseIt,
      useItChangerFunction: () => setFutureCommissionsUseIt(!futureCommissionsUseIt),
    });
    // income vault
    const incomeVault = data.vaults.find((vault: any) => vault.type === 'income');
    let incomeVaultUsedAmount =  0;
    if (incomeVaultUseIt) {
      incomeVaultUsedAmount = Math.min(incomeVault.balance, totalReservedLoansAmount);
      totalReservedLoansAmount -= incomeVaultUsedAmount;
      totalBalanceInBowls += incomeVaultUsedAmount;
    }
    amountsBowl.push({  
      name: incomeVault.name,
      balance: incomeVault.balance,
      usedAmount: incomeVaultUsedAmount,
      percentage: incomeVault.balance > 0 ? (incomeVaultUsedAmount / incomeVault.balance) * 100 : 0,
      useIt: incomeVaultUseIt,
      useItChangerFunction: () => setIncomeVaultUseIt(!incomeVaultUseIt),
    });
    // set amounts bowls
    setAmountsBowls(amountsBowl);

    // build table items for table body
    let totalPaidAmountInTableItems = 0;
    const isTotalBalanceInBowlsEnough = (paid_user_amount: number): boolean => {
      totalPaidAmountInTableItems += paid_user_amount;
      return totalPaidAmountInTableItems <= totalBalanceInBowls;
    };
    const reservedLoans = data.reservedLoans || [];
    const items = reservedLoans.map((item: any) => {
      const paid = Number(item.paid_user_amount) || 0;
      item.enough = isTotalBalanceInBowlsEnough(paid);
      return item;
    });
    if (apiResponse) {
      apiResponse.data.reservedLoans = items;
      setApiResponse({ ...apiResponse });
    }
  };

  const editActionButton = (item: any) => (
    <button
      type="button"
      onClick={() => {
        setItemToEdit(item);
        setIsEditModalOpen(true);
      }}
      className="inline-flex items-center px-1 py-0 text-lg font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
      title="ویرایش"
    >
      <TableActionButtonEditIcon />
    </button>
  );

  const deleteActionButton = (item: any) => (
    <button
      type="button"
      onClick={() => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
      }}
      className="inline-flex items-center px-1 py-0 text-lg font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:text-error-500 dark:hover:text-error-500 dark:text-gray-400"
      title="حذف"
    >
      <TableActionButtonDeleteIcon />
    </button>
  );

  const handleAcceptLoanRequest = (item: any, isAccepted: boolean) => {
    ApiRequest.call(
      'api/admin/reserved-loans/acceptation/' + item.id, 
      'POST',
      {is_accepted: isAccepted},
      null,
      true,
      true
    ).then((response: ApiResponse) => {
        if (response.success) {
          setReloadDataCounter((prev) => prev + 1);
        } else {
          ToastrNotification.error(response.message);
        }
      })
      .catch(() => {
        ToastrNotification.error('خطا در ارتباط');
      });
  };

  const arrowUpActionButton = (item: any) => (
    <button
      type="button"
      onClick={() => {
        handleAcceptLoanRequest(item, true);
      }}
      className="inline-flex items-center px-1 py-0 text-lg font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:text-error-500 dark:hover:text-error-500 dark:text-gray-400"
      title="پذیرش درخواست کاربر"
    >
      <ArrowUpIcon />
    </button>
  );

  const arrowDownActionButton = (item: any) => (
    <button
      type="button"
      onClick={() => {
        handleAcceptLoanRequest(item, false);
      }}
      className="inline-flex items-center px-1 py-0 text-lg font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:text-error-500 dark:hover:text-error-500 dark:text-gray-400"
      title="حذف از رزرو"
    >
      <ArrowDownIcon />
    </button>
  );

  const handleDragEnd = (result: any) => {
    if (!result.destination || !apiResponse) {
      return;
    }

    const items = Array.from(apiResponse.data.reservedLoans);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setApiResponse({
      ...apiResponse,
      data: {
        ...apiResponse.data,
        reservedLoans: items,
      },
    });

    const ids = items.map((item: any) => item.id);
    setNewsortedListIds(ids);
    // setReloadAmountsBowlsSetterCounter((prev) => prev + 1);
  };

  const handleSort = () => {
    if (newsortedListIds.length === 0) return;

    ApiRequest.call('api/admin/reserved-loans/sort', 'POST', { ids: newsortedListIds }, null, true, true)
      .then((response: ApiResponse) => {
        if (response.success) {
          setNewsortedListIds([]);
          setReloadDataCounter((prev) => prev + 1);
          // setReloadAmountsBowlsSetterCounter((prev) => prev + 1);
        } else {
          ToastrNotification.error(response.message || 'خطا در ذخیره ترتیب');
        }
      })
      .catch(() => {
        ToastrNotification.error('خطا در ارتباط با سرور');
      });
  };

  const handleModalSuccess = () => {
    setReloadDataCounter((prev) => prev + 1);
  };

  const handlePayment = async () => {
    setIsPaymentDialogOpen(false);

    const requestData = {
      mainVaultUseIt: mainVaultUseIt ? 1 : 0,
      futureInstallmentsUseIt: futureInstallmentsUseIt ? 1 : 0,
      commissionVaultUseIt: commissionVaultUseIt ? 1 : 0,
      futureCommissionsUseIt: futureCommissionsUseIt ? 1 : 0,
      incomeVaultUseIt: incomeVaultUseIt ? 1 : 0,
    };

    const response = await ApiRequest.call(
      'api/admin/payment-loans',
      'POST',
      requestData,
      null,
      true,
      true
    );

    if (response.success) {
      navigate(ROUTES.paymentLoansIndex);
    }
  };

  const getExcelExport = () => {
    ApiRequest.call(`api/admin/reserved-loans`, 'GET', null, null, false, true, false, 'xlsx').then((response:ApiResponse) => {
      const a = document.createElement('a');
      a.href = response.data.url;
      a.download = response.data.filename;
      a.click();
      window.URL.revokeObjectURL(response.data.url);
    });
  }

  return (
    <>

      
      <PageMeta title="لیست ورودی های حسابداری" />
      <div className="mb-3 flex gap-2">
        <Button 
          variant="success" 
          size="sm" 
          startIcon={<PlusIcon />} 
          onClick={() => setIsCreateModalOpen(true)}
        >
          وام جدید
        </Button>
        <Button className="bg-yellow-200" variant="outline" size="sm" startIcon={<FileIcon />} onClick={getExcelExport}>
          خروجی اکسل
        </Button>
        {newsortedListIds.length > 0 && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSort}
          >
            مرتب سازی
          </Button>
        )}
        {apiResponse && apiResponse.data.reservedLoans && apiResponse.data.reservedLoans.length > 0 && (
          <Button 
            variant="primary" 
            size="sm" 
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            پرداخت
          </Button>
        )}
      </div>
      <PageBreadcrumb pageTitle="رزرو تسهیلات" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 mb-5">
        {amountsBowls.map((amountsBowl) => (
          <ComponentCard key={amountsBowl.name}>
            <div className="flex items-center gap-3">
              <Checkbox  checked={amountsBowl.useIt} onChange={amountsBowl.useItChangerFunction} />
              <LinearProgress value={amountsBowl.percentage} title={amountsBowl.name + ' (' + Number(amountsBowl.balance).toLocaleString('fa-IR')  + ' / ' + Number(amountsBowl.usedAmount).toLocaleString('fa-IR') + ')'} className="flex-1"/>
            </div>
          </ComponentCard>
        ))}
      </div>

      <ComponentCard title="رزرو شده ها">
        {apiResponse && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">اولویت</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">نوع</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">نام و نام خانوادگی</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">مبلغ وام</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">پرداختی کاربر</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">کمیسیون</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">بیمه</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">بدهی قبلی</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">تاریخ ثبت</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">عملیات</TableCell>
                  </TableRow>
                </TableHeader>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided) => (
                      <tbody
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="divide-y divide-gray-100 dark:divide-white/[0.05]"
                      >
                        {apiResponse.data?.reservedLoans?.map((item: any, index: number) => {
                          const fullName = item.user?.full_name || '';
                          const fullNameDisplay = fullName && fullName.length > 60 ? fullName.substring(0, 60) + "..." : fullName;
                          return (
                            <Draggable
                              key={String(item.id ?? index)}
                              draggableId={String(item.id ?? index)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={
                                    snapshot.isDragging
                                      ? "bg-blue-100 dark:bg-blue-900/30"
                                      : item.enough
                                      ? `hover:bg-gray-200 dark:hover:bg-gray-700 ${index % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : ""}`
                                      : "bg-red-100 dark:bg-red-800"
                                  }
                                >
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.priority).toLocaleString("fa-IR", { maximumFractionDigits: 0 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    <div className="truncate">{(item.type === 'normal') ? 'قرض الحسنه' : (item.type === 'assistance') ? 'مساعده' : item.type}</div>
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    <div className="truncate">{fullNameDisplay}</div>
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.paid_user_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.commission_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.insurance_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.other_reduces_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400" dir="ltr">
                                    {ToJalali(item.created_at)}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex justify-center gap-0">
                                      {editActionButton(item)}
                                      {deleteActionButton(item)}
                                      {arrowDownActionButton(item)}
                                    </div>
                                  </TableCell>
                                </tr>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </DragDropContext>
                
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>

      <ComponentCard title="درخواست شده ها" className="mt-5">
        {apiResponse && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">اولویت</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">نوع</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">نام و نام خانوادگی</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">مبلغ وام</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">پرداختی کاربر</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">کمیسیون</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">بیمه</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">بدهی قبلی</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">تاریخ ثبت</TableCell>
                    <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400">عملیات</TableCell>
                  </TableRow>
                </TableHeader>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided) => (
                      <tbody
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="divide-y divide-gray-100 dark:divide-white/[0.05]"
                      >
                        {requestedLoans?.map((item: any, index: number) => {
                          const fullName = item.user?.full_name || '';
                          const fullNameDisplay = fullName && fullName.length > 60 ? fullName.substring(0, 60) + "..." : fullName;
                          return (
                            <>
                              <tr
                                  ref={provided.innerRef}
                                  className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                                >
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {''}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    <div className="truncate">{(item.type === 'normal') ? 'قرض الحسنه' : (item.type === 'assistance') ? 'مساعده' : item.type}</div>
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    <div className="truncate">{fullNameDisplay}</div>
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.paid_user_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.commission_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.insurance_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {Number(item.other_reduces_amount).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400" dir="ltr">
                                    {ToJalali(item.created_at)}
                                  </TableCell>
                                  <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex justify-center gap-0">
                                      {deleteActionButton(item)}
                                      {arrowUpActionButton(item)}
                                    </div>
                                  </TableCell>
                              </tr>
                            </>
                          );
                        })}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </DragDropContext>
                
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete) {
            handleDeleteLoan(itemToDelete);
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
          }
        }}
        text="آیا از حذف این وام مطمئن هستید؟"
        confirmText="بله، حذف کن"
        cancelText="انصراف"
      />

      <ConfirmationDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
        }}
        onConfirm={handlePayment}
        text="آیا نسبت به پرداخت وام ها مطمئن هستید؟"
        confirmText="بله، پرداخت کن"
        cancelText="انصراف"
      />

      <ReservedLoanCreateEdit
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        onSuccess={handleModalSuccess}
      />

      <ReservedLoanCreateEdit
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemToEdit(null);
          setReloadAmountsBowlsSetterCounter((prev) => prev + 1);
        }}
        item={itemToEdit}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}