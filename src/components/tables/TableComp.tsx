import {Table, TableBody, TableCell, TableHeader, TableRow} from '../ui/table';

import {useEffect} from 'react';
import {useState} from 'react';
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest.ts";
import Badge from "../ui/badge/Badge.tsx";
import {ToJalali} from "../../classes/ToJalali.ts";
import TableFilterComp, { FilterItemType } from './TableFilterComp.tsx';
import ComponentCard from '../common/ComponentCard.tsx';
import TablePaginationComp from './TablePaginationComp.tsx';
import { PaginationArguments } from './TablePaginationComp.tsx';
import TableStatusFilterBar from "./TableStatusFilterBar.tsx";
import { ChevronDownIcon } from '../../icons/index.ts';

type enumColors = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' | 'noColor';
type tableCellTypes = 'enum' | 'datetime' | 'date' | 'number' | 'mobile' | 'text' | 'customComponent';

// Add new type for action buttons
export interface ActionButtonType {
  name: string;
  label: string;
  icon: React.ReactNode;
  url?: string;
  className?: string;
  onClick?: (item: any) => void;
}



export interface TableColumnType {
  name: string;
  label: string;
  elementStyle?: string;
  type?: tableCellTypes;
  enumValues?: {key: string|number|boolean, color: enumColors, label?: string|React.ReactNode}[];
  textLimit?: number;
  customComponent?: React.ComponentType<{ item: any }>;
  textNotCenter?: boolean;
  notNumberFormat?: boolean;
  notSortable?: boolean;
}

type TableCompProps = {
  apiRequestUrl?: string;
  dataPathInApiRequest?: string;
  columns: TableColumnType[];
  wantExcelExport?: boolean;
  outSideData?: any[];
  actionButtons?: ActionButtonType[]; // Add new prop
  filterItems?: FilterItemType[];
  wantPagination: boolean;
  paginationPathInApiRequest?: string;
  statusesBarPathInApiRequest?: string;
  pageTitle?: string;
  needExcelExport?: boolean;
  /** در صورت ارسال، پس از دریافت پاسخ API فراخوانی می‌شود و پاسخ کامل به کامپوننت پدر پاس داده می‌شود */
  apiResponseReleaser?: (response: ApiResponse) => void;
  tableReloader?: (fn: () => void) => void;
}





