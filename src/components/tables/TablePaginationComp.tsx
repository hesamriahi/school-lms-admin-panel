import { ArrowLeftIcon, ArrowRightIcon } from "../../icons";

export interface PaginationArguments {
  last_page: number;
  current_page: number;
  from: number;
  to: number;
  total: number;
}
type Props = {
  paginationArguments: PaginationArguments;
  reloadTableData: () => void;
  setFilter: (name: string, value: any) => void;
  removeFromFilter: (name: string) => void;
}
export default function TablePaginationComp({ paginationArguments, reloadTableData, setFilter, removeFromFilter }: Props) {

  const goToPage = (goToPageNumber:number):void => {
    if (goToPageNumber < 1) return;
    if (goToPageNumber === paginationArguments.current_page) return;
    setFilter('page', goToPageNumber);
    reloadTableData();
  }
  
  const paginationButtonClassesSetter = (buttonNumber: number) :string => {
    if (buttonNumber == paginationArguments.current_page)
      return "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium bg-blue-500/[0.08] text-brand-500 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500";
    return "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
  }

  const paginationControls = (
    <>
      {/* Previous arrow */}
      <button
        className="ml-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"            
        onClick={() => goToPage(paginationArguments.current_page - 1)}
        disabled={paginationArguments.current_page == 1}
      >
        <ArrowRightIcon />
      </button>
      {/* first page */}
      {
        <button onClick={() => goToPage(1)} className={paginationButtonClassesSetter(1)}>1</button>
      }
      {/* dot boxes.  */}
      {
        paginationArguments.current_page > 2 && paginationArguments.last_page > 2 &&
        <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm">...</span>
      }
      {/* current page box */}
      {
        paginationArguments.current_page > 1 && paginationArguments.current_page < paginationArguments.last_page && 
        <button className={paginationButtonClassesSetter(paginationArguments.current_page)}>{paginationArguments.current_page}</button>
      }
      {/* dot boxes.  */}
      {
        paginationArguments.last_page > paginationArguments.current_page + 1 &&
        <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm">...</span>
      }
      {/* last page */}
      {
        paginationArguments.last_page > 1 &&
        <button onClick={() => goToPage(paginationArguments.last_page)} className={paginationButtonClassesSetter(paginationArguments.last_page)}>{paginationArguments.last_page}</button>
      }
      {/* Next arrow */}
      <button
        className="mr-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        onClick={() => goToPage(paginationArguments.current_page + 1)}
        disabled={paginationArguments.last_page == paginationArguments.current_page}>
        <ArrowLeftIcon/>
      </button>
    </>
  );

  const setPerPage = (perPageCount:number):void => {
    if (perPageCount == 0) return;
    removeFromFilter('page');
    setFilter('per_page', perPageCount);
    reloadTableData();
  }

  return (
    <div className="border-t border-gray-100 pt-3 pl-[18px] pr-4 dark:border-gray-800">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <p className="border-t border-gray-100 pt-3 space-x-1 text-center text-sm font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 xl:border-t-0 xl:pt-0 xl:text-left">
          <span>نمایش رکوردهای</span>
          <span>{paginationArguments.from}</span>
          <span>تا</span>
          <span>{paginationArguments.to}</span>
          <span>از</span>
          <span>{paginationArguments.total}</span>
        </p>
        
        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-0.5 pt-4 xl:justify-end xl:pt-0">
          {paginationControls}
        </div>


        <div className="flex items-center justify-center gap-3">
          <span className="text-gray-500 dark:text-gray-400">تعداد </span>
          <div className="relative w-32">
            <select
              className="dark:bg-dark-900 h-9 w-full appearance-none rounded-lg border border-gray-300 bg-transparent py-2 pl-3 pr-8 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-500 dark:text-gray-400"
              defaultValue="0"
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              <option value="0">--</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>

            <span className="pointer-events-none absolute right-2 top-1/2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <span className="text-gray-500 dark:text-gray-400">رکورد</span>
        </div>
      </div>
    </div>
  );
}