export default function TableComp({
                                    apiRequestUrl = '',
                                    columns,
                                    outSideData = [],
                                    dataPathInApiRequest = '',
                                    actionButtons = [],
                                    filterItems = [],
                                    wantPagination = true,
                                    paginationPathInApiRequest = '',
                                    statusesBarPathInApiRequest = '',
                                    // pageTitle = 'لیست',
                                    apiResponseReleaser,
                                    tableReloader,
                                    needExcelExport = false
                                  }: TableCompProps) {

  const [filter, setFilter] = useState<Record<string, any>>({});
  const isSortDirAvailable = (columnName: string, sortDir: string):boolean => {
    if (!filter.hasOwnProperty("sortBy")) return false;
    if (filter.sortBy !== columnName) return false;
    if (filter.sortDir !== sortDir) return false;
    return true;
  }
  // Create headers including action buttons column if provided
  const headers = [
    ...columns.map((column) => (
      <TableCell
        key={column.name}
        isHeader
        className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400"
      >
        <div className={`flex items-center justify-center gap-1 ${column.notSortable ? "" : "cursor-pointer"}`}>
          <span
            onClick={column.notSortable ? undefined : () => handleSort(column.name)}
            className={column.notSortable ? "" : "cursor-pointer select-none"}
          >
            {column.label}
          </span>
          {!column.notSortable && 
            <div>
              <ChevronDownIcon className={`w-3 h-3 ${!isSortDirAvailable(column.name, 'desc') ? "text-gray-400" : "bg-gray-200"} rotate-180`} />
              <ChevronDownIcon className={`w-3 h-3 ${!isSortDirAvailable(column.name, 'asc') ? "text-gray-400" : "bg-gray-200"}`} />
            </div>
          }
        </div>
      </TableCell>
    )),
    // Add Actions column header if actionButtons exist
    ...(actionButtons.length > 0 ? [
      <TableCell
        key="actions"
        isHeader
        className="text-theme-xs px-5 py-3 text-center font-bold text-black dark:text-gray-400"
      >
        عملیات
      </TableCell>
    ] : [])
  ];

  

  const handleSort = (columnName: string) => {
    if (filter.hasOwnProperty("sortBy")) {
      if (filter.sortBy === columnName) {
        handleFilterChange('sortDir', filter.sortDir === "desc" ? "asc" : "desc");
        reloadTableData();
        return;
      }
    }
    handleFilterChange('sortBy', columnName);
    handleFilterChange('sortDir', 'desc');
    reloadTableData();
  }

  function getNestedValue(obj: any, path: string): any {
    // by this function I can get the api response in a dynamic path. like data.products.data or data.categories.data or etc
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }
  const [data, setData] = useState<any[]>(outSideData);
  const [rows, setRows] = useState<React.ReactNode[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [paginationArguments, setPaginationArguments] = useState<PaginationArguments>({from:1, to:1, total:1, current_page:1, last_page:1})
  const [statusesBarFilter, setStatusesBarFilter] = useState([])

  const paginationArgumentsSetter = (response: ApiResponse) => {
    const nestedValues : PaginationArguments = getNestedValue(response, paginationPathInApiRequest);
    setPaginationArguments({
      last_page: nestedValues.last_page,
      current_page: nestedValues.current_page,
      from: nestedValues.from,
      to: nestedValues.to,
      total: nestedValues.total,
    });
  }
  const statusesBarSetter = (response: ApiResponse) => {
    const nestedValues = getNestedValue(response, statusesBarPathInApiRequest);
    setStatusesBarFilter(nestedValues)
  }
  
  
  // we get data from backend if the apiRequestUrl has defined
  const [getApiRequestDataCounter, setGetApiRequestDataCounter] = useState(0);
  useEffect(() => {
    if (apiRequestUrl) {
      setIsLoading(true);
      console.log('in search', filter);
      ApiRequest.call(apiRequestUrl, 'GET', null, filter, false, true)
        .then((response: ApiResponse) => {
          if (wantPagination && paginationPathInApiRequest)
            paginationArgumentsSetter(response);
          if (statusesBarPathInApiRequest)
            statusesBarSetter(response);
          setData(getNestedValue(response, dataPathInApiRequest));
          apiResponseReleaser?.(response);
          setIsLoading(false);
        });
    }
  }, [apiRequestUrl, getApiRequestDataCounter]);

  const [excelExportCounter, setExcelExportCounter] = useState<number>(0);
  useEffect(() => {
    if (apiRequestUrl && excelExportCounter > 0) {
      ApiRequest.call(apiRequestUrl, 'GET', null, filter, false, true, false, 'xlsx').then((response:ApiResponse) => {
        const a = document.createElement('a');
        a.href = response.data.url;
        a.download = response.data.filename;
        a.click();
        window.URL.revokeObjectURL(response.data.url);
      });
    }
  }, [excelExportCounter]);

  const getExcelExport = () => {
    setExcelExportCounter(prev => prev + 1)
  }

  // Update data when outSideData changes (only if apiRequestUrl is not provided)
  useEffect(() => {
    if (!apiRequestUrl && outSideData && outSideData.length > 0) {
      setData(outSideData);
      setIsLoading(false);
    }
  }, [outSideData, apiRequestUrl]);
  
  // with this function I call the backend api to reload the data of the table.
  const reloadTableData = () => {
    setGetApiRequestDataCounter(prev => prev + 1)
  }

  useEffect(() => {
    tableReloader?.(reloadTableData);
  }, []);

  // filters ======================================================================
  const handleFilterChange = (key: string, value: any) => {    
    setFilter(prev => ({ ...prev, [key]: value }));
  };
  const setDefaultValuesForFilter = () => {
    filterItems.forEach((filterItem) => {
      switch (filterItem.type) 
      {
        case 'checkbox':
          const selectedOptionsList: string[] = [];
          filterItem.options?.forEach((option) => {
            if (option.selected) {
              selectedOptionsList.push(option.name || '');
            }
          });
          handleFilterChange(filterItem.name, selectedOptionsList);
        break;
        case 'radio':
          const selectedOption = filterItem.options?.find((option) => option.selected);
          if (selectedOption) { 
            handleFilterChange(filterItem.name, selectedOption.value);
          }
        break;
        case 'toggleSwitch':
          if (filterItem.defaultValue === 1) {
            handleFilterChange(filterItem.name, 1);
          }
        break;
      }
    });
  }

  useEffect(() => {
    if (filterItems.length > 0) {
      setDefaultValuesForFilter();
    }
  }, [filterItems]);

  const removeFromFilter = (key: string) => {
    setFilter(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }

  const [clearAllFiltersCounter, setClearAllFiltersCounter] = useState(0);
  useEffect(() => {
    if (clearAllFiltersCounter != 0) {
      setFilter({});
      reloadTableData();
    }
  }, [clearAllFiltersCounter]);

  const clearAllFilters = () => {
      setClearAllFiltersCounter(prev => prev + 1);
  }
  const [tableFilterComponent, setTableFilterComponent] = useState<React.ReactNode>(<></>);
  useEffect(() => {
    if (filterItems.length > 0) {
      setTableFilterComponent(
        <TableFilterComp 
          // the key attribute is because of when the clearAllFilterCounter changed, the TableFilterComp renders again
          key={clearAllFiltersCounter} 
          filterItems={filterItems} 
          filter={filter} 
          setFilter={handleFilterChange} 
          removeFromFilter={removeFromFilter} 
          clearAllFilters={clearAllFilters} 
          reloadTableData={reloadTableData} 
          // pageTitle={pageTitle}
          needExcelExport={needExcelExport}
          getExcelExport={getExcelExport}
        />
      )
    }
  }, [clearAllFiltersCounter]);
  // end filters section ======================================================
  // here I create row of the table using data.
  useEffect(() => {
    setRows(data?.map((item, index) => (
      <TableRow key={index} className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
        {columns.map((column) => {
          const columnName = column.name;

          let cellContent = item[columnName];
          if (columnName.includes('.')) {
            cellContent = getNestedValue(item, columnName);
          }
          // we create cell for each column to use in the table.
          return (() => {
            switch (column.type)
            {
              case "customComponent":
                return (
                  <TableCell key={index + "-" + columnName} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    {column.customComponent && <column.customComponent item={item} />}
                  </TableCell>
                );
              case "enum":
                return (
                  <TableCell key={index + "-" + columnName} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={column.enumValues?.find((e) => e.key === cellContent)?.color || 'noColor'}
                    >
                      {column.enumValues?.find((e) => e.key === cellContent)?.label || cellContent}
                    </Badge>
                  </TableCell>
                );
              case "datetime":
                return (
                  <TableCell key={index + "-" + columnName} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400" dir="ltr">
                    {ToJalali(cellContent)}
                  </TableCell>
                );
              case "date":
                return (
                  <TableCell key={index + "-" + columnName} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400" dir="ltr">
                    {ToJalali(cellContent, 'YYYY/MM/DD')}
                  </TableCell>
                );
              case "number":
                return (
                  <TableCell key={index + "-" + columnName} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    {column.notNumberFormat ? String(cellContent ?? '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]) : Number(cellContent).toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
                  </TableCell>
                );
              case "mobile": {
                const persian = String(cellContent ?? '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
                const formatted = persian.length > 4 ? `${persian.slice(0, 4)}-${persian.slice(4)}` : persian;
                return (
                  <TableCell key={index + "-" + columnName} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400" dir="ltr">
                    {formatted}
                  </TableCell>
                );
              }
              default:
                return (
                  <TableCell key={index + "-" + columnName} className={`text-theme-sm px-4 py-2 ${column.textNotCenter ? 'text-start' : 'text-center'} text-gray-500 dark:text-gray-400`}>
                    <div className="truncate">
                      {(cellContent && column.textLimit) ? ((cellContent.length > column.textLimit) ? cellContent.substring(0, column.textLimit) + '...' : cellContent) : cellContent}                  
                    </div>
                  </TableCell>
                );
            }
          })();
        })}
        {/* Add action buttons cell if actionButtons exist */}
        {actionButtons.length > 0 && (
          <TableCell key={`${index}-actions`} className="text-theme-sm px-4 py-2 text-center text-gray-500 dark:text-gray-400">
            <div className="flex justify-center gap-0">
              {actionButtons.map((actionButton) => (
                <button
                  key={actionButton.name}
                  onClick={() => actionButton.onClick ? actionButton.onClick(item) : actionButton.url ? window.location.href = actionButton.url.replace(':id', item.id) : null}
                  className={`inline-flex items-center px-1 py-0 text-lg font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${actionButton.className}`}
                  title={actionButton.label}
                >
                  {actionButton.icon}
                </button>
              ))}
            </div>
          </TableCell>
        )}
      </TableRow>
    )));
  }, [data]);

  // here I create the table with it's preLoader. we create the preLoader here.
  const [tableComponent, setTableComponent] = useState<React.ReactNode>(<></>);
  useEffect(() => {
    if (!isLoading) {
      setTableComponent(
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {headers}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {rows}
          </TableBody>
        </Table>
      )
    } else {
      setTableComponent(<div className='text-center p-4'><p>در حال بارگزاری... </p></div>)
    }
  }, [data, rows, isLoading]);

  

  return (
    <>
      {/*{<pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">*/}
      {/*  {JSON.stringify(filter, null, 2)}*/}
      {/*</pre>}*/}
      <ComponentCard>
        {tableFilterComponent}
        {
          statusesBarPathInApiRequest && statusesBarFilter &&
            <TableStatusFilterBar statusesItems={statusesBarFilter} filter={filter} setFilter={handleFilterChange} reloadTableData={reloadTableData} />
        }
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="w-full max-w-full overflow-x-auto">
            {tableComponent}
          </div>
        </div>

        { wantPagination &&
            <TablePaginationComp
                paginationArguments={paginationArguments}
                reloadTableData={reloadTableData}
                setFilter={handleFilterChange}
                removeFromFilter={removeFromFilter}
            />
        }
      </ComponentCard>
    </>
  );
}
